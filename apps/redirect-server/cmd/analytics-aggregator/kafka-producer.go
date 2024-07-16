package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"

	"github.com/segmentio/kafka-go"
)

type KafkaProducer struct {
	w *kafka.Writer
}

func NewKafkaProducer(addr string, topic string) *KafkaProducer {
	w := &kafka.Writer{
		Addr:                   kafka.TCP(addr),
		Topic:                  topic,
		AllowAutoTopicCreation: true,
		Logger: kafka.LoggerFunc(func(msg string, args ...any) {
			slog.Info(fmt.Sprintf(msg, args...))
		}),
		ErrorLogger: kafka.LoggerFunc(func(msg string, args ...any) {
			slog.Error(fmt.Sprintf(msg, args...))
		}),
	}

	return &KafkaProducer{w: w}
}

func (kp *KafkaProducer) SendLinkAnalytics(ctx context.Context, analytics []LinkAnalytics) error {
	json, err := json.Marshal(analytics)
	if err != nil {
		return err
	}

	err = kp.w.WriteMessages(ctx,
		kafka.Message{
			Value: json,
		},
	)
	if err != nil {
		return err
	}

	return nil
}

func (kp *KafkaProducer) Close() error {
	return kp.w.Close()
}
