package main

import (
	"context"
	"log/slog"
	"redirect-server/repository/es"
	"time"
)

type Aggregator struct {
	OffsetPath           string
	RedirectMetadataRepo *es.RedirectMetadataRepo
	KafkaProducer        *KafkaProducer
}

func (a *Aggregator) Run(ctx context.Context, shortDate string, from time.Time, to time.Time) error {
	slog.Info("getting redirect metadata")
	redirectMetadata, err := a.RedirectMetadataRepo.GetRedirectMetadata(ctx, from, to)
	if err != nil {
		return err
	}

	slog.Info("aggregating redirect metadata")
	linkAnalytics, err := aggregateRedirectMetadata(redirectMetadata)
	if err != nil {
		return err
	}

	slog.Info("sending link analytics to Kafka",
		slog.Int("numAnalytics", len(linkAnalytics)),
	)
	err = a.KafkaProducer.SendLinkAnalytics(ctx, shortDate, from, to, linkAnalytics)
	if err != nil {
		return err
	}

	slog.Info("analytics sent", slog.String("shortDate", shortDate))
	return nil
}
