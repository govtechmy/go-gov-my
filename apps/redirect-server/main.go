package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/olivere/elastic/v7"
)

var (
    esClient *elastic.Client
    indexName = "redirects"
    baseDomainUrl = "http://localhost:8888"
)

func main() {
    var err error
    esClient, err = elastic.NewClient(elastic.SetURL("http://elasticsearch:9200"))
    if err != nil {
        log.Fatalf("Error creating the Elasticsearch client: %s", err)
    }

    http.HandleFunc("/t/", redirectHandler)
    log.Println("Starting server on :8889")
    log.Fatal(http.ListenAndServe(":8889", nil))
}

func redirectHandler(w http.ResponseWriter, r *http.Request) {
    key := r.URL.Path[len("/t/"):]
    if key == "" {
        http.Error(w, "Key not provided", http.StatusBadRequest)
        return
    }

    // Log redirect to Elasticsearch
    logRedirect(key, r.RemoteAddr)

    // Perform the redirect
    // Farhan: Here we should check if the URL exists or not in the database or if the URL is expired.
    redirectUrl := fmt.Sprintf("%s/t/%s", baseDomainUrl, key)
    http.Redirect(w, r, redirectUrl, http.StatusFound)
}

func logRedirect(key, remoteAddr string) {
    redirect := map[string]interface{}{
        "key":        key,
        "remoteAddr": remoteAddr,
        "timestamp":  fmt.Sprintf("%d", time.Now().Unix()),
    }

    _, err := esClient.Index().
        Index(indexName).
        BodyJson(redirect).
        Do(context.Background())

    if err != nil {
        log.Printf("Failed to log redirect: %s", err)
    }
}
