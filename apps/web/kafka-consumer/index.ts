import { prisma } from "@/lib/prisma";
import { Kafka } from "kafkajs";
import { z } from "zod";

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
  const OUTBOX_TOPIC = process.env.OUTBOX_TOPIC;
  if (!OUTBOX_TOPIC) {
    throw Error("Missing env var OUTBOX_TOPIC");
  }

  const ANALYTIC_TOPIC = process.env.ANALYTIC_TOPIC;
  if (!ANALYTIC_TOPIC) {
    throw Error("Missing env var ANALYTIC_TOPIC");
  }

  const KAFKA_BROKER_URL = process.env.KAFKA_BROKER_URL;
  if (!KAFKA_BROKER_URL) {
    throw Error("Missing env var KAFKA_BROKER_URL");
  }

  const kafka = new Kafka({
    clientId: "gogov-web-outbox",
    brokers: [KAFKA_BROKER_URL],
  });

  const consumer = kafka.consumer({
    groupId: "redirect-group",
    minBytes: 10e3, // 10KB
    maxBytes: 10e6, // 10MB
    retry: {
      retries: Number.MAX_SAFE_INTEGER,
    },
  });

  const analyticConsumer = kafka.consumer({
    groupId: "analytic-group",
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

  await analyticConsumer.connect();
  await analyticConsumer.subscribe({
    topic: ANALYTIC_TOPIC,
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

            log.info(
              `Sending a request to the redirect server: ${action} ${host}`,
            );

            await fetch(host, {
              method: action,
              headers: JSON.parse(headers),
              body: payload,
            }).then(async (response) => {
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
              } else {
                log.error(
                  `Response to redirect-server was unsuccessful, status: ${response.status}, outboxId: ${outboxId}`,
                );
                throw new Error(
                  `Response to redirect-server was unsuccessful, status: ${response.status}`,
                );
              }
            });
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

  await analyticConsumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) {
        return;
      }

      const data = JSON.parse(message?.value?.toString("utf8") || "{}");
      const aggregatedDate = data?.aggregatedDate;
      const from = data?.from;
      const to = data?.to;

      function consumeAnalytics(
        link,
        aggregatedDate: Date,
        from: Date,
        to: Date,
      ) {
        const dataObject = JSON.parse(JSON.stringify(link)); // deep clone
        delete dataObject?.linkId;
        return {
          aggregatedDate: new Date(aggregatedDate),
          linkId: link?.linkId,
          from: from,
          to: to,
          metadata: dataObject,
        };
      }

      function sumTwoObj(obj1, obj2) {
        const clone = {}; // deep clone
        for (const key in obj1) {
          if (obj1.hasOwnProperty(key)) {
            clone[key] = obj1[key];
          }
        }
        for (const key in obj2) {
          if (obj2.hasOwnProperty(key)) {
            if (typeof obj2[key] === "number") {
              if (clone.hasOwnProperty(key)) {
                clone[key] += obj2[key];
              } else {
                clone[key] = obj2[key];
              }
            } else if (typeof obj2[key] === "object") {
              clone[key] = sumTwoObj(obj2[key], clone[key]);
            }
          }
        }
        return clone;
      }

      data?.linkAnalytics?.forEach(async (link) => {
        // INPUT INTO ANALYTICS
        try {
          const row = await prisma.analytics.findMany({
            where: {
              AND: [
                {
                  aggregatedDate: new Date(aggregatedDate),
                },
                {
                  linkId: {
                    equals: link?.linkId,
                  },
                },
              ],
            },
            take: 1,
          });
          if (row.length > 0) {
            const metaDataFromDb = row[0]?.metadata;
            const combineMetaData = sumTwoObj(
              metaDataFromDb,
              consumeAnalytics(link, aggregatedDate, from, to)?.metadata,
            );
            await prisma.analytics.update({
              where: {
                id: row[0].id,
              },
              data: {
                metadata: combineMetaData,
                from: from,
                to: to,
              },
            });
          } else {
            // INSERT FRESH ROW
            try {
              await prisma.analytics.create({
                data: consumeAnalytics(link, aggregatedDate, from, to),
              });
            } catch (error) {
              console.log("error", error);
            }
          }
        } catch (error) {
          console.log("error", error);
        }
        // INPUT INTO LINKS IF LINKID EXISTS
        async function processAddLinkClicks(attempt = 0) {
          if (link?.total && link?.linkId) {
            try {
              const linkRow = await prisma.link.findMany({
                where: {
                  id: link.linkId,
                },
                take: 1,
              });
              if (linkRow.length > 0) {
                const aggregatedClicks = (linkRow[0].clicks || 0) + link.total;
                await prisma.link.update({
                  where: {
                    id: link.linkId,
                  },
                  data: {
                    clicks: aggregatedClicks,
                  },
                });
              }
            } catch (error) {
              console.error(`Attempt ${attempt + 1} failed:`, error);

              // Lets do every 1 minute with a random jitter of 5 seconds
              const delay = 60 * 1000 + Math.random() * 5000;

              log.info(`Retrying in ${(delay / 1000).toFixed(2)} seconds...`);

              setTimeout(() => processAddLinkClicks(attempt + 1), delay);
            }
          }
        }
        processAddLinkClicks();
      });
    },
  });
}

main();
