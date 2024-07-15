package repository

import "errors"

// General Errors
var ErrInternalServer = errors.New("internal server error")
var ErrBadRequest = errors.New("bad request")
var ErrMethodNotAllowed = errors.New("method not allowed")
var ErrMissingParameters = errors.New("missing parameters")
var ErrMissingPayload = errors.New("missing payload")

// Idempotency Errors
var ErrIdempotentResourceNotFound = errors.New("link not found")
var ErrIdempotentMissingHeaders = errors.New("header is required")
var ErrIdempotentDuplicateRequest = errors.New("duplicate request")
var ErrIdempotentBadRequest = errors.New("idempotency id exists but hashed payload doesn't match")

// Links Errors
var ErrLinkNotFound = errors.New("link not found")
var ErrCheckExistingLink = errors.New("error when checking existing links")
var ErrSlugExists = errors.New("slug already exists")