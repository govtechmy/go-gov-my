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
}

type RedirectMetadataLog struct {
	RedirectMetadata repository.RedirectMetadata `json:"redirectMetadata"`
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
	var offsetPath string
	var elasticURL string
	var elasticUser string
	var elasticPassword string
	var groupID string
	{
		flag.StringVar(&kafkaAddr, "kafka-addr", os.Getenv("KAFKA_ADDR"), "Kafka address e.g. localhost:9092")
		flag.StringVar(&kafkaProducerTopic, "producer-topic", "link_analytics", "Kafka producer topic")
		flag.StringVar(&kafkaConsumerTopic, "consumer-topic", "redirect_logs", "Kafka consumer topic")
		// Declare the Group ID
		flag.StringVar(&groupID, "group-id", "analytics-aggregator", "Kafka consumer group ID")
		flag.StringVar(&offsetPath, "offset-path", "./analytics-aggregator-offset", "Analytics aggregator offset")
		flag.StringVar(&elasticURL, "elastic-url", os.Getenv("ELASTIC_URL"), "Elasticsearch URL e.g. http://localhost:9200")
		flag.StringVar(&elasticUser, "elastic-user", os.Getenv("ELASTIC_USER"), "Elasticsearch username")
		flag.StringVar(&elasticPassword, "elastic-password", os.Getenv("ELASTIC_PASSWORD"), "Elasticsearch password")
	}
	flag.Parse()

	// Config AutoCommit to false
	config := sarama.NewConfig()
	config.Version = sarama.V2_1_0_0
	config.Consumer.Group.Rebalance.Strategy = sarama.NewBalanceStrategyRoundRobin()
	config.Consumer.Offsets.Initial = sarama.OffsetNewest
	config.Consumer.Offsets.AutoCommit.Enable = false // Disable auto-commit

	esClient, err := elastic.NewSimpleClient(
		elastic.SetURL(elasticURL),
		elastic.SetBasicAuth(elasticUser, elasticPassword),
		elastic.SetHttpClient(otelhttp.DefaultClient),
	)

	if err != nil {
		logger.Fatal("cannot initiate Elasticsearch client", zap.Error(err))
	}

	esRepo := es.NewAnalyticRepo(esClient)

	kafkaProducer, err := sarama.NewSyncProducer([]string{kafkaAddr}, nil)
	if err != nil {
		panic(err)
	}
	defer func() {
		err := kafkaProducer.Close()
		if err != nil {
			log.Fatalln(err)
		}
	}()

	// Change this to use Consumer Group instead of Consumer and send by group
	consumerGroup, err := sarama.NewConsumerGroup([]string{kafkaAddr}, groupID, config)
	if err != nil {
		panic(err)
	}
	defer func() {
		if err := consumerGroup.Close(); err != nil {
			log.Fatalln(err)
		}
	}()

	// Send analytics every SEND_INTERVAL
	ticker := time.NewTicker(SEND_INTERVAL)
	defer ticker.Stop()

	app := &application{
		// Init the consumer group
		kafkaConsumerGroup: consumerGroup,
		kafkaProducer:      kafkaProducer,
		kafkaProducerTopic: kafkaProducerTopic,
		esRepo:             esRepo,
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go func() {
		for {
			// Tell the kafka to consume the message with the group config
			if err := consumerGroup.Consume(ctx, []string{kafkaConsumerTopic}, app); err != nil {
				log.Fatalf("Error from consumer: %v", err)
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
	ticker := time.NewTicker(SEND_INTERVAL)
	defer ticker.Stop()

	// Make a map of link IDs to their aggregated analytics
	linkAnalytics := make(map[string]*repository.LinkAnalytics)

	// Keep track of the time between send intervals
	var intervalStart time.Time = time.Now()

	for {
		select {
		case msg := <-claim.Messages():
			var log RedirectMetadataLog
			err := json.Unmarshal(msg.Value, &log)
			if err != nil {
				break
			}
			app.aggregateRedirectMetadata(linkAnalytics, log.RedirectMetadata)
			sess.MarkMessage(msg, "") // https://github.com/IBM/sarama/issues/1780

		case <-ticker.C:
			if len(linkAnalytics) > 0 {
				intervalEnd := time.Now()
				err := app.sendAnalytics(linkAnalytics, intervalStart, intervalEnd) // Send the analytics aggregated
				if err != nil {
					slog.Error("failed to send analytics",
						slog.String("errorMessage:", err.Error()),
					)
				} else {
					sess.Commit()                                              // Commit the offset after successful processing
					linkAnalytics = make(map[string]*repository.LinkAnalytics) // Re-make the link analytics map
					intervalStart = intervalEnd                                // Update interval start time
				}
			}
		
		// Not sure why this happen but it seems like it doesn't dispose the context properly...
		case <-sess.Context().Done():
			return nil
		}
	}
}

func (app application) aggregateRedirectMetadata(linkAnalytics map[string]*repository.LinkAnalytics, rm repository.RedirectMetadata) {
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

		// Send data to Elasticsearch
		err = app.esRepo.SaveAggregatedAnalytic(context.Background(), &message)
		if err != nil {
			return err
		}

		slog.Info("elasticsearch document created")

		return nil
	}

	return errors.New("failed to send kafka message, no more retries")
}
