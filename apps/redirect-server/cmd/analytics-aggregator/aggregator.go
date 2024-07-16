package main

import (
	"context"
	"log/slog"
	"os"
	"redirect-server/repository/es"
	"time"
)

type Aggregator struct {
	OffsetPath           string
	RedirectMetadataRepo *es.RedirectMetadataRepo
	KafkaProducer        *KafkaProducer
}

func (a *Aggregator) Run(ctx context.Context) error {
	now := time.Now()
	shortDate := now.Format("2006-01-02")
	offset, err := a.getOffset()
	if err != nil {
		return err
	}

	slog.Info("getting redirect metadata")
	redirectMetadata, err := a.RedirectMetadataRepo.GetRedirectMetadata(ctx, offset, now)
	if err != nil {
		return err
	}

	slog.Info("aggregating redirect metadata")
	linkAnalytics, err := aggregateRedirectMetadata(redirectMetadata, shortDate)
	if err != nil {
		return err
	}

	slog.Info("sending link analytics to Kafka",
		slog.Int("numAnalytics", len(linkAnalytics)),
	)
	err = a.KafkaProducer.SendLinkAnalytics(ctx, linkAnalytics)
	if err != nil {
		return err
	}

	err = a.saveOffset(now)
	if err != nil {
		return err
	}

	slog.Info("analytics sent", slog.String("shortDate", shortDate))
	return nil
}

func (a *Aggregator) getOffset() (time.Time, error) {
	data, err := os.ReadFile(a.OffsetPath)
	if os.IsNotExist(err) {
		// If offset not found, use the time N minutes ago
		fiveMinutesAgo := time.Now().Add(-AGGREGATE_INTERVAL)
		return fiveMinutesAgo, nil
	}
	if err != nil {
		return time.Time{}, err
	}

	t, err := time.Parse(time.RFC3339, string(data))
	if err != nil {
		return time.Time{}, err
	}

	return t, nil
}

func (a *Aggregator) saveOffset(t time.Time) error {
	err := os.WriteFile(a.OffsetPath, []byte(t.Format(time.RFC3339)), 0644)
	if err != nil {
		return err
	}

	return nil
}
