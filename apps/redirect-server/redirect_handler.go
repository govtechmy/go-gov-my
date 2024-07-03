package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

var ( 
    baseDomainUrl string 
    errorRedirectUrl string
)

func redirectHandler(w http.ResponseWriter, r *http.Request) {
    key := strings.TrimPrefix(r.URL.Path, "/")

    if key == "" {
        logErrorAndRedirect(w, r, "Key not provided")
        return
    }

    exists, expired, originalURL := checkLinkInElasticsearch(key)
    if !exists {
        logErrorAndRedirect(w, r, "Link not found")
        return
    }
    if expired {
        logErrorAndRedirect(w, r, "Link has expired")
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

func logErrorAndRedirect(w http.ResponseWriter, r *http.Request, message string) {
    key := strings.TrimPrefix(r.URL.Path, "/")

    redirect := map[string]interface{}{
        "key":        key,
        "remoteAddr": r.RemoteAddr,
        "timestamp":  time.Now().Unix(),
        "error":      message,
    }

    file, err := os.OpenFile(logPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
    if err != nil {
        log.Printf("Failed to open log file: %s", err)
    } else {
        defer file.Close()
        encoder := json.NewEncoder(file)
        if err := encoder.Encode(redirect); err != nil {
            log.Printf("Failed to write log entry: %s", err)
        }
    }

    // Redirect to landing page
    if os.Getenv("NODE_ENV") == ENV_DEVELOPMENT {
        errorRedirectUrl ="http://" + os.Getenv("NEXT_PUBLIC_APP_APP_DOMAIN")
    } else {
        errorRedirectUrl = "https://" + os.Getenv("NEXT_PUBLIC_APP_SHORT_DOMAIN")
    }
    
    http.Redirect(w, r, errorRedirectUrl, http.StatusSeeOther)
}
