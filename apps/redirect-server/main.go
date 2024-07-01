package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
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

func main() {
    envFlag := flag.String("env", ENV_DEVELOPMENT, "App environment ('development' or 'production')")
    logPathFlag := flag.String("logPath", "logs/redirects.log", "Path to file to store short link redirect logs")
    flag.Parse()

    env = *envFlag
    logPath = *logPathFlag

    InitElasticsearch()
    InitTemplates()

    http.HandleFunc("/t/", redirectHandler)

    go startKafkaConsumer()

    log.Printf("Starting server on :3000 in %s mode\n", env)
    log.Fatal(http.ListenAndServeTLS(":3000", "./certificates/cert.pem", "./certificates/key.pem", nil))
}

func startKafkaConsumer() {
    var wg sync.WaitGroup
    ctx, cancel := context.WithCancel(context.Background())

    wg.Add(1)
    go func() {
        defer wg.Done()
        consumeKafka(ctx)
    }()

    sigs := make(chan os.Signal, 1)
    signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
    <-sigs
    log.Println("Received shutdown signal")

    cancel()
    wg.Wait()
    log.Println("Shutdown complete")
}
