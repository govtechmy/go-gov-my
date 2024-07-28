package main

import (
	"context"
	"flag"
	"fmt"
	"html/template"
	"io"
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
	"github.com/oschwald/geoip2-golang"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel"
	"go.uber.org/zap"
)

type WaitPageProps struct {
	URL         string
	Title       string
	Description string
	ImageURL    string
}

func main() {
	loggerConfig := zap.NewProductionConfig()
	loggerConfig.OutputPaths = []string{"stdout"}
	logger := zap.Must(loggerConfig.Build())

	// golang-lint mentioned it should check for err
	defer func() {
		if err := logger.Sync(); err != nil {
			fmt.Fprintf(os.Stderr, "Failed to sync logger: %v\n", err)
		}
	}()

	var elasticURL string
	var elasticUser string
	var elasticPassword string
	var httpPort int
	var telemetryURL string
	var geolite2DBPath string
	{
		flag.StringVar(&elasticURL, "elastic-url", "http://localhost:9200", "Elasticsearch URL")
		flag.StringVar(&elasticUser, "elastic-user", "elastic", "Elasticsearch username")
		flag.StringVar(&elasticPassword, "elastic-password", os.Getenv("ELASTIC_PASSWORD"), "Elasticsearch password")
		flag.IntVar(&httpPort, "http-port", 3000, "HTTP server port")
		flag.StringVar(&telemetryURL, "telemetry-url", "localhost:4318", "OpenTelemetry HTTP endpoint URL")
		flag.StringVar(&geolite2DBPath, "geolite2-path", "./GeoLite2-City.mmdb", "Path to GeoLite2 .mmdb file")
	}
	baseURL := os.Getenv("NEXTJS_BASE_URL")
    if baseURL == "" {
        log.Fatal("BASE_URL is not set in the environment variables")
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

	t, err := template.ParseGlob("templates/*.html")
	if err != nil {
		logger.Fatal("cannot load html templates", zap.Error(err))
	}

	fs := http.FileServer(http.Dir("public"))
	http.Handle("/public/", http.StripPrefix("/public/", fs))

	ipDB, err := geoip2.Open(geolite2DBPath)
	if err != nil {
		logger.Fatal("cannot load geolite2 database", zap.Error(err))
	}
	defer ipDB.Close()

	// todo: logger handler
	// todo: metrics handler
	// todo: err handler

	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) { io.WriteString(w, "OK") })

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
			http.Redirect(w, r, fmt.Sprintf("%s/en/notfound", baseURL), http.StatusSeeOther)
			return
		}
		if err != nil {
			logger.Error("error fetching link",
				zap.String("slug", slug),
				zap.String("ip", r.RemoteAddr),
				zap.String("user-agent", r.UserAgent()),
				zap.Error(err))
			http.Redirect(w, r, fmt.Sprintf("%s/en/server_error", baseURL), http.StatusSeeOther)
			return
		}

		// Log redirect metadata for analytics
		redirectMetadata := repository.NewRedirectMetadata(*r, ipDB, *link)
		logger.Info("redirect analytics",
			zap.String("linkSlug", link.Slug),
			zap.String("linkId", link.ID),
			zap.String("userAgent", r.UserAgent()),
			zap.String("ip", r.RemoteAddr),
			zap.Object("redirectMetadata", redirectMetadata),
		)

		// Do not use link.URL, use redirectMetadata.LinkURL instead.
		// Redirect URL could be a geo-specific/ios/android link.
		redirectURL := redirectMetadata.LinkURL

		if err := t.ExecuteTemplate(w, "wait.html", WaitPageProps{
			URL:         redirectURL,
			Title:       link.Title,
			Description: link.Description,
			ImageURL:    link.ImageURL,
		}); err != nil {
			logger.Error("failed to execute template", zap.Error(err))
		}
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
