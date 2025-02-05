import { processDTOLink } from '@/lib/dto/link.dto';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { storage } from '@/lib/storage';
import { trace } from '@opentelemetry/api';
import { Prisma } from '@prisma/client';
import { waitUntil } from '@vercel/functions';
import { OUTBOX_ACTIONS } from 'kafka-consumer/utils/actions';
import generateIdempotencyKey from './create-idempotency-key';

const REDIRECT_SERVER_BASE_URL = process.env.REDIRECT_SERVER_URL || 'http://localhost:3002';

export async function deleteLink(linkId: string) {
  const tracer = trace.getTracer('default');
  const span = tracer.startSpan('recordLinks');

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Delete the link
      const link = await tx.link.delete({
        where: { id: linkId },
        include: { tags: true },
      });

      // Delete related analytics records
      await tx.analytics.deleteMany({
        where: { linkId },
      });

      return link;
    });

    const { payload, encryptedSecrets } = await processDTOLink(result);

    const headersJSON = generateIdempotencyKey(payload.id, new Date());

    waitUntil(
      Promise.allSettled([
        // Delete image in storage if applicable
        result.proxy &&
          result.image?.startsWith(process.env.STORAGE_BASE_URL as string) &&
          storage.delete(`images/${result.id}`),

        // Remove Redis cache entry
        redis.hdel(result.domain.toLowerCase(), result.key.toLowerCase()),

        // Update project usage stats if projectId exists
        result.projectId &&
          prisma.project.update({
            where: { id: result.projectId },
            data: { linksUsage: { decrement: 1 } },
          }),

        // Record in webhookOutbox
        prisma.webhookOutbox.create({
          data: {
            action: OUTBOX_ACTIONS.DELETE_LINK,
            host: REDIRECT_SERVER_BASE_URL + '/links/' + result.id,
            payload: payload as unknown as Prisma.InputJsonValue,
            headers: headersJSON,
            partitionKey: payload.slug,
            encryptedSecrets: encryptedSecrets,
          },
        }),
      ])
    );

    span.addEvent('recordLinks', {
      link_id: result.id,
      domain: result.domain,
      key: result.key,
      url: result.url,
      tag_ids: result.tags.map((tag) => tag.tagId),
      workspace_id: result.projectId?.toString(),
      created_at: result.createdAt.toISOString(),
      deleted: true,
      logtime: new Date().toISOString(),
    });

    return result;
  } catch (error) {
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
}
