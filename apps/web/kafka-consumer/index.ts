import { createConsumer, createKafkaClient } from './config/kafka';
import { runAnalyticConsumer } from './consumers/analyticConsumer';
import { runOutboxConsumer } from './consumers/outboxConsumer';
import { validateEnvVars } from './utils/env';

async function main() {
  validateEnvVars(
    'KAFKA_OUTBOX_TOPIC',
    'KAFKA_ANALYTIC_TOPIC',
    'KAFKA_BROKER_URL',
    'ENCRYPTION_KEY_ID',
    'KAFKA_GROUP_ID_REDIRECT',
    'KAFKA_GROUP_ID_ANALYTICS'
  );

  console.log('Connecting to Kafka broker at:', process.env.KAFKA_BROKER_URL);

  const kafka = createKafkaClient(process.env.KAFKA_BROKER_URL!);
  const admin = kafka.admin();

  console.log('Environment variables:', {
    KAFKA_OUTBOX_TOPIC: process.env.KAFKA_OUTBOX_TOPIC,
    KAFKA_ANALYTIC_TOPIC: process.env.KAFKA_ANALYTIC_TOPIC,
    KAFKA_BROKER_URL: process.env.KAFKA_BROKER_URL,
    KAFKA_GROUP_ID_REDIRECT: process.env.KAFKA_GROUP_ID_REDIRECT,
    KAFKA_GROUP_ID_ANALYTICS: process.env.KAFKA_GROUP_ID_ANALYTICS,
  });

  try {
    const topics = await admin.listTopics();
    console.log('Available Kafka topics:', topics);

    const outboxTopic = process.env.KAFKA_OUTBOX_TOPIC!;
    const analyticTopic = process.env.KAFKA_ANALYTIC_TOPIC!;

    console.log('Checking if required topics exist:', {
      outboxTopic,
      analyticTopic,
      availableTopics: topics,
    });

    const outboxConsumer = await createConsumer(
      kafka,
      process.env.KAFKA_GROUP_ID_REDIRECT || 'redirect-group'
    );
    const analyticConsumer = await createConsumer(
      kafka,
      process.env.KAFKA_GROUP_ID_ANALYTICS || 'analytics-group'
    );

    console.log('Successfully connected to Kafka');

    runOutboxConsumer(outboxConsumer, outboxConsumer.logger());
    runAnalyticConsumer(analyticConsumer, analyticConsumer.logger());

    console.log('Kafka consumers started');
  } catch (error) {
    console.error('Failed to connect to Kafka:', error);
    process.exit(1);
  } finally {
    await admin.disconnect();
  }
}

main();
