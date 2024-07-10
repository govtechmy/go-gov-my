package repository

import "errors"

var ErrIdempotentResourceNotFound = errors.New("link not found")

type IdempotentResource struct {
	IdempotencyKey       string `json:"idempotency_key,omitempty"`
	HashedRequestPayload string `json:"hashed_request_payload,omitempty"`
}
