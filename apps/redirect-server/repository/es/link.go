package es

import (
	"context"
	"encoding/json"
	"net/http"

	"redirect-server/repository"

	"github.com/olivere/elastic/v7"
)

const (
	linkIndex = "links"
)

type LinkRepo struct {
	esClient *elastic.Client
}

func NewLinkRepo(esClient *elastic.Client) *LinkRepo {
	return &LinkRepo{esClient: esClient}
}

func (r *LinkRepo) GetLink(ctx context.Context, slug string) (*repository.Link, int, error) {
	res, err := r.esClient.Search().
		Index(linkIndex).
		Query(
			elastic.NewTermQuery("slug", slug),
		).
		Size(1).
		Do(ctx)
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}

	if len(res.Hits.Hits) == 0 {
		return nil, http.StatusNotFound, repository.ErrLinkNotFound
	}

	link := repository.Link{}
	if err := json.Unmarshal(res.Hits.Hits[0].Source, &link); err != nil {
		return nil, http.StatusInternalServerError, err
	}

	return &link, 0, nil
}


func (r *LinkRepo) SaveLink(ctx context.Context, link *repository.Link) error {
	_, err := r.esClient.Index(). // not thread-safe
					Index(linkIndex).
					Id(link.ID).
					BodyJson(link).
					Do(ctx)
	return err
}

func (r *LinkRepo) DeleteLink(ctx context.Context, linkId string) error {
	_, err := r.esClient.Delete().
		Index(linkIndex).
		Id(linkId).
		Do(ctx)
	return err
}
