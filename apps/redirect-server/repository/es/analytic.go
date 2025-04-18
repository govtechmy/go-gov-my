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

func (r *AnalyticRepo) SaveIndividualAnalytic(ctx context.Context, redirectMetadata *repository.RedirectMetadata) error {
	_, err := r.esClient.Index().
		Id(redirectMetadata.ID).
		Index(redirectIndex).
		BodyJson(redirectMetadata).
		Do(ctx)
	return err
}
