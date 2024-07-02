package main

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/elastic/go-elasticsearch/v7"
	"github.com/elastic/go-elasticsearch/v7/esapi"
	"github.com/segmentio/kafka-go"
)

type LinkMessage struct {
	ID        string `json:"id"`
	Key       string `json:"key"`
	URL       string `json:"url"`
	Expired   bool   `json:"expired"`
	CreatedAt string `json:"created_at"`
}

func initElasticsearch() (*elasticsearch.Client, error) {
	cfg := elasticsearch.Config{
		Addresses: []string{
			"http://localhost:9200",
		},
	}
	client, err := elasticsearch.NewClient(cfg)
	if err != nil {
		return nil, err
	}
	return client, nil
}

func consumeKafka(ctx context.Context) {
	r := kafka.NewReader(kafka.ReaderConfig{
		Brokers:        []string{"localhost:9092"},
		GroupID:        "redirect-group",
		Topic:          "ps-postgres.public.WebhookOutbox",
		MinBytes:       10e3, // 10KB
		MaxBytes:       10e6, // 10MB
		CommitInterval: time.Second, // Commit offsets every second
	})
	defer r.Close()
	
	indexName := "links" // Example index name, adjust as needed

	for {
		select {
		case <-ctx.Done():
			log.Println("Shutting down Kafka consumer...")
			return
		default:
			log.Println("Trying to read from Kafka...")
			m, err := r.ReadMessage(ctx)
			if err != nil {
				log.Printf("Error reading message from Kafka: %s", err)
				continue
			}
			log.Printf("Message received: %s", string(m.Value))

			var linkMessage LinkMessage
			err = json.Unmarshal(m.Value, &linkMessage)
			if err != nil {
				log.Printf("Error unmarshalling message: %s", err)
				continue
			}

			var buf bytes.Buffer
			if err := json.NewEncoder(&buf).Encode(linkMessage); err != nil {
				log.Printf("Error encoding document: %s", err)
				continue
			}

			req := esapi.IndexRequest{
				Index:      indexName,
				DocumentID: linkMessage.ID,
				Body:       &buf,
				Refresh:    "true",
			}

			res, err := req.Do(ctx, esClient)
			if err != nil {
				log.Printf("Error indexing document in Elasticsearch: %s", err)
				continue
			}
			defer res.Body.Close()

			if res.IsError() {
				log.Printf("[%s] Error indexing document ID=%s", res.Status(), linkMessage.ID)
			} else {
				log.Printf("Indexed link with ID: %s, response status: %s", linkMessage.ID, res.Status())
			}
		}
	}
}