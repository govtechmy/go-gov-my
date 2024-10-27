import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { decipherOutboxPayload } from 'kafka-consumer/utils/encryption';
import { OutboxSchema } from '../models/OutboxSchema';
import { retryWithDelay } from '../utils/retry';

export async function runOutboxConsumer(consumer: any, log: any) {
  await consumer.subscribe({
    topic: process.env.OUTBOX_TOPIC!,
    fromBeginning: true,
  });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;

      console.log('message received');

      const processMessage = async () => {
        const { payload: debeziumPayload } = JSON.parse(
          message.value.toString('utf8') || '{}',
        );

        console.log('payload extracted', debeziumPayload);

        if (Object.keys(debeziumPayload).length === 0) return;

        if (debeziumPayload.op === 'c') {
          const {
            id: outboxId,
            host,
            payload,
            action,
            headers,
            encryptedSecrets,
          } = await OutboxSchema.parseAsync(debeziumPayload.after);

          let finalPayload = payload;

          // If the outbox has encrypted secrets, we need to decipher the payload
          if (encryptedSecrets) {
            finalPayload = await decipherOutboxPayload({
              payload,
              encryptedSecrets,
            });
          }

          log.info(`Sending request to redirect server: ${action} ${host}`);
          console.log(`Sending request to redirect server: ${action} ${host}`);

          const response = await fetch(host, {
            method: action,
            headers: JSON.parse(headers),
            body: finalPayload,
          });

          console.log('response.ok', response.ok);

          if (response.ok) {
            try {
              await prisma.webhookOutbox.delete({ where: { id: outboxId } });
              log.info(`WebhookOutbox with ID ${outboxId} has been processed`);
            } catch (error) {
              if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2025'
              ) {
                log.warn(
                  `WebhookOutbox with ID ${outboxId} was already processed before`,
                );
              } else {
                throw error;
              }
            }
            await consumer.commitOffsets([
              {
                topic,
                partition,
                offset: (parseInt(message.offset, 10) + 1).toString(),
              },
            ]);
          } else {
            throw new Error(
              `Response unsuccessful, status: ${response.status}`,
            );
          }
        }
      };

      retryWithDelay(processMessage);
    },
  });
}
