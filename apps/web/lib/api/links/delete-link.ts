import { processDTOLink } from "@/lib/dto/link.dto";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { storage } from "@/lib/storage";
import { trace } from "@opentelemetry/api";
import { Prisma } from "@prisma/client";
import { waitUntil } from "@vercel/functions";
import { OUTBOX_ACTIONS } from "kafka-consumer/actions";
import generateIdempotencyKey from "./create-idempotency-key";

const REDIRECT_SERVER_BASE_URL =
  process.env.REDIRECT_SERVER_URL || "http://localhost:3001";

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

  // Transform into DTOs
  const linkDTO = await processDTOLink(link);

  // For simplicity and centralized, lets create the idempotency key at this level
  const headersJSON = generateIdempotencyKey(linkDTO.id, new Date());

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
            host: REDIRECT_SERVER_BASE_URL + "/links/" + link.id,
            payload: linkDTO as unknown as Prisma.InputJsonValue,
            headers: headersJSON,
            partitionKey: linkDTO.slug,
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
