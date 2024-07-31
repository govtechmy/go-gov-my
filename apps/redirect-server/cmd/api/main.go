package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"redirect-server/repository/es"

	"github.com/olivere/elastic/v7"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

func main() {

	var elasticURL string
	var elasticUser string
	var elasticPassword string
	var httpPort int
	{
		flag.StringVar(&elasticURL, "elastic-url", "http://localhost:9200", "Elasticsearch URL")
		flag.StringVar(&elasticUser, "elastic-user", "elastic", "Elasticsearch username")
		flag.StringVar(&elasticPassword, "elastic-password", os.Getenv("ELASTIC_PASSWORD"), "Elasticsearch password")
		flag.IntVar(&httpPort, "http-port", 3002, "HTTP server port")
	}
	flag.Parse()

	esClient, err := elastic.NewSimpleClient(
		elastic.SetURL(elasticURL),
		elastic.SetBasicAuth(elasticUser, elasticPassword),
		elastic.SetHttpClient(otelhttp.DefaultClient),
	)
	if err != nil {
		log.Fatal("failed to create Elasticsearch client")
	}

	idempotentResourceRepo := es.NewIdempotentResourceRepo(esClient)
	linkRepo := es.NewLinkRepo(esClient)

	// todo: add tracing
	// todo: split into internal and public endpoint
	http.HandleFunc("/links", func(w http.ResponseWriter, r *http.Request) {
		indexLinkHandler(w, r, linkRepo, idempotentResourceRepo)
	})

	http.HandleFunc("/links/", func(w http.ResponseWriter, r *http.Request) {
		deleteLinkHandler(w, r, linkRepo)
	})

	srv := &http.Server{
		Addr:    fmt.Sprintf("0.0.0.0:%d", httpPort),
		Handler: http.DefaultServeMux,
	}

	log.Fatal(srv.ListenAndServe())
}
