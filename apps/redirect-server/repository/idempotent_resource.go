package repository

import (
	"crypto/md5"
	"encoding/hex"
	"io"
	"net/http"
)

type IdempotentResource struct {
	IdempotencyKey       string `json:"idempotency_key,omitempty"`
	HashedRequestPayload string `json:"hashed_request_payload,omitempty"`
}

// Create an IdempotentResource from a http request
func NewIdempotentResource(req http.Request) (*IdempotentResource, error) {
	// Check if header exists
	idempotencyKey := req.Header.Get("X-Idempotency-Key")
	if idempotencyKey == "" {
		return nil, ErrIdempotentMissingHeaders
	}

	body, err := io.ReadAll(req.Body)
	if err != nil {
		return nil, err
	}
	hash := md5.Sum(body)
	hashedReqPayload := hex.EncodeToString(hash[:])

	idempotentResource := &IdempotentResource{
		IdempotencyKey:       idempotencyKey,
		HashedRequestPayload: hashedReqPayload,
	}

	return idempotentResource, nil
}
