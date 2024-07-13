import { prisma } from "@/lib/prisma";
import { Kafka } from "kafkajs";
import { z } from "zod";
import { OUTBOX_ACTIONS } from "./actions";

const OUTBOX_TOPIC =
  process.env.OUTBOX_TOPIC || "ps-postgres.public.WebhookOutbox";

const OutboxSchema = z.object({
  id: z.string().min(1),
  host: z.string().min(1),
  payload: z.string().min(1),
  createdAt: z.string().min(1),
  action: z.string().min(1),
  headers: z.string().min(1),
  partitionKey: z.string().min(1),
});

async function main() {
  const kafkaBrokerUrl = process.env.KAFKA_BROKER_URL || "localhost:9092";
  const kafka = new Kafka({
    clientId: process.env.NEXT_PUBLIC_APP_SHORT_DOMAIN || "go.gov.my",
    brokers: [kafkaBrokerUrl],
  });

  const consumer = kafka.consumer({
    groupId: "redirect-group",
    minBytes: 10e3, // 10KB
    maxBytes: 10e6, // 10MB
    retry: {
      retries: Number.MAX_SAFE_INTEGER,
    },
  });

  await consumer.connect();
  await consumer.subscribe({
    topic: OUTBOX_TOPIC,
    fromBeginning: true,
  });

  const log = consumer.logger();
  log.info("Starting kafka consumer...");

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) {
        return;
      }

      const processMessage = async (attempt = 0) => {
        try {
          const { payload: debeziumPayload } = JSON.parse(
            message.value?.toString("utf8") || "{}",
          );

          if (
            Object.keys(debeziumPayload).length === 0 &&
            debeziumPayload.constructor === Object
          ) {
            // Skip further processing if the payload is an empty object
            return;
          }

          if (debeziumPayload.op === "c") {
            // debeziumPayload.after is the newly inserted row in WebhookOutbox table
            const {
              id: outboxId,
              host,
              payload,
              action,
              headers,
            } = await OutboxSchema.parseAsync(debeziumPayload.after);

            // This is where we should store the partition key id into the outbox table

            let response: Response;

            switch (action) {
              case OUTBOX_ACTIONS.CREATE_LINK:
                log.info(
                  `Sending a request to the redirect server: POST ${host}`,
                );
                response = await fetch(host, {
                  method: "POST",
                  headers: JSON.parse(headers),
                  body: payload,
                });
                break;
              case OUTBOX_ACTIONS.UPDATE_LINK:
                log.info(
                  `Sending a request to the redirect server: POST ${host}`,
                );
                response = await fetch(host, {
                  method: "PUT",
                  headers: JSON.parse(headers),
                  body: payload,
                });
                break;
              case OUTBOX_ACTIONS.DELETE_LINK:
                const { id: linkId } = JSON.parse(payload);
                log.info(
                  `Sending a request to the redirect server: DELETE ${host}`,
                );
                response = await fetch(host, {
                  method: "DELETE",
                  headers: JSON.parse(headers),
                });
                break;
              default:
                log.error(
                  `Unhandled outbox action '${action}', ID = ${outboxId}`,
                );
                return;
            }

            if (response.ok) {
              log.info("Response to redirect-server was successful");
              await prisma.webhookOutbox.delete({ where: { id: outboxId } });
              log.info(`WebhookOutbox row with ID ${outboxId} was deleted`);
              await consumer.commitOffsets([
                {
                  topic,
                  partition,
                  offset: (parseInt(message.offset, 10) + 1).toString(),
                },
              ]);
            } else if (response.status === 409) {
              log.info("Link already exists in ES. Skip to next message.");
              await consumer.commitOffsets([
                {
                  topic,
                  partition,
                  offset: (parseInt(message.offset, 10) + 1).toString(),
                },
              ]);
            } else {
              log.error(
                `Response to redirect-server was unsuccessful, status: ${response.status}, outboxId: ${outboxId}`,
              );
              throw new Error(
                `Response to redirect-server was unsuccessful, status: ${response.status}`,
              );
            }
          }
        } catch (err) {
          console.error(`Attempt ${attempt + 1} failed:`, err);

          // Lets do every 1 minute with a random jitter of 5 seconds
          const delay = 60 * 1000 + Math.random() * 5000;

          log.info(`Retrying in ${(delay / 1000).toFixed(2)} seconds...`);

          setTimeout(() => processMessage(attempt + 1), delay);
        }
      };

      processMessage();
    },
  });
}

main();
