package main

import (
	"context"
	"flag"
	"log/slog"
	"os"
	"redirect-server/repository/es"
	"time"
)

func main() {
	var kafkaAddr string
	var kafkaTopic string
	var offsetPath string
	flag.StringVar(&kafkaAddr, "kafka-addr", "localhost:9092", "Kafka address")
	flag.StringVar(&kafkaTopic, "kafka-topic", "link-analytics", "Kafka topic")
	flag.StringVar(&offsetPath, "offset-path", "./analytics-aggregator-offset", "Analytics aggregator offset")
	flag.Parse()

	ctx := context.Background()
	redirectMetadataRepo := es.NewRedirectMetadataRepo()

	now := time.Now()
	shortDate := now.Format("2006-01-02")
	offset, err := getOffset(offsetPath)
	if err != nil {
		panic(err)
	}
	if offset == nil {
		fiveMinutesAgo := now.Add(-5 * time.Minute)
		offset = &fiveMinutesAgo
	}

	kp := NewKafkaProducer(kafkaAddr, kafkaTopic)
	defer kp.Close()

	slog.Info("getting redirect metadata")
	redirectMetadata, err := redirectMetadataRepo.GetRedirectMetadata(ctx, *offset, now)
	if err != nil {
		panic(err)
	}

	slog.Info("aggregating redirect metadata")
	linkAnalytics, err := aggregateRedirectMetadata(redirectMetadata, shortDate)
	if err != nil {
		panic(err)
	}

	slog.Info("sending aggregated metadata to Kafka")
	err = kp.SendLinkAnalytics(ctx, linkAnalytics)
	if err != nil {
		panic(err)
	}

	err = saveOffset(offsetPath, now)
	if err != nil {
		panic(err)
	}

	slog.Info("analytics sent", slog.String("shortDate", shortDate))
}

func getOffset(offsetPath string) (*time.Time, error) {
	data, err := os.ReadFile(offsetPath)
	if os.IsNotExist(err) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	t, err := time.Parse(time.RFC3339, string(data))
	if err != nil {
		return nil, err
	}

	return &t, nil
}

func saveOffset(offsetPath string, t time.Time) error {
	err := os.WriteFile(offsetPath, []byte(t.Format(time.RFC3339)), 0644)
	if err != nil {
		return err
	}

	return nil
}
