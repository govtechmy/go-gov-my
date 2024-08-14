import { prisma } from "@/lib/prisma";
import { AnalyticsMessageSchema } from "kafka-consumer/models/AnalyticsSchema";
import type { Consumer, Logger } from "kafkajs";
import {
  consumeAnalytics,
  sumTwoObj,
  toIdempotentResource,
} from "../utils/analytics";
import { retryWithDelay } from "../utils/retry";

export async function runAnalyticConsumer(consumer: Consumer, log: Logger) {
  await consumer.subscribe({
    topic: process.env.ANALYTIC_TOPIC!,
    fromBeginning: true,
  });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      const processAnalyticsMessage = async () => {
        if (!message.value) return;

        const data = await AnalyticsMessageSchema.parseAsync(
          JSON.parse(message.value.toString("utf8") || "{}"),
        );
        const { aggregatedDate, from, to } = data;
        const { idempotencyKey, hashedPayload } = toIdempotentResource(data);

        // Check if the message has been processed before
        const idempotentResource = await prisma.idempotentResource.findUnique({
          where: { idempotencyKey },
        });
        if (idempotentResource !== null) {
          if (idempotentResource.hashedPayload !== hashedPayload) {
            throw new Error(
              "Idempotent resource hashed payload does not match",
            );
          }
          // Commit offset and return early if the message is already processed
          await consumer.commitOffsets([
            {
              topic,
              partition,
              offset: (parseInt(message.offset, 10) + 1).toString(),
            },
          ]);
          return;
        }

        const linkAnalyticsPromises = data.linkAnalytics.map(
          async (analytics) => {
            // 1. Get Analytics Rows
            const row = await prisma.analytics.findMany({
              where: {
                AND: [
                  { aggregatedDate: aggregatedDate },
                  { linkId: { equals: analytics.linkId } },
                ],
              },
              take: 1,
            });

            // 2. Check if today record already exists
            if (row.length > 0) {
              const metaDataFromDb = row[0]?.metadata;

              // Sum metadata
              const combineMetaData = sumTwoObj(
                metaDataFromDb,
                consumeAnalytics(analytics, new Date(aggregatedDate), from, to)
                  .metadata,
              );

              // Update records
              await prisma.analytics.update({
                where: { id: row[0].id },
                data: { metadata: combineMetaData, from, to },
              });
            } else {
              // 3. If not exists, create a new record (meaning new day)
              await prisma.analytics.create({
                data: consumeAnalytics(
                  analytics,
                  new Date(aggregatedDate),
                  from,
                  to,
                ),
              });
            }

            // Increment the link's clicks column
            await prisma.link.update({
              where: { id: analytics.linkId },
              data: { clicks: { increment: analytics.total } },
            });
          },
        );

        await Promise.all(linkAnalyticsPromises);

        // Save the idempotent resource
        await prisma.idempotentResource.create({
          data: { idempotencyKey, hashedPayload },
        });

        // Commit offset if success
        await consumer.commitOffsets([
          {
            topic,
            partition,
            offset: (parseInt(message.offset, 10) + 1).toString(),
          },
        ]);
      };

      retryWithDelay(processAnalyticsMessage);
    },
  });
}
