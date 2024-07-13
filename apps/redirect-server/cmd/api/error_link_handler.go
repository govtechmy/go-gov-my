package main

import (
	"net/http"
	"redirect-server/repository"
)

func errLinkHandler(w http.ResponseWriter, err error) {
	switch err {
		// General Errors
		case repository.ErrInternalServer:
			http.Error(w, "server error", http.StatusInternalServerError)
		case repository.ErrBadRequest:
			http.Error(w, "bad request", http.StatusBadRequest)
		case repository.ErrMethodNotAllowed:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		case repository.ErrMissingParameters:
			http.Error(w, "missing parameters", http.StatusBadRequest)
		case repository.ErrMissingParameters:
			http.Error(w, "missing parameters", http.StatusBadRequest)
	
		// Idempotency Errors
			case repository.ErrIdempotentResourceNotFound:
			http.Error(w, "resources not found", http.StatusNotFound)
		case repository.ErrIdempotentMissingHeaders:
			http.Error(w, "missing Headers", http.StatusBadRequest)
		case repository.ErrIdempotentDuplicateRequest:
			w.WriteHeader(http.StatusCreated)
		case repository.ErrIdempotentBadRequest:
			http.Error(w, "idempotency id exists but hashed payload invalid", http.StatusBadRequest)

		// Links Errors
		case repository.ErrLinkNotFound:
			http.Error(w, "link not found", http.StatusNotFound)
		case repository.ErrCheckExistingLink:
			http.Error(w, "link not found", http.StatusInternalServerError)	
		case repository.ErrSlugExists:
			http.Error(w, "missing Headers", http.StatusBadRequest)

		// Fallback
		default:
			http.Error(w, "server error", http.StatusInternalServerError)
	}
}