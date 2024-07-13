package es

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
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

func (r *IdempotentResourceRepo) TryValidateResources(req *http.Request, body []byte) (*repository.IdempotentResource, string, string, int, error) {
	ctx := req.Context()

	// Check if header exists
	idempotencyKey := req.Header.Get("X-Idempotency-Key")
	if idempotencyKey == "" {
		return nil, "", "", http.StatusBadRequest, fmt.Errorf("X-Idempotency-Key header is required")
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
		return nil, "", "", http.StatusInternalServerError, err
	}

	var idempotentResource repository.IdempotentResource
	if len(res.Hits.Hits) > 0 {
		if err := json.Unmarshal(res.Hits.Hits[0].Source, &idempotentResource); err != nil {
			return nil, "", "", http.StatusInternalServerError, err
		}
	}

	hash := md5.Sum(body)
	hashedReqPayload := hex.EncodeToString(hash[:])

	if len(res.Hits.Hits) > 0 {
		if idempotentResource.HashedRequestPayload == hashedReqPayload {
			return &idempotentResource, hashedReqPayload, idempotencyKey, http.StatusConflict, fmt.Errorf("Duplicate request")
		}
		return &idempotentResource, hashedReqPayload, idempotencyKey, http.StatusUnprocessableEntity, fmt.Errorf("Idempotent resource exists but request bodies don't match")
	}

	return nil, hashedReqPayload, idempotencyKey, 0, nil
}



func (r *IdempotentResourceRepo) SaveIdempotentResource(ctx context.Context, req repository.IdempotentResource) error {
	_, err := r.esClient.Index(). // not thread-safe
					Index(idempotentResourceIndex).
					Id(req.IdempotencyKey).
					BodyJson(req).
					Do(ctx)
	return err
}
