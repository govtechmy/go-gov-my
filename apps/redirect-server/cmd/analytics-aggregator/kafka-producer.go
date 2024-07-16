package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"time"

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
	var err error

	json, err := json.Marshal(analytics)
	if err != nil {
		return err
	}

	const retries = 3
	for i := 0; i < retries; i++ {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		err = kp.w.WriteMessages(ctx,
			kafka.Message{
				Value: json,
			},
		)

		// Retry writing the message
		if err != nil {
			slog.Error(
				"failed to write kafka message",
				slog.Int("attempt", i+1),
			)
			time.Sleep(time.Millisecond * 500)
			continue
		}

		break
	}

	return err
}

func (kp *KafkaProducer) Close() error {
	return kp.w.Close()
}
