import { createConsumer, createKafkaClient } from './config/kafka';
import { runAnalyticConsumer } from './consumers/analyticConsumer';
import { runOutboxConsumer } from './consumers/outboxConsumer';
import { validateEnvVars } from './utils/env';

async function main() {
  validateEnvVars(
    'OUTBOX_TOPIC',
    'ANALYTIC_TOPIC',
    'KAFKA_BROKER_URL',
    'ENCRYPTION_KEY_ID',
  );

  const kafka = createKafkaClient(process.env.KAFKA_BROKER_URL!);
  const outboxConsumer = await createConsumer(kafka, 'redirect-group');
  const analyticConsumer = await createConsumer(kafka, 'analytic-group');

  runOutboxConsumer(outboxConsumer, outboxConsumer.logger());
  runAnalyticConsumer(analyticConsumer, analyticConsumer.logger());
}

main();
