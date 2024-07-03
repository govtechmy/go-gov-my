package main

import (
	"bytes"
	"context"
	"encoding/json"
	"log"

	"github.com/elastic/go-elasticsearch/v7"
)

var esClient *elasticsearch.Client

func InitElasticsearch() *elasticsearch.Client {
    var err error
    esClient, err = elasticsearch.NewDefaultClient()
    if err != nil {
        log.Fatalf("Error creating the Elasticsearch client: %s", err)
    }
    return esClient
}

func checkLinkInElasticsearch(key string) (exists, expired bool, originalURL string) {
    query := map[string]interface{}{
        "query": map[string]interface{}{
            "match": map[string]interface{}{
                "key": key,
            },
        },
    }
    var buf bytes.Buffer
    if err := json.NewEncoder(&buf).Encode(query); err != nil {
        log.Printf("Error encoding query: %s", err)
        return false, false, ""
    }

    res, err := esClient.Search(
        esClient.Search.WithContext(context.Background()),
        esClient.Search.WithIndex(indexName),
        esClient.Search.WithBody(&buf),
        esClient.Search.WithTrackTotalHits(true),
    )
    if err != nil {
        log.Printf("Error querying Elasticsearch: %s", err)
        return false, false, ""
    }
    defer res.Body.Close()

    if res.IsError() {
        var e map[string]interface{}
        if err := json.NewDecoder(res.Body).Decode(&e); err != nil {
            log.Printf("Error parsing the response body: %s", err)
        } else {
            log.Printf("[%s] %s: %s",
                res.Status(),
                e["error"].(map[string]interface{})["type"],
                e["error"].(map[string]interface{})["reason"],
            )
        }
        return false, false, ""
    }

    var r map[string]interface{}
    if err := json.NewDecoder(res.Body).Decode(&r); err != nil {
        log.Printf("Error parsing the response body: %s", err)
        return false, false, ""
    }

    if r["hits"].(map[string]interface{})["total"].(map[string]interface{})["value"].(float64) == 0 {
        return false, false, ""
    }

    for _, hit := range r["hits"].(map[string]interface{})["hits"].([]interface{}) {
        var link Link
        source := hit.(map[string]interface{})["_source"]
        linkJSON, err := json.Marshal(source)
        if err != nil {
            log.Printf("Error marshalling hit source: %s", err)
            continue
        }
        if err := json.Unmarshal(linkJSON, &link); err != nil {
            log.Printf("Error unmarshalling hit source: %s", err)
            continue
        }
        return true, link.Expired, link.URL
    }

    return false, false, ""
}
