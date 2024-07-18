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
	slog.Info("getting redirect metadata")
	redirectMetadata, err := a.RedirectMetadataRepo.GetRedirectMetadata(ctx, from, to)
	if err != nil {
		return nil, err
	}

	slog.Info("aggregating redirect metadata")
	linkAnalytics, err := aggregateRedirectMetadata(redirectMetadata)
	if err != nil {
		return nil, err
	}

	return linkAnalytics, nil
}
