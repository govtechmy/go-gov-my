package main

import (
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"log"
	"log/slog"
	"os"
	"os/signal"
	"redirect-server/repository"
	"redirect-server/repository/es"
	"syscall"
	"time"

	"github.com/IBM/sarama"
	"github.com/olivere/elastic/v7"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.uber.org/zap"
)

// Change this interval in Production to 5 minutes
const SEND_INTERVAL = 1 * time.Minute

type application struct {
	// Lets use consumer by group
	kafkaConsumerGroup sarama.ConsumerGroup
	kafkaProducer      sarama.SyncProducer
	kafkaProducerTopic string
	esRepo             *es.AnalyticRepo
	failedSavesLogFile *os.File
}

type RedirectMetadataLog struct {
	RedirectMetadata repository.RedirectMetadata `json:"redirectMetadata"`
}

func verifyKafkaConnection(brokers []string) error {
	config := sarama.NewConfig()
	config.Version = sarama.V2_1_0_0

	// Create admin client
	admin, err := sarama.NewClusterAdmin(brokers, config)
	if err != nil {
		return fmt.Errorf("failed to create admin client: %w", err)
	}
	defer admin.Close()

	// List topics to verify connection
	topics, err := admin.ListTopics()
	if err != nil {
		return fmt.Errorf("failed to list topics: %w", err)
	}

	slog.Info("Successfully connected to Kafka", 
		slog.Int("numTopics", len(topics)))
	return nil
}

