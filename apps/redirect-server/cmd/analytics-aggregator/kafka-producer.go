package main

import (
	"context"
	"encoding/json"
	"log/slog"
	"time"

	"github.com/IBM/sarama"
)

type KafkaProducer struct {
	producer sarama.SyncProducer
	topic    string
}

type KafkaLinkAnalyticsMessage struct {
	AggregatedDate string          `json:"aggregatedDate"`
	From           time.Time       `json:"from"`
	To             time.Time       `json:"to"`
	LinkAnalytics  []LinkAnalytics `json:"linkAnalytics"`
}

func NewKafkaProducer(addr string, topic string) (*KafkaProducer, error) {
	producer, err := sarama.NewSyncProducer([]string{addr}, nil)
	if err != nil {
		return nil, err
	}

	return &KafkaProducer{producer: producer, topic: topic}, nil
}

func (kp *KafkaProducer) SendLinkAnalytics(ctx context.Context, shortDate string, from time.Time, to time.Time, analytics []LinkAnalytics) error {
	var err error

	message := KafkaLinkAnalyticsMessage{
		AggregatedDate: shortDate,
		From:           from,
		To:             to,
		LinkAnalytics:  analytics,
	}

	json, err := json.Marshal(message)
	if err != nil {
		return err
	}

	const retries = 3
	for i := 0; i < retries; i++ {
		partition, offset, err := kp.producer.SendMessage(&sarama.ProducerMessage{
			Topic: kp.topic,
			Value: sarama.ByteEncoder(json),
		})

		// Retry writing the message
		if err != nil {
			slog.Error(
				"failed to write kafka message",
				slog.Int("attempt", i+1),
			)
			time.Sleep(time.Millisecond * 500)
			continue
		}

		slog.Info("kafka message sent",
			slog.Int("partition", int(partition)),
			slog.Int("offset", int(offset)),
		)
		break
	}

	return err
}

func (kp *KafkaProducer) Close() error {
	return kp.producer.Close()
}
