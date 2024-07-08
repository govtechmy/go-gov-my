package es

import (
	"context"
	"encoding/json"
	"time"

	"redirect-server/repository"

	"github.com/olivere/elastic/v7"
)

// todo: handle idempotency logic
const (
	linkIndex          = "links"
	idempotencyKeyIndex = "idempotency_keys"
)

type LinkRepo struct {
	esClient *elastic.Client
}

func NewLinkRepo(esClient *elastic.Client) *LinkRepo {
	return &LinkRepo{esClient: esClient}
}

func (r *LinkRepo) GetLink(ctx context.Context, slug string) (*repository.Link, error) {
	res, err := r.esClient.Search().
		Index(linkIndex).
		Query(
			elastic.NewTermQuery("slug", slug),
		).
		Size(1).
		Do(ctx)
	if err != nil {
		return nil, err
	}

	if len(res.Hits.Hits) == 0 {
		return nil, repository.ErrLinkNotFound
	}

	link := repository.Link{}
	if err := json.Unmarshal(res.Hits.Hits[0].Source, &link); err != nil {
		return nil, err
	}
	return &link, nil
}

func (r *LinkRepo) SaveLink(ctx context.Context, link *repository.Link) error {
	_, err := r.esClient.Index(). // not thread-safe
					Index(linkIndex).
					Id(link.Slug).
					BodyJson(link).
					Do(ctx)
	return err
}

func (r *LinkRepo) DeleteLink(ctx context.Context, slug string) error {
	_, err := r.esClient.Delete().
		Index(linkIndex).
		Id(slug).
		Do(ctx)
	return err
}


func (r *LinkRepo) IdempotencyKeyExists(ctx context.Context, id string) (bool, error) {
	res, err := r.esClient.Get().
		Index(idempotencyKeyIndex).
		Id(id).
		Do(ctx)

	if elastic.IsNotFound(err) {
		return false, nil
	}

	if err != nil {
		return false, err
	}
	
	return res.Found, nil
}

func (r *LinkRepo) SaveIdempotencyKey(ctx context.Context, id string) error {
	_, err := r.esClient.Index().
		Index(idempotencyKeyIndex).
		Id(id).
		BodyJson(map[string]interface{}{
			"timestamp": time.Now(),
		}).
		Do(ctx)
	return err
}