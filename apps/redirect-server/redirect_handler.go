package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
)

func redirectHandler(w http.ResponseWriter, r *http.Request) {
    key := r.URL.Path[len("/t/"):]
    if key == "" {
        http.Error(w, "Key not provided", http.StatusBadRequest)
        return
    }

    if env == ENV_DEVELOPMENT && key == "test" {
        logRedirect(key, r.RemoteAddr)
        renderWaitPage(w, "https://www.google.com/")
        return
    }

    exists, expired, originalURL := checkLinkInElasticsearch(key)
    if !exists {
        http.Error(w, "Link not found", http.StatusNotFound)
        return
    }
    if expired {
        http.Error(w, "Link has expired", http.StatusGone)
        return
    }

    logRedirect(key, r.RemoteAddr)
    renderWaitPage(w, originalURL)
}

func logRedirect(key, remoteAddr string) {
    redirect := map[string]interface{}{
        "key":        key,
        "remoteAddr": remoteAddr,
        "timestamp":  time.Now().Unix(),
    }

    file, err := os.OpenFile(logPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
    if err != nil {
        log.Printf("Failed to open log file: %s", err)
        return
    }
    defer file.Close()

    encoder := json.NewEncoder(file)
    if err := encoder.Encode(redirect); err != nil {
        log.Printf("Failed to write log entry: %s", err)
    }
}


var ( baseDomainUrl = "https://go.gov.my/" )


func renderWaitPage(w http.ResponseWriter, originalURL string) {
    data := struct {
        URL        string
        BaseDomain string
    }{
        URL:        originalURL,
        BaseDomain: baseDomainUrl,
    }

    err := t.ExecuteTemplate(w, "wait.html", data)
    if err != nil {
        log.Printf("Error executing template: %s", err)
        t.ExecuteTemplate(w, "notfound.html", data)
    }
}
