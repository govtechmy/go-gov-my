package es

import (
	"context"
	"encoding/json"
	"sync"

	"redirect-server/repository"

	"github.com/olivere/elastic/v7"
)

const linkIndex = "links"

type LinkRepo struct {
	esClient *elastic.Client
	mu       sync.Mutex // Add a mutex to ensure thread-safety
}

func NewLinkRepo(esClient *elastic.Client) *LinkRepo {
	return &LinkRepo{esClient: esClient}
}

func (r *LinkRepo) GetLink(ctx context.Context, slug string) (*repository.Link, error) {
	// Lock the mutex to ensure only one goroutine can access this method at a time
	r.mu.Lock()
	defer r.mu.Unlock()

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
	// Lock the mutex to ensure only one goroutine can access this method at a time
	r.mu.Lock()
	defer r.mu.Unlock()

	_, err := r.esClient.Index().
		Index(linkIndex).
		Id(link.Slug).
		BodyJson(link).
		Do(ctx)
	return err
}

func (r *LinkRepo) DeleteLink(ctx context.Context, slug string) error {
	// Lock the mutex to ensure only one goroutine can access this method at a time
	r.mu.Lock()
	defer r.mu.Unlock()

	_, err := r.esClient.Delete().
		Index(linkIndex).
		Id(slug).
		Do(ctx)
	return err
}
