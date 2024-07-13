package es

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"net/http"

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

func (r *IdempotentResourceRepo) TryValidateResources(req *http.Request, body []byte) (*repository.IdempotentResource, error) {
	ctx := req.Context()

	// Check if header exists
	idempotencyKey := req.Header.Get("X-Idempotency-Key")
	if idempotencyKey == "" {
		return nil, repository.ErrIdempotentMissingHeaders
	}

	// Query from ES if idempotency key exists
	res, err := r.esClient.Search().
		Index(idempotentResourceIndex).
		Query(
			elastic.NewMatchQuery("idempotency_key", idempotencyKey),
		).
		Size(1).
		Do(ctx)

	if err != nil {
		return nil, repository.ErrInternalServer
	}

	var idempotentResource repository.IdempotentResource
	if len(res.Hits.Hits) > 0 {
		if err := json.Unmarshal(res.Hits.Hits[0].Source, &idempotentResource); err != nil {
			return nil, repository.ErrInternalServer
		}
	}

	hash := md5.Sum(body)
	hashedReqPayload := hex.EncodeToString(hash[:])

	if len(res.Hits.Hits) > 0 {
		if idempotentResource.HashedRequestPayload == hashedReqPayload {
			return &idempotentResource, repository.ErrIdempotentDuplicateRequest
		}
		// Idempotency key exists but hashed payload doesn't match
		return &idempotentResource, repository.ErrIdempotentBadRequest
	}

	return &idempotentResource, nil
}

func (r *IdempotentResourceRepo) SaveIdempotentResource(ctx context.Context, req repository.IdempotentResource) error {
	_, err := r.esClient.Index(). // not thread-safe
					Index(idempotentResourceIndex).
					Id(req.IdempotencyKey).
					BodyJson(req).
					Do(ctx)
	return err
}
