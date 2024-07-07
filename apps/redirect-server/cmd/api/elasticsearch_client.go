package main

import (
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