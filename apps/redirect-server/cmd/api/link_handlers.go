package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"redirect-server/repository"
	"redirect-server/repository/es"
	"strings"
)

func indexLinkHandler(w http.ResponseWriter, r *http.Request, linkRepo *es.LinkRepo, idempotentResourceRepo *es.IdempotentResourceRepo) {
	ctx := r.Context()

	if !(r.Method == "POST" || r.Method == "PUT") {
		http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("Error reading request body: %s", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	idempotentResource, hashedReqPayload, idempotencyKey, statusCode, err := idempotentResourceRepo.TryValidateResources(r, body)
	if err != nil {
		http.Error(w, err.Error(), statusCode)
		return
	}

	if idempotentResource != nil {
		if idempotentResource.HashedRequestPayload == hashedReqPayload {
			http.Error(w, "Duplicate request", http.StatusConflict)
			return
		}
		// Resource with matching idempotency key exists but request bodies don't match
		http.Error(w, "Idempotent resource exists but request bodies don't match", http.StatusUnprocessableEntity)
		return
	}

	var link repository.Link
	err = json.Unmarshal(body, &link)
	if err != nil {
		log.Printf("Error unmarshalling request body: %s", err)
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	existingLink, statusCode, err := linkRepo.GetLink(ctx, link.Slug)
	if err != nil && err != repository.ErrLinkNotFound {
		log.Printf("Error checking existing link: %s", err)
		http.Error(w, "Server error", statusCode)
		return
	}

	if r.Method == "POST" && existingLink != nil {
		http.Error(w, "Slug already exists", http.StatusConflict)
		return
	}

	if err := linkRepo.SaveLink(ctx, &link); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	idempotentResource = &repository.IdempotentResource{
		IdempotencyKey:       idempotencyKey,
		HashedRequestPayload: hashedReqPayload,
	}

	// Only save idempotent resource if the link was saved successfully
	if err := idempotentResourceRepo.SaveIdempotentResource(ctx, *idempotentResource); err != nil {
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}

	if r.Method == "POST" {
		w.WriteHeader(http.StatusCreated)
	} else if r.Method == "PUT" {
		w.WriteHeader(http.StatusNoContent)
	}
}


// Deletes a link from Elasticsearch
func deleteLinkHandler(w http.ResponseWriter, r *http.Request, linkRepo *es.LinkRepo) {
	ctx := r.Context()

	if r.Method != "DELETE" {
		http.Error(w, http.StatusText(http.StatusMethodNotAllowed), http.StatusMethodNotAllowed)
		return
	}

	linkId := strings.Split(r.URL.Path, "/")[2]
	if linkId == "" {
		http.Error(w, "Missing path parameter 'linkId'", http.StatusBadRequest)
		return
	}

	err := linkRepo.DeleteLink(ctx, linkId)
	if err != nil {
		log.Printf("Error deleting document in Elasticsearch: %s", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
