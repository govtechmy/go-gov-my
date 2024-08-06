package main

import (
	"context"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"redirect-server/repository/es"
	"syscall"
	"time"

	"github.com/olivere/elastic/v7"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.uber.org/zap"
)

func main() {

	var elasticURL string
	var elasticUser string
	var elasticPassword string
	var httpPort int
	{
		flag.StringVar(&elasticURL, "elastic-url", os.Getenv("ELASTIC_URL"), "Elasticsearch URL e.g. http://localhost:9200")
		flag.StringVar(&elasticUser, "elastic-user", os.Getenv("ELASTIC_USER"), "Elasticsearch username")
		flag.StringVar(&elasticPassword, "elastic-password", os.Getenv("ELASTIC_PASSWORD"), "Elasticsearch password")
		flag.IntVar(&httpPort, "http-port", 3002, "HTTP server port")
	}
	flag.Parse()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM, syscall.SIGINT)
	defer stop()

	if elasticURL == "" {
		elasticURL = "http://localhost:9200"
	}
	if elasticUser == "" {
		elasticUser = "elastic"
	}

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
	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) { io.WriteString(w, "OK") })
	
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

	<-ctx.Done()

	shutdownCtx, stop := context.WithTimeout(context.Background(), 60*time.Second)
	defer stop()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatal("Memaksa menurunkan server...", zap.Error(err))
	}

	// log.Fatal(srv.ListenAndServe())
	
}
