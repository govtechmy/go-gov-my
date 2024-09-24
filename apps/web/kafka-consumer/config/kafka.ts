import { Kafka } from 'kafkajs';

export function createKafkaClient(brokerUrl: string) {
  return new Kafka({
    clientId: 'gogov-web-outbox',
    brokers: [brokerUrl],
  });
}

export async function createConsumer(kafka: Kafka, groupId: string) {
  const consumer = kafka.consumer({
    groupId,
    minBytes: 10e3, // 10KB
    maxBytes: 10e6, // 10MB
    retry: {
      retries: Number.MAX_SAFE_INTEGER,
    },
  });
  await consumer.connect();
  return consumer;
}
