package main

import (
	"context"
	"log/slog"
	"redirect-server/repository/es"
	"time"
)

type Aggregator struct {
	RedirectMetadataRepo *es.RedirectMetadataRepo
}

func (a *Aggregator) Run(ctx context.Context, from time.Time, to time.Time) ([]LinkAnalytics, error) {
	redirectMetadata, err := a.RedirectMetadataRepo.GetRedirectMetadata(ctx, from, to)
	if err != nil {
		return nil, err
	}
	slog.Info("fetched redirect metadata", slog.Int("numRedirectMetadata", len(redirectMetadata)))

	linkAnalytics, err := aggregateRedirectMetadata(redirectMetadata)
	if err != nil {
		return nil, err
	}

	return linkAnalytics, nil
}
