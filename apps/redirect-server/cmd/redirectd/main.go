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
	"path/filepath"
	"redirect-server/repository"
	"redirect-server/repository/es"
	"strconv"
	"strings"
	"syscall"
	"time"

	redirectserver "redirect-server"

	"github.com/joho/godotenv"
	"github.com/olivere/elastic/v7"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel"
	"go.uber.org/zap"
)

const (
	defaultElasticURL      = "http://localhost:9200"
	defaultElasticUser     = "elastic"
	defaultHTTPPort        = 3000
	defaultTelemetryURL    = "localhost:4318"
	templatePathPattern    = "../../templates/*.html"
	notFoundTemplate       = "notfound.html"
	serverErrorTemplate    = "server_error.html"
	waitTemplate           = "wait.html"
)

const (
	ENV_DEVELOPMENT = "development"
	ENV_PRODUCTION  = "production"
)

var env string

func init() {
	// Construct the path to the .env file in the root directory
	rootDir, err := filepath.Abs(filepath.Join(".", "..", "..", ".."))
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

	logger := zap.Must(zap.NewProduction())
	defer logger.Sync()

	cfg := loadConfig()

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM, syscall.SIGINT)
	defer stop()

	traceProvider, err := redirectserver.NewTraceProvider(cfg.TelemetryURL)
	if err != nil {
		logger.Fatal("failed to create trace provider", zap.Error(err))
	}
	otel.SetTracerProvider(traceProvider)

	esClient, err := elastic.NewSimpleClient(
		elastic.SetURL(cfg.ElasticURL),
		elastic.SetBasicAuth(cfg.ElasticUser, cfg.ElasticPassword),
		elastic.SetHttpClient(otelhttp.DefaultClient),
	)

	if err != nil {
		logger.Fatal("failed to initialize Elasticsearch client", zap.Error(err))
	}
	linkRepo := es.NewLinkRepo(esClient)

	t, err := template.ParseGlob(templatePathPattern)
	if err != nil {
		logger.Fatal("failed to load HTML templates", zap.Error(err))
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
			w.WriteHeader(http.StatusNotFound)
			t.ExecuteTemplate(w, notFoundTemplate, nil)
			return
		}
		if err != nil {
			logger.Error("error fetching link",
				zap.String("slug", slug),
				zap.String("ip", r.RemoteAddr),
				zap.String("user-agent", r.UserAgent()),
				zap.Error(err))
			w.WriteHeader(http.StatusInternalServerError)
			t.ExecuteTemplate(w, serverErrorTemplate, nil)
			return
		}

		t.ExecuteTemplate(w, waitTemplate, link)
	}), "handleLinkVisit"))

	srv := &http.Server{
		Addr:    fmt.Sprintf("0.0.0.0:%d", cfg.HTTPPort),
		Handler: http.DefaultServeMux,
	}

	go func() {
		if err := srv.ListenAndServe(); err == http.ErrServerClosed {
			log.Println("Server closed under request")
		} else if err != nil {
			logger.Fatal("failed to stop HTTP server gracefully", zap.Error(err))
		}
	}()

	<-ctx.Done()

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		logger.Fatal("failed to shut down server gracefully", zap.Error(err))
	}
}

func loadConfig() struct {
	ElasticURL      string
	ElasticUser     string
	ElasticPassword string
	HTTPPort        int
	TelemetryURL    string
} {
	cfg := struct {
		ElasticURL      string
		ElasticUser     string
		ElasticPassword string
		HTTPPort        int
		TelemetryURL    string
	}{}

	// Use environment variables or defaults
	cfg.ElasticURL = getEnv("ELASTIC_URL", defaultElasticURL)
	cfg.ElasticUser = getEnv("ELASTIC_USER", defaultElasticUser)
	cfg.ElasticPassword = getEnv("ELASTIC_PASSWORD", "")
	cfg.HTTPPort = getEnvAsInt("HTTP_PORT", defaultHTTPPort)
	cfg.TelemetryURL = getEnv("TELEMETRY_URL", defaultTelemetryURL)

	return cfg
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func getEnvAsInt(name string, defaultVal int) int {
	valueStr := getEnv(name, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultVal
}
