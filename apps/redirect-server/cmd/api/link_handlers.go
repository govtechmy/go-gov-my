package main

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"redirect-server/repository"
	"redirect-server/repository/es"
	"strings"

	"github.com/elastic/go-elasticsearch/v7/esapi"
)

// Adds a link into Elasticsearch. If the link already exists, the whole document is replaced.
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

	idempotencyKey := r.Header.Get("X-Idempotency-Key")
	if idempotencyKey == "" {
		http.Error(w, "X-Idempotency-Key header is required", http.StatusBadRequest)
		return
	}

	resource, err := idempotentResourceRepo.GetIdempotentResource(ctx, idempotencyKey)
	if err != nil {
		log.Printf("Error getting idempotent resource: %s", err)
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}

	resourceExists := resource != nil
	hash := md5.Sum(body)
	hashedReqPayload := hex.EncodeToString(hash[:])

	if resourceExists {
		if resource.HashedRequestPayload == hashedReqPayload {
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

	// Meaning the _id is different but the slug already exists.
	// Actually this is already being handled at NextJS but it's good to have a double check here so that we don't differnt id but same slug
	existingLink, err := linkRepo.GetLink(ctx, link.Slug)
	if err != nil && err != repository.ErrLinkNotFound {
		log.Printf("Error checking existing link: %s", err)
		http.Error(w, "Server error", http.StatusInternalServerError)
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

	idempotentResource := repository.IdempotentResource{
		IdempotencyKey:       idempotencyKey,
		HashedRequestPayload: hashedReqPayload,
	}

	if err := idempotentResourceRepo.SaveIdempotentResource(ctx, idempotentResource); err != nil {
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
func deleteLinkHandler(w http.ResponseWriter, r *http.Request) {
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

	deleteReq := esapi.DeleteRequest{
		Index:      indexName,
		DocumentID: linkId,
	}

	res, err := deleteReq.Do(ctx, esClient)
	if err != nil {
		log.Printf("Error deleting document in Elasticsearch: %s", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	defer res.Body.Close()

	if res.IsError() {
		log.Printf("[%s] Error deleting document ID=%s", res.Status(), linkId)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
