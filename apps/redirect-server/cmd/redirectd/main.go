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
	"path/filepath"
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
	"go.uber.org/zap/zapcore"
)

type WaitPageProps struct {
	URL         string
	Title       string
	Description string
	ImageURL    string
}

type AuthPostProps struct {
	Password	string
	Slug		string
}

type PostReturnProps struct {
	Status		bool
	Message		string
}

// TODO: refactor and move to a common package
func getClientIP(r *http.Request) string {
	// Get the IP from the X-Forwarded-For header, if available
	xff := r.Header.Get("X-Forwarded-For")
	if xff != "" {
		// The X-Forwarded-For header can contain a comma-separated list of IPs
		ips := strings.Split(xff, ",")
		if len(ips) > 0 {
			return strings.TrimSpace(ips[0])
		}
	}
	// Fall back to the remote address if X-Forwarded-For is not set
	return r.RemoteAddr
}


func main() {

	logFilePath := os.Getenv("LOG_FILE_PATH")
	if logFilePath == "" {
		log.Fatalf("LOG_FILE_PATH environment variable is not set")
	}

	// Ensure the directory exists
	logDir := filepath.Dir(logFilePath)
	if err := os.MkdirAll(logDir, 0755); err != nil {
		log.Fatalf("failed to create log directory: %v", err)
	}

	// Initialize log file for successful link visits
	logFile, err := os.OpenFile(logFilePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		log.Fatalf("failed to open log file: %v", err)
	}
	defer logFile.Close()

	// Configure file logger for successful link visits
	w := zapcore.AddSync(logFile)
	core := zapcore.NewCore(
		zapcore.NewJSONEncoder(zap.NewProductionEncoderConfig()),
		w,
		zap.InfoLevel,
	)
	fileLogger := zap.New(core)
	defer fileLogger.Sync()

	
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
	var baseURL string
	{
		flag.StringVar(&elasticURL, "elastic-url", os.Getenv("ELASTIC_URL"), "Elasticsearch URL e.g. http://localhost:9200")
		flag.StringVar(&elasticUser, "elastic-user", os.Getenv("ELASTIC_USER"), "Elasticsearch username")
		flag.StringVar(&elasticPassword, "elastic-password", os.Getenv("ELASTIC_PASSWORD"), "Elasticsearch password")
		flag.IntVar(&httpPort, "http-port", 3000, "HTTP server port")
		flag.StringVar(&telemetryURL, "telemetry-url", os.Getenv("TELEMETRY_URL"), "OpenTelemetry HTTP endpoint URL e.g. localhost:4318")
		flag.StringVar(&geolite2DBPath, "geolite2-path", "./GeoLite2-City.mmdb", "Path to GeoLite2 .mmdb file")
		flag.StringVar(&baseURL, "base-url", os.Getenv("VITE_BASE_URL"), "The static page for GO: http://localhost:5713")
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

	// fs := http.FileServer(http.Dir("public"))
	// http.Handle("/public/", http.StripPrefix("/public/", fs))
	fs := http.FileServer(http.Dir("public"))
	http.Handle("/", fs)


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
				zap.String("ip", getClientIP(r)),
				zap.String("user-agent", r.UserAgent()),
				zap.String("code", "link_not_found")) // Filebeat will run to collect link not found errors over this code
			http.Redirect(w, r, fmt.Sprintf("%s/notfound", baseURL), http.StatusSeeOther)
			return
		}
		if err != nil {
			logger.Error("error fetching link",
				zap.String("slug", slug),
				zap.String("ip", getClientIP(r)),
				zap.String("user-agent", r.UserAgent()),
				zap.Error(err))
			http.Redirect(w, r, fmt.Sprintf("%s/server_error", baseURL), http.StatusSeeOther)
			return
		}

		// LINK IS PASSWORD PROTECTED , REDIRECT TO AUTH PAGE
		if link.Password != "" {
			http.Redirect(w, r, fmt.Sprintf("%s/auth?slug=%s", baseURL, slug), http.StatusSeeOther)
			return
		}

		// Log redirect metadata for analytics
		redirectMetadata := repository.NewRedirectMetadata(*r, ipDB, *link)
		fileLogger.Info("redirect analytics",
			zap.String("linkSlug", link.Slug),
			zap.String("linkId", link.ID),
			zap.String("userAgent", r.UserAgent()),
			zap.String("ip", getClientIP(r)),
			zap.Object("redirectMetadata", redirectMetadata),
		)

		// Do not use link.URL, use redirectMetadata.LinkURL instead.
		// Redirect URL could be a geo-specific/ios/android link.
		// redirectURL := redirectMetadata.LinkURL

		// if err := t.ExecuteTemplate(w, "wait.html", WaitPageProps{
		// 	URL:         redirectURL,
		// 	Title:       link.Title,
		// 	Description: link.Description,
		// 	ImageURL:    link.ImageURL,
		// }); err != nil {
		// 	logger.Error("failed to execute template", zap.Error(err))
		// }

		// Redirect URL could be a geo-specific/ios/android link.
		redirectURL := fmt.Sprintf("%s/redirect?url=%s&title=%s&description=%s&imageUrl=%s",
		baseURL, redirectMetadata.LinkURL, link.Title, link.Description, link.ImageURL)
		http.Redirect(w, r, redirectURL, http.StatusSeeOther)

	}), "handleLinkVisit"))

	http.Handle("/auth", otelhttp.NewHandler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		if r.Method == "POST" {
			decoder := json.NewDecoder(r.Body)
			var t = AuthPostProps
			err := decoder.Decode(&t)
			user_input_password := t.Password
			slug := t.Slug
			if err != nil {
				logger.Info("password auth error",
				zap.String("slug", slug),
				zap.String("ip", getClientIP(r)),
				zap.String("user-agent", r.UserAgent()),
				zap.String("code", "auth_password_error"))
				var returnStruct PostReturnProps
				returnStruct.Status = false
				returnStruct.Message = "Unable to find Password in Post"
				w.Header().Add("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(returnStruct)
				return
			}

			link, err := linkRepo.GetLink(ctx, slug)
			if err == repository.ErrLinkNotFound {
				logger.Info("link not found",
					zap.String("slug", slug),
					zap.String("ip", getClientIP(r)),
					zap.String("user-agent", r.UserAgent()),
					zap.String("code", "link_not_found")) // Filebeat will run to collect link not found errors over this code
					var returnStruct PostReturnProps
					returnStruct.Status = false
					returnStruct.Message = "Unable to find link"
					w.Header().Add("Content-Type", "application/json")
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(returnStruct)
				return
			}
			if err != nil {
				logger.Error("error fetching link",
					zap.String("slug", slug),
					zap.String("ip", getClientIP(r)),
					zap.String("user-agent", r.UserAgent()),
					zap.Error(err))
					var returnStruct PostReturnProps
					returnStruct.Status = false
					returnStruct.Message = "Unable to fetch link"
					w.Header().Add("Content-Type", "application/json")
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(returnStruct)
				return
			}

			// LINK IS PASSWORD PROTECTED AND USER PROVIDED CORRECT PASSWORD
			if link.Password != "" && user_input_password == link.Password && user_input_password != "" {
				var returnStruct PostReturnProps
				returnStruct.Status = true
				returnStruct.Message = "Password Authenticated"
				w.Header().Add("Content-Type", "application/json")
				w.WriteHeader(http.StatusOK)
				json.NewEncoder(w).Encode(returnStruct)
				return
			}

			// USER PROVIDE WRONG PASSWORD
			var returnStruct PostReturnProps
			returnStruct.Status = false
			returnStruct.Message = "Wrong Password"
			w.Header().Add("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(returnStruct)
			return

		}
		var returnStruct PostReturnProps
		returnStruct.Status = false
		returnStruct.Message = "Method not allowed"
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(returnStruct)
		return	
	
	}), "handleAuthPassword"))

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