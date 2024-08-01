package main

import (
	"encoding/json"
	"errors"
	"flag"
	"log"
	"log/slog"
	"os"
	"redirect-server/repository"
	"time"

	"github.com/IBM/sarama"
)

const SEND_INTERVAL = 1 * time.Minute

type application struct {
	kafkaConsumer      sarama.PartitionConsumer
	kafkaProducer      sarama.SyncProducer
	kafkaProducerTopic string
	lastSendAttemptAt  time.Time
	linkAnalytics      map[string]*LinkAnalytics
}

type RedirectMetadataLog struct {
	RedirectMetadata repository.RedirectMetadata `json:"redirectMetadata"`
}

func main() {
	var kafkaAddr string
	var kafkaProducerTopic string
	var kafkaConsumerTopic string
	var offsetPath string
	{
		flag.StringVar(&kafkaAddr, "kafka-addr", os.Getenv("KAFKA_ADDR"), "Kafka address e.g. localhost:9092")
		flag.StringVar(&kafkaProducerTopic, "producer-topic", "link_analytics", "Kafka producer topic")
		flag.StringVar(&kafkaConsumerTopic, "consumer-topic", "redirect_logs", "Kafka consumer topic")
		flag.StringVar(&offsetPath, "offset-path", "./analytics-aggregator-offset", "Analytics aggregator offset")
	}
	flag.Parse()

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
		app.lastSendAttemptAt = now
		app.linkAnalytics = make(map[string]*LinkAnalytics)
		return nil
	}

	return errors.New("failed to send kafka message, no more retries")
}
