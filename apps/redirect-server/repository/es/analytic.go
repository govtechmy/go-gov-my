package es

import (
	"context"
	"redirect-server/repository"

	"github.com/olivere/elastic/v7"
)

const (
	redirectIndex = "redirect_metadata"
)

type AnalyticRepo struct {
	esClient *elastic.Client
}

func NewAnalyticRepo(esClient *elastic.Client) *AnalyticRepo {
	return &AnalyticRepo{esClient: esClient}
}

func (r *AnalyticRepo) SaveAggregatedAnalytic(ctx context.Context, analytics *repository.KafkaLinkAnalyticsMessage ) error {
	_, err := r.esClient.Index().
		Index(redirectIndex).
		BodyJson(analytics).
		Do(ctx)
	return err
}
