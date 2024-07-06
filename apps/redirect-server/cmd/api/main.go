package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/joho/godotenv"
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
	rootDir, err := filepath.Abs(filepath.Join(".", "..", "..", "..", ".."))
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

	InitElasticsearch()

	// todo: add tracing

	// ### Public server for public endpoints
	// ### This is used for NextJS to interact with the API routes
	publicMux := http.NewServeMux()
	publicMux.HandleFunc("/links", indexLinkHandler)
	publicMux.HandleFunc("/links/", deleteLinkHandler)

	// ### Internal server for internal endpoints (you can add internal handlers here)
	// ### This is used for internal communication between services
	internalMux := http.NewServeMux()
	internalMux.HandleFunc("/internal/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Define the server for Public
	publicServer := &http.Server{
		Addr:    ":3000",
		Handler: publicMux,
	}

	// Define the server for Internal
	internalServer := &http.Server{
		Addr:    ":3001",
		Handler: internalMux,
	}

	// Graceful shutdown
	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, syscall.SIGINT, syscall.SIGTERM)

	// Start the servers for Public
	go func() {
		log.Printf("Starting public server on :3000 in %s mode\n", env)
		if err := publicServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Could not listen on :3000: %v\n", err)
		}
	}()

	// Start the servers for Internal
	go func() {
		log.Printf("Starting internal server on :3001 in %s mode\n", env)
		if err := internalServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Could not listen on :3001: %v\n", err)
		}
	}()

	<-shutdown
	
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := publicServer.Shutdown(ctx); err != nil {
		log.Fatalf("Public server forced to shutdown: %v", err)
	}

	if err := internalServer.Shutdown(ctx); err != nil {
		log.Fatalf("Internal server forced to shutdown: %v", err)
	}

	log.Println("Servers stopped gracefully")
}
