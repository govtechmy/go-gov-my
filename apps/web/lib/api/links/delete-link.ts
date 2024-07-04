import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { storage } from "@/lib/storage";
import { trace } from "@opentelemetry/api";
import { waitUntil } from "@vercel/functions";
import { OUTBOX_ACTIONS } from "kafka-consumer/actions";

export async function deleteLink(linkId: string) {
  const tracer = trace.getTracer("default");
  const span = tracer.startSpan("recordLinks");
  const link = await prisma.link.delete({
    where: {
      id: linkId,
    },
    include: {
      tags: true,
    },
  });

  try {
    waitUntil(
      Promise.allSettled([
        // if the image is stored in Cloudflare R2, delete it
        link.proxy &&
          link.image?.startsWith(process.env.STORAGE_BASE_URL as string) &&
          storage.delete(`images/${link.id}`),
        redis.hdel(link.domain.toLowerCase(), link.key.toLowerCase()),
        link.projectId &&
          prisma.project.update({
            where: {
              id: link.projectId,
            },
            data: {
              linksUsage: {
                decrement: 1,
              },
            },
          }),
        prisma.webhookOutbox.create({
          data: {
            action: OUTBOX_ACTIONS.DELETE_LINK,
            host: process.env.NEXT_PUBLIC_APP_DOMAIN || "go.gov.my",
            payload: link,
          },
        }),
      ]),
    );

    // Log results to OpenTelemetry
    span.addEvent("recordLinks", {
      link_id: link.id,
      domain: link.domain,
      key: link.key,
      url: link.url,
      tag_ids: link.tags.map((tag) => tag.tagId),
      workspace_id: link.projectId?.toString(),
      created_at: link.createdAt.toISOString(),
      deleted: true,
      logtime: new Date().toISOString(),
    });

    return link;
  } catch (error) {
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
}
