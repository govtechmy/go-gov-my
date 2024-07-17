package main

import (
	"context"
	"flag"
	"log/slog"
	"os"
	"redirect-server/repository/es"
	"time"

	"github.com/olivere/elastic/v7"
)

const AGGREGATE_INTERVAL = 5 * time.Minute

func main() {
	var elasticURL string
	var elasticUser string
	var elasticPassword string
	var kafkaAddr string
	var kafkaTopic string
	var offsetPath string
	{
		flag.StringVar(&elasticURL, "elastic-url", "http://localhost:9200", "Elasticsearch URL")
		flag.StringVar(&elasticUser, "elastic-user", "elastic", "Elasticsearch username")
		flag.StringVar(&elasticPassword, "elastic-password", os.Getenv("ELASTIC_PASSWORD"), "Elasticsearch password")
		flag.StringVar(&kafkaAddr, "kafka-addr", "localhost:9092", "Kafka address")
		flag.StringVar(&kafkaTopic, "kafka-topic", "link-analytics", "Kafka topic")
		flag.StringVar(&offsetPath, "offset-path", "./analytics-aggregator-offset", "Analytics aggregator offset")
	}
	flag.Parse()

	ctx := context.Background()

	kafkaProducer := NewKafkaProducer(kafkaAddr, kafkaTopic)
	defer kafkaProducer.Close()

	esClient, err := elastic.NewSimpleClient(
		elastic.SetURL(elasticURL),
		elastic.SetBasicAuth(elasticUser, elasticPassword),
	)
	if err != nil {
		panic(err)
	}

	aggregator := &Aggregator{
		OffsetPath:           offsetPath,
		KafkaProducer:        kafkaProducer,
		RedirectMetadataRepo: es.NewRedirectMetadataRepo(esClient),
	}

	// Run the aggregator every 5 minutes
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for {
		from, err := getOffset(offsetPath)
		if err != nil {
			slog.Error("failed to get offset", slog.String("errorMessage", err.Error()))
		}
		to := time.Now()

		// TODO: Handle case where 'from' and 'to' are different dates
		if from.Format("2006-01-02") != to.Format("2006-01-02") {
			slog.Warn("to and from have different dates",
				slog.Time("from", from),
				slog.Time("to", to),
			)
		}

		shortDate := to.Format("2006-01-02")

		err = aggregator.Run(ctx, shortDate, from, to)
		if err != nil {
			slog.Error("worker run failed",
				slog.String("errorMessage", err.Error()),
				slog.String("shortDate", shortDate),
				slog.Time("from", from),
				slog.Time("to", to),
			)
		} else {
			saveOffset(offsetPath, to)
		}

		<-ticker.C
	}
}

func getOffset(offsetPath string) (time.Time, error) {
	data, err := os.ReadFile(offsetPath)
	if os.IsNotExist(err) {
		// If offset not found, use the time N minutes ago
		fiveMinutesAgo := time.Now().Add(-AGGREGATE_INTERVAL)
		return fiveMinutesAgo, nil
	}
	if err != nil {
		return time.Time{}, err
	}

	t, err := time.Parse(time.RFC3339, string(data))
	if err != nil {
		return time.Time{}, err
	}

	return t, nil
}

func saveOffset(offsetPath string, t time.Time) error {
	err := os.WriteFile(offsetPath, []byte(t.Format(time.RFC3339)), 0644)
	if err != nil {
		return err
	}

	return nil
}