func main() {

	loggerConfig := zap.NewProductionConfig()
	loggerConfig.OutputPaths = []string{"stdout"}
	logger := zap.Must(loggerConfig.Build())

	// golang-lint mentioned it should check for err
	defer func() {
		if err := logger.Sync(); err != nil {
			fmt.Fprintf(os.Stderr, "Failed to sync logger: %v\n", err)
		}
	}()

	var kafkaAddr string
	var kafkaProducerTopic string
	var kafkaConsumerTopic string
	var elasticURL string
	var elasticUser string
	var elasticPassword string
	var groupID string
	var failedSavesLogPath string
	{
		flag.StringVar(&kafkaAddr, "kafka-addr", os.Getenv("KAFKA_ADDR"), "Kafka address e.g. broker:29092")
		flag.StringVar(&kafkaProducerTopic, "producer-topic", os.Getenv("KAFKA_ANALYTIC_TOPIC"), "Kafka producer topic")
		flag.StringVar(&kafkaConsumerTopic, "consumer-topic", os.Getenv("KAFKA_REDIRECT_LOGS_TOPIC"), "Kafka consumer topic")
		// Declare the Group ID
		flag.StringVar(&groupID, "group-id", os.Getenv("KAFKA_GROUP_ID_ANALYTICS_AGGREGATOR"), "Kafka consumer group ID")
		flag.StringVar(&elasticURL, "elastic-url", os.Getenv("ELASTIC_URL"), "Elasticsearch URL e.g. http://localhost:9200")
		flag.StringVar(&elasticUser, "elastic-user", os.Getenv("ELASTIC_USER"), "Elasticsearch username")
		flag.StringVar(&elasticPassword, "elastic-password", os.Getenv("ELASTIC_PASSWORD"), "Elasticsearch password")
		flag.StringVar(&failedSavesLogPath, "failed-saves-path", os.Getenv("FAILED_SAVES_LOG_PATH"), "Path to a file that stores redirect metadatas which failed to save to Elasticsearch")
	}
	flag.Parse()

	// Verify Kafka connection before starting
	brokers := []string{kafkaAddr}
	for i := 0; i < 5; i++ {
		if err := verifyKafkaConnection(brokers); err != nil {
			slog.Error("Failed to verify Kafka connection", 
				slog.String("error", err.Error()),
				slog.Int("attempt", i+1))
			time.Sleep(time.Second * 5)
			continue
		}
		break
	}

	// Config AutoCommit to false
	config := sarama.NewConfig()
	config.Version = sarama.V2_1_0_0
	config.Consumer.Group.Rebalance.Strategy = sarama.NewBalanceStrategyRoundRobin()
	config.Consumer.Offsets.Initial = sarama.OffsetNewest
	config.Consumer.Offsets.AutoCommit.Enable = false // Disable auto-commit
	config.Net.DialTimeout = time.Second * 30
	config.Net.ReadTimeout = time.Second * 30
	config.Net.WriteTimeout = time.Second * 30

	esClient, err1 := elastic.NewSimpleClient(
		elastic.SetURL(elasticURL),
		elastic.SetBasicAuth(elasticUser, elasticPassword),
		elastic.SetHttpClient(otelhttp.DefaultClient),
		elastic.SetRetrier(NewElasticRetrier()),
	)

	if err1 != nil {
		logger.Fatal("cannot initiate Elasticsearch client", zap.Error(err1))
	}

	esRepo := es.NewAnalyticRepo(esClient)

	kafkaProducer, err2 := sarama.NewSyncProducer([]string{kafkaAddr}, nil)
	if err2 != nil {
		panic(err2)
	}
	defer func() {
		err := kafkaProducer.Close()
		if err != nil {
			log.Fatalln(err)
		}
	}()

	// Add retry logic for Kafka connection
	var consumerGroup sarama.ConsumerGroup
	var err error
	retries := 5
	for retries > 0 {
		consumerGroup, err = sarama.NewConsumerGroup([]string{kafkaAddr}, groupID, config)
		if err != nil {
			slog.Error("Failed to create consumer group", 
				slog.String("error", err.Error()),
				slog.Int("retriesLeft", retries))
			retries--
			time.Sleep(time.Second * 5)
			continue
		}
		break
	}
	if err != nil {
		slog.Error("Failed to create consumer group after all retries", 
			slog.String("error", err.Error()))
		os.Exit(1)
	}
	defer func() {
		if err := consumerGroup.Close(); err != nil {
			slog.Error("Failed to close consumer group", 
				slog.String("error", err.Error()))
		}
	}()

	if failedSavesLogPath == "" {
		log.Fatalln("FAILED_SAVES_LOG_PATH is not set")
	}
	failedSavesLogFile, err := os.OpenFile(failedSavesLogPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		panic(err)
	}
	defer failedSavesLogFile.Close()

	// Send analytics every SEND_INTERVAL
	ticker := time.NewTicker(SEND_INTERVAL)
	defer ticker.Stop()

	app := &application{
		// Init the consumer group
		kafkaConsumerGroup: consumerGroup,
		kafkaProducer:      kafkaProducer,
		kafkaProducerTopic: kafkaProducerTopic,
		esRepo:             esRepo,
		failedSavesLogFile: failedSavesLogFile,
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	if kafkaConsumerTopic == "" {
		slog.Error("KAFKA_REDIRECT_LOGS_TOPIC is not set")
		os.Exit(1)
	}

	slog.Info("starting analytics aggregator",
		slog.String("kafkaAddr", kafkaAddr),
		slog.String("kafkaConsumerTopic", kafkaConsumerTopic),
		slog.String("groupID", groupID))

	go func() {
		for {
			slog.Info("starting consumer group session")
			topics := []string{kafkaConsumerTopic}
			slog.Info("attempting to consume from topics", 
				slog.Any("topics", topics))
			if err := consumerGroup.Consume(ctx, topics, app); err != nil {
				slog.Error("Error from consumer", 
					slog.String("error", err.Error()),
					slog.Any("topics", topics))
				time.Sleep(time.Second)
				continue
			}
			if ctx.Err() != nil {
				return
			}
		}
	}()

	sigterm := make(chan os.Signal, 1)
	signal.Notify(sigterm, syscall.SIGINT, syscall.SIGTERM)
	<-sigterm
	cancel()
}

func (app *application) Setup(_ sarama.ConsumerGroupSession) error {
	return nil
}

func (app *application) Cleanup(_ sarama.ConsumerGroupSession) error {
	return nil
}

func (app *application) ConsumeClaim(sess sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
    slog.Info("starting to consume messages", 
        slog.String("topic", claim.Topic()),
        slog.Int("partition", int(claim.Partition())))

    // Initialize analytics map and time tracking
    linkAnalytics := make(map[string]*repository.LinkAnalytics)
    lastSendTime := time.Now()
    ticker := time.NewTicker(SEND_INTERVAL)
    defer ticker.Stop()

    for {
        select {
        case msg, ok := <-claim.Messages():
            if !ok {
                slog.Info("message channel closed")
                return nil
            }
            
            slog.Info("received message", 
                slog.String("topic", msg.Topic),
                slog.Int("partition", int(msg.Partition)),
                slog.Int64("offset", msg.Offset))

            var metadataLog RedirectMetadataLog
            if err := json.Unmarshal(msg.Value, &metadataLog); err != nil {
                slog.Error("failed to unmarshal message", 
                    slog.String("error", err.Error()),
                    slog.String("message", string(msg.Value)))
                continue
            }

            slog.Info("parsed message successfully",
                slog.String("linkId", metadataLog.RedirectMetadata.LinkID),
                slog.String("linkSlug", metadataLog.RedirectMetadata.LinkSlug))

            // Save to Elasticsearch
            err := app.saveIndividualMetadata(metadataLog.RedirectMetadata)
            if err != nil {
                slog.Error("failed to save to elasticsearch", 
                    slog.String("error", err.Error()))
                // Save to fallback file
                if err := app.saveIndividualMetadataToFallback(metadataLog.RedirectMetadata); err != nil {
                    slog.Error("failed to save to fallback", 
                        slog.String("error", err.Error()))
                }
            }

            // Aggregate analytics
            app.aggregateRedirectMetadata(linkAnalytics, metadataLog.RedirectMetadata)

            // Mark message as processed
            sess.MarkMessage(msg, "")

        case <-ticker.C:
            // Send analytics if we have any data and enough time has passed
            if len(linkAnalytics) > 0 {
                now := time.Now()
                if err := app.sendAnalytics(linkAnalytics, lastSendTime, now); err != nil {
                    slog.Error("failed to send analytics", 
                        slog.String("error", err.Error()))
                } else {
                    slog.Info("sent analytics successfully",
                        slog.Int("numAnalytics", len(linkAnalytics)),
                        slog.Time("from", lastSendTime),
                        slog.Time("to", now))
                    // Reset analytics and update last send time
                    linkAnalytics = make(map[string]*repository.LinkAnalytics)
                    lastSendTime = now
                }
            }

        case <-sess.Context().Done():
            slog.Info("context cancelled, stopping consumer")
            // Send any remaining analytics before stopping
            if len(linkAnalytics) > 0 {
                now := time.Now()
                if err := app.sendAnalytics(linkAnalytics, lastSendTime, now); err != nil {
                    slog.Error("failed to send final analytics", 
                        slog.String("error", err.Error()))
                }
            }
            return nil
        }
    }
}

func (app *application) aggregateRedirectMetadata(linkAnalytics map[string]*repository.LinkAnalytics, rm repository.RedirectMetadata) {
	a := linkAnalytics[rm.LinkID]
	if a == nil {
		a = repository.NewLinkAnalytics(rm.LinkID)
		linkAnalytics[rm.LinkID] = a
	}

	a.Total += 1
	a.LinkSlug[rm.LinkSlug] += 1
	a.LinkUrl[rm.LinkURL] += 1
	if rm.CountryCode != "" {
		a.CountryCode[rm.CountryCode] += 1
	}
	if rm.City != "" {
		a.City[rm.City] += 1
	}
	if rm.DeviceType != "" {
		a.DeviceType[rm.DeviceType] += 1
	}
	if rm.Browser != "" {
		a.Browser[rm.Browser] += 1
	}
	if rm.OperatingSystem != "" {
		a.OperatingSystem[rm.OperatingSystem] += 1
	}
	if rm.Referer != "" {
		a.Referer[rm.Referer] += 1
	}
	if rm.ASN != "" {
		found := false
		for i, asnInfo := range a.ASN {
			if asnInfo.ASN == rm.ASN && asnInfo.Organization == rm.ASNOrganization {
				a.ASN[i].Clicks++
				found = true
				break
			}
		}
		if !found {
			a.ASN = append(a.ASN, repository.ASNInfo{
				ASN:          rm.ASN,
				Organization: rm.ASNOrganization,
				Clicks:       1,
			})
		}
	}
}

func (app *application) sendAnalytics(linkAnalytics map[string]*repository.LinkAnalytics, from time.Time, to time.Time) error {
	linkAnalyticsList := make([]repository.LinkAnalytics, 0)
	for _, a := range linkAnalytics {
		linkAnalyticsList = append(linkAnalyticsList, *a)
	}

	message := repository.KafkaLinkAnalyticsMessage{
		AggregatedDate: from.Format("2006-01-02"),
		From:           from,
		To:             to,
		LinkAnalytics:  linkAnalyticsList,
	}

	json, err := json.Marshal(message)
	if err != nil {
		return err
	}

	retries := 3
	for retries > 0 {
		partition, offset, err := app.kafkaProducer.SendMessage(&sarama.ProducerMessage{
			Topic: app.kafkaProducerTopic,
			Value: sarama.ByteEncoder(json),
		})

		// Retry writing the message
		if err != nil {
			retries--
			slog.Error(
				"failed to send kafka message",
				slog.Int("retriesLeft", retries),
				slog.String("errMessage", err.Error()),
			)
			time.Sleep(time.Millisecond * 500)
			continue
		}

		slog.Info("kafka message sent",
			slog.Int("numAnalytics", len(linkAnalyticsList)),
			slog.String("topic", app.kafkaProducerTopic),
			slog.Int("partition", int(partition)),
			slog.Int("offset", int(offset)),
		)

		return nil
	}

	return errors.New("failed to send kafka message, no more retries")
}

func (app *application) saveIndividualMetadata(metadata repository.RedirectMetadata) error {
	return app.esRepo.SaveIndividualAnalytic(context.Background(), &metadata)
}

// Write the redirect metadata to a file in case saving to Elasticsearch fails
func (app *application) saveIndividualMetadataToFallback(metadata repository.RedirectMetadata) error {
	jsonData, err := json.Marshal(metadata)
	if err != nil {
		return err
	}
	jsonData = append(jsonData, '\n')

	_, err = app.failedSavesLogFile.Write(jsonData)
	if err != nil {
		return err
	}

	return nil
}
