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

type KafkaLinkAnalyticsMessage struct {
	ShortDate     string          `json:"shortDate"`
	From          time.Time       `json:"from"`
	To            time.Time       `json:"to"`
	LinkAnalytics []LinkAnalytics `json:"linkAnalytics"`
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

func (kp *KafkaProducer) SendLinkAnalytics(ctx context.Context, shortDate string, from time.Time, to time.Time, analytics []LinkAnalytics) error {
	var err error

	message := KafkaLinkAnalyticsMessage{
		ShortDate:     shortDate,
		From:          from,
		To:            to,
		LinkAnalytics: analytics,
	}

	json, err := json.Marshal(message)
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
