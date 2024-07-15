package main

import (
	"redirect-server/repository"

	"github.com/elastic/go-elasticsearch/v7"
)

var esClient *elasticsearch.Client

func InitElasticsearch() *elasticsearch.Client {
	var err error
	esClient, err = elasticsearch.NewDefaultClient()
	if err != nil {
		logFatalHandler(repository.ErrInitClient, err)
	}
	return esClient
}