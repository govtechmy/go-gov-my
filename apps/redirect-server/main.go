package main

import (
	"flag"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

const (
    ENV_DEVELOPMENT = "development"
    ENV_PRODUCTION  = "production"
)

var (
    env       string
    logPath   string
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
    logPathFlag := flag.String("logPath", "logs/redirects.log", "Path to file to store short link redirect logs")
    flag.Parse()

    env = *envFlag
    logPath = *logPathFlag

    InitElasticsearch()
    InitTemplates()

    http.HandleFunc("/", redirectHandler)
    http.HandleFunc("/links", indexLinkHandler)
    http.HandleFunc("/links/", deleteLinkHandler)

    log.Printf("Starting server on :3000 in %s mode\n", env)
    
    if (os.Getenv("NODE_ENV") == ENV_DEVELOPMENT) {
        log.Fatal(http.ListenAndServe(":3000", nil))
    } else {
        log.Fatal(http.ListenAndServeTLS(":3000", "./certificates/cert.pem", "./certificates/key.pem", nil))
    }
}
