import { DubApiError, handleAndReturnErrorResponse } from '@/lib/api/errors';
import { ratelimit } from '@/lib/redis/ratelimit';
import { PlanProps, WorkspaceProps } from '@/lib/types';
import { API_DOMAIN, getSearchParams } from '@dub/utils';
import { waitUntil } from '@vercel/functions';
import { StreamingTextResponse } from 'ai';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { isBetaTester } from '../edge-config';
import { prisma } from '../prisma';
import { hashToken } from './hash-token';
import type { Session } from './utils';

interface WithWorkspaceEdgeHandler {
  ({
    req,
    params,
    searchParams,
    headers,
    session,
    workspace,
  }: {
    req: Request;
    params: Record<string, string>;
    searchParams: Record<string, string>;
    headers?: Record<string, string>;
    session: Session;
    workspace: WorkspaceProps;
  }): Promise<Response | StreamingTextResponse>;
}

/**
 * @deprecated GoGovMy uses self-hosted DB and redis which does not run in edge environments.
 */
export const withWorkspaceEdge = (
  handler: WithWorkspaceEdgeHandler,
  {
    requiredPlan = [
      'free',
      'pro',
      'business',
      'business plus',
      'business max',
      'business extra',
      'enterprise',
    ], // if the action needs a specific plan
    requiredRole = ['owner', 'member'],
    needNotExceededClicks, // if the action needs the user to not have exceeded their clicks usage
    needNotExceededLinks, // if the action needs the user to not have exceeded their links usage
    needNotExceededAI, // if the action needs the user to not have exceeded their AI usage
    allowSelf, // special case for removing yourself from a workspace
    betaFeature, // if the action is a beta feature
  }: {
    requiredPlan?: Array<PlanProps>;
    requiredRole?: Array<'owner' | 'member'>;
    needNotExceededClicks?: boolean;
    needNotExceededLinks?: boolean;
    needNotExceededAI?: boolean;
    allowSelf?: boolean;
    betaFeature?: boolean;
  } = {}
) => {
  return async (req: Request, { params = {} }: { params: Record<string, string> | undefined }) => {
    const searchParams = getSearchParams(req.url);

    let apiKey: string | undefined = undefined;
    let headers = {};

    try {
      const authorizationHeader = req.headers.get('Authorization');
      if (authorizationHeader) {
        if (!authorizationHeader.includes('Bearer ')) {
          throw new DubApiError({
            code: 'bad_request',
            message:
              "Misconfigured authorization header. Did you forget to add 'Bearer '? Learn more: https://d.to/auth",
          });
        }
        apiKey = req.headers.get('x-api-key') || '';
      }

      const domain = params?.domain || searchParams.domain;
      const key = searchParams.key;
      const linkId = params?.linkId || searchParams.linkId || searchParams.externalId || undefined;

      let session: Session | undefined;
      let workspaceId: string | undefined;
      let workspaceSlug: string | undefined;

      const idOrSlug =
        params?.idOrSlug || searchParams.workspaceId || params?.slug || searchParams.projectSlug;

      // if there's no workspace ID or slug
      if (!idOrSlug) {
        throw new DubApiError({
          code: 'not_found',
          message:
            'Workspace id not found. Did you forget to include a `workspaceId` query parameter? Learn more: https://d.to/id',
        });
      }

      if (idOrSlug.startsWith('ws_')) {
        workspaceId = idOrSlug.replace('ws_', '');
      } else {
        workspaceSlug = idOrSlug;
      }

      if (apiKey) {
        const hashedKey = await hashToken(apiKey);

        const token = await prisma.token.findUnique({
          where: {
            hashedKey,
          },
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                agencyCode: true,
              },
            },
          },
        });
        if (!token) {
          throw new DubApiError({
            code: 'unauthorized',
            message: 'Unauthorized: Invalid API key.',
          });
        }

        const { success, limit, reset, remaining } = await ratelimit(apiKey, 600, '1 m');
        headers = {
          'Retry-After': reset.toString(),
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        };

        if (!success) {
          throw new DubApiError({
            code: 'rate_limit_exceeded',
            message: 'Too many requests.',
          });
        }
        waitUntil(
          prisma.token.update({
            where: {
              hashedKey,
            },
            data: {
              lastUsed: new Date(),
            },
          })
        );
        session = {
          user: {
            id: token.user.id,
            name: token.user.name || '',
            email: token.user.email,
            role: token.user.role,
            agencyCode: token.user.agencyCode,
          },
        };
      } else {
        session = (await getToken({
          req: req as NextRequest,
          secret: process.env.NEXTAUTH_SECRET,
        })) as unknown as Session;

        if (!session?.user?.id) {
          throw new DubApiError({
            code: 'unauthorized',
            message: 'Unauthorized: Login required.',
          });
        }
      }

      const workspace = (await prisma.project.findUnique({
        where: {
          id: workspaceId || undefined,
          slug: workspaceSlug || undefined,
        },
        include: {
          users: {
            where: {
              userId: session.user.id,
            },
            select: {
              role: true,
            },
          },
        },
      })) as WorkspaceProps;

      if (!workspace || !workspace.users) {
        // workspace doesn't exist
        throw new DubApiError({
          code: 'not_found',
          message: 'Workspace not found.',
        });
      }

      // beta feature checks
      if (betaFeature) {
        const betaTester = await isBetaTester(workspace.id);
        if (!betaTester) {
          throw new DubApiError({
            code: 'forbidden',
            message: 'Unauthorized: Beta feature.',
          });
        }
      }

      // workspace exists but user is not part of it
      if (workspace.users.length === 0) {
        const pendingInvites = await prisma.projectInvite.findUnique({
          where: {
            email_projectId: {
              email: session.user.email,
              projectId: workspace.id,
            },
          },
          select: {
            expires: true,
          },
        });
        if (!pendingInvites) {
          throw new DubApiError({
            code: 'not_found',
            message: 'Workspace not found.',
          });
        } else if (
          pendingInvites &&
          pendingInvites.expires &&
          pendingInvites.expires < new Date()
        ) {
          throw new DubApiError({
            code: 'invite_expired',
            message: 'Workspace invite expired.',
          });
        } else {
          throw new DubApiError({
            code: 'invite_pending',
            message: 'Workspace invite pending.',
          });
        }
      }

      // workspace role checks
      if (
        !requiredRole.includes(workspace.users[0].role) &&
        !(allowSelf && searchParams.userId === session.user.id)
      ) {
        throw new DubApiError({
          code: 'forbidden',
          message: 'Unauthorized: Insufficient permissions.',
        });
      }

      return await handler({
        req,
        params,
        searchParams,
        headers,
        session,
        workspace,
      });
    } catch (error) {
      return handleAndReturnErrorResponse(error, headers);
    }
  };
};
