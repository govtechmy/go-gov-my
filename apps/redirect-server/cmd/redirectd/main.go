package main

import (
	"context"
	"flag"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"os/signal"
	redirectserver "redirect-server"
	"redirect-server/repository"
	"redirect-server/repository/es"
	"strings"
	"syscall"
	"time"

	"github.com/olivere/elastic/v7"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel"
	"go.uber.org/zap"
)

func main() {
	logger := zap.Must(zap.NewProduction())
	defer logger.Sync()

	var elasticURL string
	var elasticUser string
	var elasticPassword string
	var httpPort int
	var telemetryURL string
	{
		flag.StringVar(&elasticURL, "elastic-url", "http://localhost:9200", "Elasticsearch URL")
		flag.StringVar(&elasticUser, "elastic-user", "elastic", "Elasticsearch username")
		flag.StringVar(&elasticPassword, "elastic-password", os.Getenv("ELASTIC_PASSWORD"), "Elasticsearch password")
		flag.IntVar(&httpPort, "http-port", 3000, "HTTP server port")
		flag.StringVar(&telemetryURL, "telemetry-url", "localhost:4318", "OpenTelemetry HTTP endpoint URL")
	}
	flag.Parse()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM, syscall.SIGINT)
	defer stop()

	traceProvider, err := redirectserver.NewTraceProvider(telemetryURL)
	if err != nil {
		log.Fatal(err)
	}
	otel.SetTracerProvider(traceProvider)

	esClient, err := elastic.NewSimpleClient(
		elastic.SetURL(elasticURL),
		elastic.SetBasicAuth(elasticUser, elasticPassword),
		elastic.SetHttpClient(otelhttp.DefaultClient),
	)
	if err != nil {
		logger.Fatal("cannot initiate Elasticsearch client", zap.Error(err))
	}
	linkRepo := es.NewLinkRepo(esClient)

	t, err := template.ParseGlob("../../templates/*.html")
	if err != nil {
		logger.Fatal("cannot load html templates", zap.Error(err))
	}

	http.Handle("/", otelhttp.NewHandler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		slug := strings.TrimPrefix(r.URL.Path, "/")

		link, err := linkRepo.GetLink(ctx, slug)
		if err == repository.ErrLinkNotFound {
			logger.Info("link not found",
				zap.String("slug", slug),
				zap.String("ip", r.RemoteAddr),
				zap.String("user-agent", r.UserAgent()),
				zap.String("code", "link_not_found")) // Filebeat will run to collect link not found errors over this code
			w.WriteHeader(404)
			t.ExecuteTemplate(w, "notfound.html", nil)
			return
		}
		if err != nil {
			logger.Error("error fetching link",
				zap.String("slug", slug),
				zap.String("ip", r.RemoteAddr),
				zap.String("user-agent", r.UserAgent()),
				zap.Error(err))
			w.WriteHeader(500)
			t.ExecuteTemplate(w, "server_error.html", nil)
			return
		}

		t.ExecuteTemplate(w, "wait.html", link)
	}), "handleLinkVisit"))

	srv := &http.Server{
		Addr:    fmt.Sprintf("0.0.0.0:%d", httpPort),
		Handler: http.DefaultServeMux,
	}

	go func() {
		if err := srv.ListenAndServe(); err == http.ErrServerClosed {
		} else if err != nil {
			logger.Fatal("failed to stop http server gracefully",
				zap.Error(err))
		}
	}()

	<-ctx.Done()

	shutdownCtx, stop := context.WithTimeout(context.Background(), 60*time.Second)
	defer stop()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		logger.Fatal("", zap.Error(err))
	}
}