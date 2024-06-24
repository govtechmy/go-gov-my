package main

import (
	"bytes"
	"context"
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/elastic/go-elasticsearch/v7"
)

var (
    esClient   *elasticsearch.Client
    indexName  = "links"
    baseDomainUrl = "https://go.gov.my/"
)

func main() {
    var err error

    // Initialize the Elasticsearch client
    esClient, err = elasticsearch.NewDefaultClient()
    if err != nil {
        log.Fatalf("Error creating the Elasticsearch client: %s", err)
    }

    http.HandleFunc("/t/", redirectHandler)
    log.Println("Starting server on :8080")
    log.Fatal(http.ListenAndServeTLS(":8080", "cert.pem", "key.pem", nil))
}

func redirectHandler(w http.ResponseWriter, r *http.Request) {
    key := r.URL.Path[len("/t/"):]
    if key == "" {
        http.Error(w, "Key not provided", http.StatusBadRequest)
        return
    }

    // Only for test... 
    if (key == "test") {
        logRedirect(key, r.RemoteAddr)
        renderWaitPage(w, key, "https://www.google.com/")
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

    renderWaitPage(w, key, originalURL)
}

func checkLinkInElasticsearch(key string) (exists, expired bool, originalURL string) {
    query := map[string]interface{}{
        "query": map[string]interface{}{
            "term": map[string]interface{}{
                "key": key,
            },
        },
    }
    var buf bytes.Buffer
    if err := json.NewEncoder(&buf).Encode(query); err != nil {
        log.Printf("Error encoding query: %s", err)
        return false, false, ""
    }

    res, err := esClient.Search(
        esClient.Search.WithContext(context.Background()),
        esClient.Search.WithIndex(indexName),
        esClient.Search.WithBody(&buf),
        esClient.Search.WithTrackTotalHits(true),
    )
    if err != nil {
        log.Printf("Error querying Elasticsearch: %s", err)
        return false, false, ""
    }
    defer res.Body.Close()

    if res.IsError() {
        var e map[string]interface{}
        if err := json.NewDecoder(res.Body).Decode(&e); err != nil {
            log.Printf("Error parsing the response body: %s", err)
        } else {
            log.Printf("[%s] %s: %s",
                res.Status(),
                e["error"].(map[string]interface{})["type"],
                e["error"].(map[string]interface{})["reason"],
            )
        }
        return false, false, ""
    }

    var r map[string]interface{}
    if err := json.NewDecoder(res.Body).Decode(&r); err != nil {
        log.Printf("Error parsing the response body: %s", err)
        return false, false, ""
    }

    if r["hits"].(map[string]interface{})["total"].(map[string]interface{})["value"].(float64) == 0 {
        return false, false, ""
    }

    for _, hit := range r["hits"].(map[string]interface{})["hits"].([]interface{}) {
        var link struct {
            Key         string `json:"key"`
            Expired     bool   `json:"expired"`
            OriginalURL string `json:"original_url"`
        }
        source := hit.(map[string]interface{})["_source"]
        linkJSON, err := json.Marshal(source)
        if err != nil {
            log.Printf("Error marshalling hit source: %s", err)
            continue
        }
        if err := json.Unmarshal(linkJSON, &link); err != nil {
            log.Printf("Error unmarshalling hit source: %s", err)
            continue
        }
        return true, link.Expired, link.OriginalURL
    }

    return false, false, ""
}

func logRedirect(key, remoteAddr string) {
    redirect := map[string]interface{}{
        "key":        key,
        "remoteAddr": remoteAddr,
        "timestamp":  time.Now().Unix(),
    }

    file, err := os.OpenFile("logs/redirects.json", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
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

func renderWaitPage(w http.ResponseWriter, key, originalURL string) {
    tmpl := `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirecting...</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
        .container { max-width: 600px; margin: auto; }
        .spinner { margin: 20px auto; width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #3498db; border-radius: 50%; animation: spin 2s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
    <script>
        setTimeout(function() {
            window.location.href = "{{.URL}}";
        }, 10000);
    </script>
</head>
<body>
    <div class="container">
        <h1>Check your address bar</h1>
        <p>Beware of phishing, make sure it starts with <b style="color:red">{{.BaseDomain}}</b></p>
        <div class="spinner"></div>
        <p>You'll be redirected in 10 seconds...</p>
    </div>
</body>
</html>
`
    data := struct {
        URL        string
        BaseDomain string
    }{
        URL:        originalURL,
        BaseDomain: baseDomainUrl,
    }

    t, err := template.New("wait").Parse(tmpl)
    if err != nil {
        log.Printf("Error parsing template: %s", err)
        http.Error(w, "Internal server error", http.StatusInternalServerError)
        return
    }

    err = t.Execute(w, data)
    if err != nil {
        log.Printf("Error executing template: %s", err)
        http.Error(w, "Internal server error", http.StatusInternalServerError)
    }
}
