import { DubApiError } from '@/lib/api/errors';
import generateIdempotencyKey from '@/lib/api/links/create-idempotency-key';
import { withWorkspace } from '@/lib/auth';
import { logRequestMetrics } from '@/lib/decorator/logRequestMetrics';
import { prisma } from '@/lib/prisma';
import { waitUntil } from '@vercel/functions';
import { REDIRECT_SERVER_BASE_URL } from 'kafka-consumer/utils/actions';

// Disable password protection for a link
export const DELETE = logRequestMetrics(
  withWorkspace(async ({ link }) => {
    if (!link) {
      throw new DubApiError({
        code: 'not_found',
        message: 'Link not found.',
      });
    }

    await prisma.link.update({
      where: { id: link.id },
      data: { passwordEnabledAt: null },
    });

    const { 'X-Idempotency-Key': idempotencyKey } = generateIdempotencyKey(
      link.id,
      new Date(),
    );

    const outboxPromise = prisma.webhookOutbox.create({
      data: {
        action: 'DELETE',
        host: `${REDIRECT_SERVER_BASE_URL}/links/${link.id}/password`,
        payload: '',
        headers: {
          'X-Idempotency-Key': idempotencyKey,
        },
        partitionKey: link.key,
      },
    });

    waitUntil(Promise.all([outboxPromise]));

    return new Response();
  }),
);
