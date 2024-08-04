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
	"redirect-server/repository"
	"redirect-server/repository/es"
	"time"

	"github.com/IBM/sarama"
	"github.com/olivere/elastic/v7"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.uber.org/zap"
)

// Change this interval in Production to 5 minutes
const SEND_INTERVAL = 1 * time.Minute

type application struct {
	kafkaConsumer      sarama.PartitionConsumer
	kafkaProducer      sarama.SyncProducer
	kafkaProducerTopic string
	lastSendAttemptAt  time.Time
	linkAnalytics      map[string]*LinkAnalytics
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
	{
		flag.StringVar(&kafkaAddr, "kafka-addr", os.Getenv("KAFKA_ADDR"), "Kafka address e.g. localhost:9092")
		flag.StringVar(&kafkaProducerTopic, "producer-topic", "link_analytics", "Kafka producer topic")
		flag.StringVar(&kafkaConsumerTopic, "consumer-topic", "redirect_logs", "Kafka consumer topic")
		flag.StringVar(&offsetPath, "offset-path", "./analytics-aggregator-offset", "Analytics aggregator offset")
		flag.StringVar(&elasticURL, "elastic-url", os.Getenv("ELASTIC_URL"), "Elasticsearch URL e.g. http://localhost:9200")
		flag.StringVar(&elasticUser, "elastic-user", os.Getenv("ELASTIC_USER"), "Elasticsearch username")
		flag.StringVar(&elasticPassword, "elastic-password", os.Getenv("ELASTIC_PASSWORD"), "Elasticsearch password")
	}
	flag.Parse()

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

	consumer, err := sarama.NewConsumer([]string{kafkaAddr}, nil)
	if err != nil {
		panic(err)
	}
	defer func() {
		if err := consumer.Close(); err != nil {
			log.Fatalln(err)
		}
	}()

	partitionConsumer, err := consumer.ConsumePartition(kafkaConsumerTopic, 0, sarama.OffsetNewest)
	if err != nil {
		panic(err)
	}
	defer func() {
		if err := partitionConsumer.Close(); err != nil {
			log.Fatalln(err)
		}
	}()

	// Send analytics every SEND_INTERVAL
	ticker := time.NewTicker(SEND_INTERVAL)
	defer ticker.Stop()

	app := &application{
		kafkaConsumer:      partitionConsumer,
		kafkaProducer:      kafkaProducer,
		kafkaProducerTopic: kafkaProducerTopic,
		lastSendAttemptAt:  time.Now(),
		linkAnalytics:      make(map[string]*LinkAnalytics),
		esRepo:             esRepo,
	}

	for {
		select {
		case msg := <-app.kafkaConsumer.Messages():
			var log RedirectMetadataLog
			err := json.Unmarshal(msg.Value, &log)
			if err != nil {
				slog.Error("failed to unmarshal kafka message")
				break
			}
			app.aggregateRedirectMetadata(log.RedirectMetadata)
		case <-ticker.C:
			if len(app.linkAnalytics) == 0 {
				// no analytics to send, skip sending kafka message
				break
			}
			err := app.sendAnalytics()
			if err != nil {
				slog.Error("failed to send analytics", slog.String("errMessage", err.Error()))
			}
		}

	}
}

func (app application) aggregateRedirectMetadata(rm repository.RedirectMetadata) {
	a := app.linkAnalytics[rm.LinkID]
	if a == nil {
		a = NewLinkAnalytics(rm.LinkID)
		app.linkAnalytics[rm.LinkID] = a
	}

	a.Total += 1
	a.LinkSlug[rm.LinkSlug] += 1
	a.LinkUrl[rm.LinkURL] += 1
	if rm.CountryCode != "" {
		a.CountryCode[rm.CountryCode] += 1
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

func (app *application) sendAnalytics() error {

	// TODO: Refactor this to use the repository.LinkAnalytics struct

	linkAnalyticsList := make([]LinkAnalytics, 0)

	for _, a := range app.linkAnalytics {
		linkAnalyticsList = append(linkAnalyticsList, *a)
	}

	lastSendAttemptAt := app.lastSendAttemptAt
	now := time.Now()
	shortDate := now.Format("2006-01-02")

	message := KafkaLinkAnalyticsMessage{
		AggregatedDate: shortDate,
		From:           lastSendAttemptAt,
		To:             now,
		LinkAnalytics:  linkAnalyticsList,
	}

	// Map to repository.LinkAnalytics for Elasticsearch
	l := make([]repository.LinkAnalytics, len(linkAnalyticsList))
	for i, a := range linkAnalyticsList {
		l[i] = repository.LinkAnalytics{
			LinkID:          a.LinkID,
			Total:           a.Total,
			LinkSlug:        a.LinkSlug,
			LinkUrl:         a.LinkUrl,
			CountryCode:     a.CountryCode,
			DeviceType:      a.DeviceType,
			Browser:         a.Browser,
			OperatingSystem: a.OperatingSystem,
			Referer:         a.Referer,
		}
	}

	m := repository.KafkaLinkAnalyticsMessage{
		AggregatedDate: shortDate,
		From:           lastSendAttemptAt,
		To:             now,
		LinkAnalytics:  l,
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
		err = app.esRepo.SaveAggregatedAnalytic(context.Background(), &m)
		if err != nil {
			return err
		}

		slog.Info("elasticsearch document created")
	
		app.lastSendAttemptAt = now
		app.linkAnalytics = make(map[string]*LinkAnalytics)
		return nil
	}

	return errors.New("failed to send kafka message, no more retries")
}
