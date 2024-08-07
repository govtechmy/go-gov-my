package es

import (
	"context"
	"encoding/json"

	"redirect-server/repository"

	"github.com/olivere/elastic/v7"
)

const idempotentResourceIndex = "idempotent_resources"

type IdempotentResourceRepo struct {
	esClient *elastic.Client
}

func NewIdempotentResourceRepo(esClient *elastic.Client) *IdempotentResourceRepo {
	return &IdempotentResourceRepo{esClient: esClient}
}

func (r *IdempotentResourceRepo) GetSavedIdempotentResource(ctx context.Context, idempotencyKey string) (*repository.IdempotentResource, error) {
	res, err := r.esClient.Search().
		Index(idempotentResourceIndex).
		Query(
			elastic.NewTermQuery("idempotency_key", idempotencyKey),
		).
		Size(1).
		Do(ctx)
	if err != nil {
		return nil, err
	}

	// No saved idempotent resource
	if len(res.Hits.Hits) == 0 {
		return nil, nil
	}

	var savedIdempotentResource repository.IdempotentResource
	if err := json.Unmarshal(res.Hits.Hits[0].Source, &savedIdempotentResource); err != nil {
		return nil, err
	}

	return &savedIdempotentResource, nil
}

func (r *IdempotentResourceRepo) SaveIdempotentResource(ctx context.Context, req repository.IdempotentResource) error {
	_, err := r.esClient.Index(). // not thread-safe
					Index(idempotentResourceIndex).
					Id(req.IdempotencyKey).
					BodyJson(req).
					Do(ctx)
	return err
}
