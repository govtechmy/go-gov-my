import { Kafka } from 'kafkajs';

export function createKafkaClient(brokerUrl: string) {
  return new Kafka({
    clientId: 'gogov-web-outbox',
    brokers: [brokerUrl],
    retry: {
      initialRetryTime: 100,
      maxRetryTime: 30000,
      retries: 10,
    },
    connectionTimeout: 30000,
    requestTimeout: 30000,
  });
}

export async function createConsumer(kafka: Kafka, groupId: string) {
  const consumer = kafka.consumer({
    groupId,
    minBytes: 10e3,
    maxBytes: 10e6,
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
    maxWaitTimeInMs: 5000,
    retry: {
      initialRetryTime: 100,
      maxRetryTime: 30000,
      retries: 10,
    },
  });
  await consumer.connect();
  return consumer;
}
