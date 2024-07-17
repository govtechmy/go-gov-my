package es

import (
	"context"
	"encoding/json"
	"errors"
	"redirect-server/repository"
	"time"

	"github.com/olivere/elastic/v7"
)

const REDIRECT_METADATA_INDEX = "redirect_metadata"

var (
	ErrFetchingRedirectMetadata      = errors.New("failed to fetch redirect metadata from elasticsearch")
	ErrUnmarshallingRedirectMetadata = errors.New("failed to unmarshal redirect metadata")
)

type RedirectMetadataRepo struct {
	esClient *elastic.Client
}

func NewRedirectMetadataRepo(esClient *elastic.Client) *RedirectMetadataRepo {
	return &RedirectMetadataRepo{
		esClient: esClient,
	}
}

func (r *RedirectMetadataRepo) GetRedirectMetadata(ctx context.Context, from time.Time, to time.Time) ([]repository.RedirectMetadata, error) {
	res, err := r.esClient.Search().
		Index(REDIRECT_METADATA_INDEX).
		Query(
			elastic.NewRangeQuery("timestamp").
				Gte(from).
				Lt(to),
		).
		Do(ctx)
	if err != nil {
		return nil, ErrFetchingRedirectMetadata
	}

	metadata := make([]repository.RedirectMetadata, res.TotalHits())

	for _, hit := range res.Hits.Hits {
		redirectMetadata := repository.RedirectMetadata{}
		err = json.Unmarshal(hit.Source, &redirectMetadata)
		if err != nil {
			return nil, ErrUnmarshallingRedirectMetadata
		}
		metadata = append(metadata, redirectMetadata)
	}

	return metadata, nil
}
