package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	redirectserver "redirect-server"
	"redirect-server/repository"
	"redirect-server/repository/es"
	"redirect-server/utils"
	"strings"
	"syscall"
	"time"

	"github.com/olivere/elastic/v7"
	"github.com/oschwald/geoip2-golang"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
	"go.opentelemetry.io/otel"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"golang.org/x/crypto/bcrypt"
)

type WaitPageProps struct {
	URL         string
	Title       string
	Description string
	ImageURL    string
}

type AuthPageProps struct {
	Slug string
}

type AuthPostProps struct {
	Password string `json:"password"`
	Slug     string `json:"slug"`
}

type PostReturnProps struct {
	Status  bool
	Message string
	URL     string
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
	var geolite2ASNPath string
	var baseURL string
	{
		flag.StringVar(&elasticURL, "elastic-url", os.Getenv("ELASTIC_URL"), "Elasticsearch URL e.g. http://localhost:9200")
		flag.StringVar(&elasticUser, "elastic-user", os.Getenv("ELASTIC_USER"), "Elasticsearch username")
		flag.StringVar(&elasticPassword, "elastic-password", os.Getenv("ELASTIC_PASSWORD"), "Elasticsearch password")
		flag.IntVar(&httpPort, "http-port", 3000, "HTTP server port")
		flag.StringVar(&telemetryURL, "telemetry-url", os.Getenv("TELEMETRY_URL"), "OpenTelemetry HTTP endpoint URL e.g. localhost:4318")
		flag.StringVar(&geolite2DBPath, "geolite2-path", "./GeoLite2-City.mmdb", "Path to GeoLite2 .mmdb file")
		flag.StringVar(&geolite2ASNPath, "geolite2-asn-path", "./GeoLite2-ASN.mmdb", "Path to GeoLite2 ASN .mmdb file")
		flag.StringVar(&baseURL, "base-url", os.Getenv("NEXTJS_BASE_URL"), "Base URL for the frontend")
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

	// add other languages (i.e. ms-MY) if necessary
	redirectT, err := template.ParseFiles(
		"templates/redirect/en-MY.html",
		"templates/redirect/en-MY/secure.html",
		"templates/redirect/en-MY/not-found.html",
		"templates/redirect/en-MY/error.html",
		"templates/redirect/en-MY/expiry.html",
	)

	if err != nil {
		logger.Fatal("cannot load html (redirect) templates", zap.Error(err))
	}

	fs := http.FileServer(http.Dir("public"))
	http.Handle("/public/", http.StripPrefix("/public/", fs))

	// Cities Informations
	ipDB, err := geoip2.Open(geolite2DBPath)
	if err != nil {
		logger.Fatal("cannot load geolite2 database", zap.Error(err))
	}
	defer ipDB.Close()

	// ASN Informations
	asnDB, err := geoip2.Open(geolite2ASNPath)
	if err != nil {
		logger.Fatal("cannot load geolite2 ASN database", zap.Error(err))
	}
	defer asnDB.Close()

	logger.Info("geolite2 database loaded",
		zap.Any("city_metadata", ipDB.Metadata()),
		zap.Any("asn_metadata", asnDB.Metadata()),
	)

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
				zap.String("ip", utils.GetClientIP(r)),
				zap.String("user-agent", r.UserAgent()),
				zap.String("code", "link_not_found")) // Filebeat will run to collect link not found errors over this code
			w.WriteHeader(http.StatusNotFound)
			if err := redirectT.ExecuteTemplate(w, "not-found.html", nil); err != nil {
				logger.Error("failed to execute template", zap.Error(err))
			}
			return
		}
		if err != nil {
			logger.Error("error fetching link",
				zap.String("slug", slug),
				zap.String("ip", utils.GetClientIP(r)),
				zap.String("user-agent", r.UserAgent()),
				zap.Error(err))
			w.WriteHeader(http.StatusInternalServerError)
			if err := redirectT.ExecuteTemplate(w, "error.html", nil); err != nil {
				logger.Error("failed to execute template", zap.Error(err))
			}
			return
		}

		// Check if the link has expired
		if link.ExpiresAt != nil && time.Now().After(*link.ExpiresAt) {
			w.WriteHeader(http.StatusGone)
			if err := redirectT.ExecuteTemplate(w, "expiry.html", nil); err != nil {
				logger.Error("failed to execute template", zap.Error(err))
			}
			return
		}

		// If a link is banned, respond with the not found page
		if link.Banned {
			w.WriteHeader(http.StatusNotFound)
			if err := redirectT.ExecuteTemplate(w, "not-found.html", nil); err != nil {
				logger.Error("failed to execute template", zap.Error(err))
			}
			return
		}

		// LINK IS PASSWORD PROTECTED , REDIRECT TO AUTH PAGE
		if link.Password != "" {
			if err := redirectT.ExecuteTemplate(w, "secure.html", AuthPageProps{
				Slug: slug,
			}); err != nil {
				logger.Error("failed to execute template", zap.Error(err))
			}
			return
		}

		// Log redirect metadata for analytics
		redirectMetadata := repository.NewRedirectMetadata(*r, ipDB, asnDB, *link)
		fileLogger.Info("redirect analytics",
			zap.String("linkSlug", link.Slug),
			zap.String("linkId", link.ID),
			zap.String("userAgent", r.UserAgent()),
			zap.String("ip", utils.GetClientIP(r)),
			zap.String("asn", redirectMetadata.ASN),
			zap.String("asnOrganization", redirectMetadata.ASNOrganization),
			zap.Object("redirectMetadata", redirectMetadata),
		)
		logger.Info("redirect analytics",
			zap.String("linkSlug", link.Slug),
			zap.String("linkId", link.ID),
			zap.String("userAgent", r.UserAgent()),
			zap.String("ip", utils.GetClientIP(r)),
			zap.String("asn", redirectMetadata.ASN),
			zap.String("asnOrganization", redirectMetadata.ASNOrganization),
			zap.Object("redirectMetadata", redirectMetadata),
		)

		// Do not use link.URL, use redirectMetadata.LinkURL instead.
		// Redirect URL could be a geo-specific/ios/android link.
		redirectURL := redirectMetadata.LinkURL

		if err := redirectT.ExecuteTemplate(w, "en-MY.html", WaitPageProps{
			URL:         redirectURL,
			Title:       link.Title,
			Description: link.Description,
			ImageURL:    link.ImageURL,
		}); err != nil {
			logger.Error("failed to execute template", zap.Error(err))
		}
	}), "handleLinkVisit"))

	http.Handle("/auth", otelhttp.NewHandler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		if r.Method == "POST" {
			decoder := json.NewDecoder(r.Body)
			var prop AuthPostProps
			err := decoder.Decode(&prop)
			user_input_password := prop.Password
			slug := prop.Slug
			if err != nil {
				logger.Error("Unable to find post parameter in /auth")
				var returnStruct PostReturnProps
				returnStruct.Status = false
				returnStruct.Message = "Unable to find POST parameters"
				w.Header().Add("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(returnStruct)
				return
			}

			link, err := linkRepo.GetLink(ctx, slug)
			if err == repository.ErrLinkNotFound {
				logger.Info("link not found",
					zap.String("slug", slug),
					zap.String("ip", utils.GetClientIP(r)),
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
					zap.String("ip", utils.GetClientIP(r)),
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

			err = bcrypt.CompareHashAndPassword([]byte(link.Password), []byte(user_input_password))
			if err != nil { // USER PROVIDE WRONG PASSWORD
				var returnStruct PostReturnProps
				returnStruct.Status = false
				returnStruct.Message = "Wrong Password"
				w.Header().Add("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(returnStruct)
				return
			}

			// LINK IS PASSWORD PROTECTED AND USER PROVIDED CORRECT PASSWORD
			// Log redirect metadata for analytics
			redirectMetadata := repository.NewRedirectMetadata(*r, ipDB, asnDB, *link)
			fileLogger.Info("redirect analytics",
				zap.String("linkSlug", link.Slug),
				zap.String("linkId", link.ID),
				zap.String("userAgent", r.UserAgent()),
				zap.String("ip", utils.GetClientIP(r)),
				zap.Object("redirectMetadata", redirectMetadata),
			)
			logger.Info("redirect analytics",
				zap.String("linkSlug", link.Slug),
				zap.String("linkId", link.ID),
				zap.String("userAgent", r.UserAgent()),
				zap.String("ip", utils.GetClientIP(r)),
				zap.Object("redirectMetadata", redirectMetadata),
			)

			// Do not use link.URL, use redirectMetadata.LinkURL instead.
			// Redirect URL could be a geo-specific/ios/android link.
			redirectURL := redirectMetadata.LinkURL
			var returnStruct PostReturnProps
			returnStruct.Status = true
			returnStruct.Message = "Password Authenticated"
			returnStruct.URL = redirectURL
			w.Header().Add("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(returnStruct)
			return

		}
		// METHOD NOT ALLOWED
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
