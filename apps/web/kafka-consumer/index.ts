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

  const kafka = createKafkaClient(process.env.KAFKA_BROKER_URL!);
  const outboxConsumer = await createConsumer(
    kafka,
    process.env.KAFKA_GROUP_ID_REDIRECT || 'redirect-group'
  );
  const analyticConsumer = await createConsumer(
    kafka,
    process.env.KAFKA_GROUP_ID_ANALYTICS || 'analytics-group'
  );

  runOutboxConsumer(outboxConsumer, outboxConsumer.logger());
  runAnalyticConsumer(analyticConsumer, analyticConsumer.logger());
}

main();
