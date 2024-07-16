package main

import (
	"context"
	"log/slog"
	"redirect-server/repository/es"
	"time"
)

func main() {
	ctx := context.Background()
	redirectMetadataRepo := es.NewRedirectMetadataRepo()
	todayShortDate := time.Now().Format("2006-01-02")

	kp := NewKafkaProducer("localhost:9200", "link-analytics")
	defer kp.Close()

	slog.Info("getting redirect metadata")
	redirectMetadata, err := redirectMetadataRepo.GetRedirectMetadata(ctx)
	if err != nil {
		panic(err)
	}

	slog.Info("aggregating redirect metadata")
	linkAnalytics, err := aggregateRedirectMetadata(redirectMetadata, todayShortDate)
	if err != nil {
		panic(err)
	}

	slog.Info("sending aggregated metadata to Kafka")
	err = kp.SendLinkAnalytics(ctx, linkAnalytics)
	if err != nil {
		panic(err)
	}

	slog.Info("finished without error")
}
