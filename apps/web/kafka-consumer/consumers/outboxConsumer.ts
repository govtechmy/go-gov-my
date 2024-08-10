import { prisma } from "@/lib/prisma";
import { OutboxSchema } from "../models/OutboxSchema";
import { retryWithDelay } from "../utils/retry";

export async function runOutboxConsumer(consumer: any, log: any) {
  await consumer.subscribe({
    topic: process.env.OUTBOX_TOPIC!,
    fromBeginning: true,
  });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;

      const processMessage = async () => {
        const { payload: debeziumPayload } = JSON.parse(
          message.value.toString("utf8") || "{}",
        );

        if (Object.keys(debeziumPayload).length === 0) return;

        if (debeziumPayload.op === "c") {
          const {
            id: outboxId,
            host,
            payload,
            action,
            headers,
          } = await OutboxSchema.parseAsync(debeziumPayload.after);

          log.info(`Sending request to redirect server: ${action} ${host}`);

          const response = await fetch(host, {
            method: action,
            headers: JSON.parse(headers),
            body: payload,
          });

          if (response.ok) {
            await prisma.webhookOutbox.delete({ where: { id: outboxId } });
            await consumer.commitOffsets([
              {
                topic,
                partition,
                offset: (parseInt(message.offset, 10) + 1).toString(),
              },
            ]);
            log.info(`WebhookOutbox row with ID ${outboxId} was deleted`);
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
