package es

import (
	"context"
	"encoding/json"

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
					Id(link.ID).
					BodyJson(link).
					Do(ctx)
	return err
}

func (r *LinkRepo) UpdateLink(ctx context.Context, linkID string, updateData repository.UpdateLinkData) error {
	_, err := r.esClient.Update().
		Index(linkIndex).
		Id(linkID).
		Doc(updateData).
		Do(ctx)
	return err
}

func (r *LinkRepo) DeleteLink(ctx context.Context, linkId string) error {
	_, err := r.esClient.Delete().
		Index(linkIndex).
		Id(linkId).
		Do(ctx)

	if elastic.IsNotFound(err) {
		return nil
	}

	return err
}

func (r *LinkRepo) DisableLinkPassword(ctx context.Context, linkID string) error {
	_, err := r.esClient.Update().
		Index(linkIndex).
		Script(
			elastic.NewScript("ctx._source.remove('password')"),
		).
		Id(linkID).
		Do(ctx)
	return err
}
