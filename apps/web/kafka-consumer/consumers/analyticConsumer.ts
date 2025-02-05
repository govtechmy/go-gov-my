import { prisma } from '@/lib/prisma';
import { AnalyticsMessageSchema } from 'kafka-consumer/models/AnalyticsSchema';
import type { Consumer, EachMessagePayload, Logger } from 'kafkajs';
import { consumeAnalytics, sumTwoObj, toIdempotentResource } from '../utils/analytics';
import { retryWithDelay } from '../utils/retry';

export async function runAnalyticConsumer(consumer: Consumer, log: Logger) {
  log.info('Starting analytic consumer...');
  await consumer.subscribe({
    topic: process.env.KAFKA_ANALYTIC_TOPIC!,
    fromBeginning: true,
  });
  log.info(`Subscribed to topic: ${process.env.KAFKA_ANALYTIC_TOPIC}`);

  await consumer.run({
    autoCommit: false,
    eachMessage: async (payload: EachMessagePayload) => {
      log.info('Received analytics message:', {
        topic: payload.topic,
        partition: payload.partition,
        offset: payload.message.offset,
      });
      try {
        await processMessage(payload, consumer, log);
      } catch (error) {
        if (error.name === 'KafkaJSOffsetOutOfRange') {
          const { topic, partition } = payload;
          log.warn(
            `Offset out of range for topic ${topic}, partition ${partition}. Resetting to earliest.`
          );
          await consumer.seek({ topic, partition, offset: '0' });
          // Optionally, you can retry processing the message here
          // await processMessage(payload, consumer, log);
        } else {
          log.error('Error processing message:', error);
          // Handle other types of errors as needed
        }
      }
    },
  });
}

async function processMessage(
  { topic, partition, message }: EachMessagePayload,
  consumer: Consumer,
  log: Logger
) {
  try {
    const processAnalyticsMessage = async () => {
      if (!message.value) return;

      const data = await AnalyticsMessageSchema.parseAsync(
        JSON.parse(message.value.toString('utf8') || '{}')
      );
      const { aggregatedDate, from, to } = data;
      const { idempotencyKey, hashedPayload } = toIdempotentResource(data);

      // Check if the message has been processed before
      const idempotentResource = await prisma.idempotentResource.findUnique({
        where: { idempotencyKey },
      });
      if (idempotentResource !== null) {
        if (idempotentResource.hashedPayload !== hashedPayload) {
          throw new Error('Idempotent resource hashed payload does not match');
        }
        // Commit offset and return early if the message is already processed
        await consumer.commitOffsets([
          {
            topic,
            partition,
            offset: (BigInt(message.offset) + BigInt(1)).toString(),
          },
        ]);
        return;
      }

      await prisma.$transaction(async (tx) => {
        const linkAnalyticsPromises = data.linkAnalytics.map(async (analytics) => {
          // Check if the link exists before attempting to update
          const existingLink = await tx.link.findUnique({
            where: { id: analytics.linkId },
            select: { id: true },
          });

          if (!existingLink) {
            console.log(`Link with ID ${analytics.linkId} not found. Skipping update.`);
            return; // Skip this iteration if the link doesn't exist
          }

          // 1. Get Analytics Rows
          const row = await prisma.analytics.findMany({
            where: {
              AND: [
                { aggregatedDate: new Date(aggregatedDate) },
                { linkId: { equals: analytics.linkId } },
              ],
            },
            take: 1,
          });

          if (row.length > 0) {
            const metaDataFromDb = row[0]?.metadata || {};

            // Sum metadata
            const combineMetaData = sumTwoObj(
              metaDataFromDb,
              consumeAnalytics(analytics, new Date(aggregatedDate), from, to).metadata
            );

            // Update records
            await tx.analytics.update({
              where: { id: row[0].id },
              data: { metadata: combineMetaData, from, to },
            });
          } else {
            // 3. If not exists, create a new record (meaning new day)
            await tx.analytics.create({
              data: consumeAnalytics(analytics, new Date(aggregatedDate), from, to),
            });
          }

          // Increment the link's clicks column with error handling
          try {
            await tx.link.update({
              where: { id: analytics.linkId },
              data: { clicks: { increment: analytics.total } },
            });
          } catch (error) {
            console.error(`Failed to update clicks for linkId: ${analytics.linkId}`, error);
          }

          // Increment the project's usage column with error handling
          try {
            const projectId = await tx.link.findUnique({
              where: { id: analytics.linkId },
              select: { projectId: true },
            });
            if (projectId?.projectId) {
              await tx.project.update({
                where: { id: projectId?.projectId },
                data: { usage: { increment: analytics.total } },
              });
            } else {
              console.warn(`No projectId found for linkId: ${analytics.linkId}`);
            }
          } catch (error) {
            console.error(`Failed to update clicks for linkId: ${analytics.linkId}`, error);
          }
        });

        await Promise.all(linkAnalyticsPromises);

        // Save the idempotent resource
        await tx.idempotentResource.create({
          data: { idempotencyKey, hashedPayload },
        });
      });

      // Commit offset if success
      await consumer.commitOffsets([
        {
          topic,
          partition,
          offset: (BigInt(message.offset) + BigInt(1)).toString(),
        },
      ]);
    };

    await retryWithDelay(processAnalyticsMessage);
  } catch (error) {
    log.error('Error processing analytics message:', error);
    throw error; // Re-throw the error to be caught by the outer try-catch
  }
}
