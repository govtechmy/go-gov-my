package main

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"redirect-server/repository/es"
	"strings"
	"time"

	"github.com/elastic/go-elasticsearch/v7/esapi"
)

const idempotencyTTL = 72 * time.Hour

type Link struct {
	ID        string `json:"id"`
	Key       string `json:"slug"`
	URL       string `json:"url"`
	ExpiresAt bool   `json:"expiresAt"`
	Ios       string `json:"ios"`
	Android   string `json:"android"`
	CreatedAt string `json:"createdAt"`
	Action    string `json:"action"`
	// OutboxID  string `json:"outboxId"`
	UploadedImageUrl string `json:"uploadedImageUrl"`
}

type IdempotencyKey struct {
	Timestamp time.Time `json:"timestamp"`
	ID        string    `json:"id"`
}

var linkRepo *es.LinkRepo

// Adds a link into Elasticsearch. If the link already exists, the whole document is replaced.
func indexLinkHandler(w http.ResponseWriter, r *http.Request) {
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

	// Before we do anything, lets check for idempotency
	idempotencyKey, err := extractAndValidateIdempotencyKey(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	exists, err := linkRepo.IdempotencyKeyExists(ctx, idempotencyKey.ID)
	if err != nil {
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}

	if exists {
		http.Error(w, "Duplicate request", http.StatusConflict)
		return
	}

	var link Link

	err = json.Unmarshal(body, &link)

	if err != nil {
		log.Printf("Error unmarshalling request body: %s", err)
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	if err := saveLinkToElasticsearch(ctx, link); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := linkRepo.SaveIdempotencyKey(ctx, idempotencyKey.ID); err != nil {
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
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

func extractAndValidateIdempotencyKey(r *http.Request) (*IdempotencyKey, error) {
	idempotencyKeyBase64 := r.Header.Get("X-Idempotency-Key")
	if idempotencyKeyBase64 == "" {
		return nil, fmt.Errorf("X-Idempotency-Key header is required")
	}

	idempotencyKeyJSON, err := base64.StdEncoding.DecodeString(idempotencyKeyBase64)
	if err != nil {
		return nil, fmt.Errorf("invalid X-Idempotency-Key header")
	}

	var idempotencyKey IdempotencyKey
	if err := json.Unmarshal(idempotencyKeyJSON, &idempotencyKey); err != nil {
		return nil, fmt.Errorf("invalid X-Idempotency-Key header")
	}

	if time.Since(idempotencyKey.Timestamp) > idempotencyTTL {
		return nil, fmt.Errorf("idempotency key expired")
	}

	return &idempotencyKey, nil
}

func saveLinkToElasticsearch(ctx context.Context, link Link) error {
	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(link); err != nil {
		log.Printf("Error encoding document: %s", err)
		return fmt.Errorf("server error")
	}

	indexReq := esapi.IndexRequest{
		Index:      indexName,
		DocumentID: link.ID,
		Body:       &buf,
		Refresh:    "true",
	}

	res, err := indexReq.Do(ctx, esClient)
	if err != nil {
		log.Printf("Error indexing document in Elasticsearch: %s", err)
		return fmt.Errorf("server error")
	}
	defer res.Body.Close()

	if res.IsError() {
		log.Printf("[%s] Error indexing document ID=%s", res.Status(), link.ID)
		return fmt.Errorf("server error")
	}

	return nil
}