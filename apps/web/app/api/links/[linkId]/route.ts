import { DubApiError, ErrorCodes } from '@/lib/api/errors';
import { deleteLink, processLink, transformLink, updateLink } from '@/lib/api/links';
import { parseRequestBody } from '@/lib/api/utils';
import { withWorkspace } from '@/lib/auth';
import { logRequestMetrics } from '@/lib/decorator/logRequestMetrics';
import { prisma } from '@/lib/prisma';
import { NewLinkProps } from '@/lib/types';
import { updateLinkBodySchema } from '@/lib/zod/schemas/links';
import { deepEqual } from '@dub/utils';
import { NextResponse } from 'next/server';

// GET /api/links/[linkId] – get a link
export const GET = logRequestMetrics(
  withWorkspace(async ({ headers, link }) => {
    if (!link) {
      throw new DubApiError({
        code: 'not_found',
        message: 'Link not found.',
      });
    }

    const tags = await prisma.tag.findMany({
      where: {
        links: {
          some: {
            linkId: link.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
    });

    const response = transformLink({
      ...link,
      tags: tags.map((tag) => {
        return { tag };
      }),
    });

    return NextResponse.json(response, { headers });
  })
);

// PATCH /api/links/[linkId] – update a link
export const PATCH = logRequestMetrics(
  withWorkspace(async ({ req, headers, workspace, link, session }) => {
    if (!link) {
      throw new DubApiError({
        code: 'not_found',
        message: 'Link not found.',
      });
    }

    const bodyRaw = await parseRequestBody(req);
    const body = updateLinkBodySchema.parse(bodyRaw);

    // Add body onto existing link but maintain NewLinkProps form for processLink
    const updatedLink = {
      ...link,
      expiresAt: link.expiresAt instanceof Date ? link.expiresAt.toISOString() : link.expiresAt,
      geo: link.geo as NewLinkProps['geo'],
      ...body,
    };

    // if link and updatedLink are identical, return the link
    if (deepEqual(link, updatedLink)) {
      return NextResponse.json(link, { headers });
    }

    if (updatedLink.projectId !== link?.projectId) {
      throw new DubApiError({
        code: 'forbidden',
        message:
          'Transferring links to another workspace is only allowed via the /links/[linkId]/transfer endpoint.',
      });
    }

    const {
      link: processedLink,
      error,
      code,
    } = await processLink({
      payload: updatedLink,
      workspace,
      // if domain and key are the same, we don't need to check if the key exists
      skipKeyChecks:
        link.domain === updatedLink.domain &&
        link.key.toLowerCase() === updatedLink.key?.toLowerCase(),
    });

    if (error) {
      throw new DubApiError({
        code: code as ErrorCodes,
        message: error,
      });
    }

    try {
      const response = await updateLink({
        oldDomain: link.domain,
        oldKey: link.key,
        updatedLink: processedLink,
        sessionUserId: session.user.id,
      });

      return NextResponse.json(response, {
        headers,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new DubApiError({
          code: 'conflict',
          message: 'A link with this externalId already exists.',
        });
      }

      throw new DubApiError({
        code: 'unprocessable_entity',
        message: error.message,
      });
    }
  })
);

// backwards compatibility
export const PUT = PATCH;

// DELETE /api/links/[linkId] – delete a link
export const DELETE = logRequestMetrics(
  withWorkspace(async ({ headers, link }) => {
    console.log({ link });
    await deleteLink(link!.id);

    return NextResponse.json(
      { id: link!.id },
      {
        headers,
      }
    );
  })
);
