package main

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/elastic/go-elasticsearch/v7/esapi"
)

type Link struct {
	ID        string `json:"id"`
	Key       string `json:"key"`
	URL       string `json:"url"`
	Expired   bool   `json:"expired"`
	CreatedAt string `json:"createdAt"`
}

// Adds a link into Elasticsearch. If the link already exists, the whole document is replaced.
func indexLinkHandler(w http.ResponseWriter, r *http.Request) {
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

	var link Link
	err = json.Unmarshal(body, &link)
	if err != nil {
		log.Printf("Error unmarshalling request body: %s", err)
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	var buf bytes.Buffer
	if err := json.NewEncoder(&buf).Encode(link); err != nil {
		log.Printf("Error encoding document: %s", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	indexReq := esapi.IndexRequest{
		Index:      indexName,
		DocumentID: link.ID,
		Body:       &buf,
		Refresh:    "true",
	}

	res, err := indexReq.Do(r.Context(), esClient)
	if err != nil {
		log.Printf("Error indexing document in Elasticsearch: %s", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	defer res.Body.Close()

	if res.IsError() {
		log.Printf("[%s] Error indexing document ID=%s", res.Status(), link.ID)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// Deletes a link from Elasticsearch
func deleteLinkHandler(w http.ResponseWriter, r *http.Request) {
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

	res, err := deleteReq.Do(r.Context(), esClient)
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