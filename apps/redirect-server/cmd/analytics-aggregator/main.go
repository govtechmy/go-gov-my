package main

import (
	"context"
	"flag"
	"log/slog"
	"redirect-server/repository/es"
	"time"
)

func main() {
	var kafkaAddr string
	var kafkaTopic string
	var offsetPath string
	{
		flag.StringVar(&kafkaAddr, "kafka-addr", "localhost:9092", "Kafka address")
		flag.StringVar(&kafkaTopic, "kafka-topic", "link-analytics", "Kafka topic")
		flag.StringVar(&offsetPath, "offset-path", "./analytics-aggregator-offset", "Analytics aggregator offset")
	}
	flag.Parse()

	ctx := context.Background()

	kafkaProducer := NewKafkaProducer(kafkaAddr, kafkaTopic)
	defer kafkaProducer.Close()

	aggregator := &Aggregator{
		OffsetPath:           offsetPath,
		KafkaProducer:        kafkaProducer,
		RedirectMetadataRepo: es.NewRedirectMetadataRepo(),
	}

	// Run the aggregator every 5 minutes
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for {
		err := aggregator.Run(ctx)
		if err != nil {
			slog.Error("worker run failed", slog.String("errorMessage", err.Error()))
		}
		<-ticker.C
	}
}
