import { prisma } from "@/lib/prisma";
import { consumeAnalytics, sumTwoObj } from "../utils/analytics";
import { retryWithDelay } from "../utils/retry";

export async function runAnalyticConsumer(consumer: any, log: any) {
  await consumer.subscribe({
    topic: process.env.ANALYTIC_TOPIC!,
    fromBeginning: true,
  });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;

      const data = JSON.parse(message?.value?.toString("utf8") || "{}");
      const aggregatedDate = data?.aggregatedDate;
      const from = data?.from;
      const to = data?.to;

      const processMessageAnalytics = async () => {
        data?.linkAnalytics?.forEach(async (link) => {
          // 1. Get Analytics Rows
          const row = await prisma.analytics.findMany({
            where: {
              AND: [
                { aggregatedDate: new Date(aggregatedDate) },
                { linkId: { equals: link?.linkId } },
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
              consumeAnalytics(link, aggregatedDate, from, to)?.metadata,
            );

            // Update records
            await prisma.analytics.update({
              where: { id: row[0].id },
              data: { metadata: combineMetaData, from, to },
            });
          } else {
            // 3. If not exists, create a new record (meaning new day)
            await prisma.analytics.create({
              data: consumeAnalytics(link, aggregatedDate, from, to),
            });
          }

          // Lets update the link.clicks table
          if (link?.total && link?.linkId) {
            // Find the link in the table
            const linkDb = await prisma.link.findFirst({
              where: { id: link.linkId },
            });

            // Let kafka retry until success if the link is not found
            if (linkDb === null || linkDb === undefined) {
              throw new Error("Link not found in the database");
            }

            const aggregatedClicks = linkDb.clicks + link.total;

            await prisma.link.update({
              where: { id: link.linkId },
              data: { clicks: aggregatedClicks },
            });
          }
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

      retryWithDelay(processMessageAnalytics);
    },
  });
}
