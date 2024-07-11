package main

import (
	"flag"
	"log"
	"net/http"
	"path/filepath"
	"redirect-server/repository/es"

	"github.com/joho/godotenv"
	"github.com/olivere/elastic/v7"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

const (
	ENV_DEVELOPMENT = "development"
	ENV_PRODUCTION  = "production"
)

var (
	env       string
	indexName = "links"	
)

func init() {
	// Construct the path to the .env file in the root directory
	rootDir, err := filepath.Abs(filepath.Join(".", "..", ".."))
	if err != nil {
		log.Fatalf("Error constructing root directory path: %s", err)
	}
	envPath := filepath.Join(rootDir, ".env")

	// Load the .env file
	err = godotenv.Load(envPath)
	if err != nil {
		log.Printf("Error loading .env file: %s", err)
	}
}

func main() {

	envFlag := flag.String("env", ENV_DEVELOPMENT, "App environment ('development' or 'production')")
	flag.Parse()

	env = *envFlag

	esClient, err := elastic.NewSimpleClient(
		elastic.SetURL("http://localhost:9200"),
		elastic.SetBasicAuth("elastic", "elastic"),
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

	http.HandleFunc("/links/", deleteLinkHandler)

	log.Printf("Starting server on :3001 in %s mode\n", env)

	log.Fatal(http.ListenAndServe(":3001", nil))
}
