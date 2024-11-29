import { DubApiError, handleAndReturnErrorResponse } from '@/lib/api/errors';
import { prisma } from '@/lib/prisma';
import { ratelimit } from '@/lib/redis/ratelimit';
import { PlanProps, WorkspaceProps } from '@/lib/types';
import { API_DOMAIN, getSearchParams } from '@dub/utils';
import { Link as LinkProps } from '@prisma/client';
import { waitUntil } from '@vercel/functions';
import { hashToken } from './hash-token';
import { Session, getSession } from './utils';

interface WithWorkspaceHandler {
  ({
    req,
    params,
    searchParams,
    headers,
    session,
    workspace,
    domain,
    link,
  }: {
    req: Request;
    params: Record<string, string>;
    searchParams: Record<string, string>;
    headers?: Record<string, string>;
    session: Session;
    workspace: WorkspaceProps;
    domain: string;
    link?: LinkProps;
    userWorkspaceRole: 'owner' | 'member';
  }): Promise<Response>;
}

export const withWorkspace = (
  handler: WithWorkspaceHandler,
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
    skipLinkChecks, // special case for /api/links/exists – skip link checks
  }: {
    requiredPlan?: Array<PlanProps>;
    /** The workspace roles that are required for the user. Does not apply to super admins. */
    requiredRole?: Array<'owner' | 'member'>;
    needNotExceededClicks?: boolean;
    needNotExceededLinks?: boolean;
    skipLinkChecks?: boolean;
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
        console.log(req.headers.get('x-api-key'));
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

        const user = await prisma.user.findFirst({
          where: {
            tokens: {
              some: {
                hashedKey,
              },
            },
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            agencyCode: true,
          },
        });
        if (!user) {
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
            id: user.id,
            name: user.name || '',
            email: user.email,
            role: user.role,
            agencyCode: user.agencyCode,
          },
        };
      } else {
        session = await getSession();
        if (!session?.user?.id) {
          throw new DubApiError({
            code: 'unauthorized',
            message: 'Unauthorized: Login required.',
          });
        }
      }

      let [workspace, link] = (await Promise.all([
        prisma.project.findUnique({
          where: {
            id: workspaceId || undefined,
            slug: workspaceSlug || undefined,
            agencyCode: session.user.agencyCode,
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
        }),
        linkId
          ? prisma.link.findUnique({
              where: {
                ...(linkId.startsWith('ext_') && workspaceId
                  ? {
                      projectId_externalId: {
                        projectId: workspaceId,
                        externalId: linkId.replace('ext_', ''),
                      },
                    }
                  : { id: linkId }),
              },
            })
          : domain &&
            key &&
            prisma.link.findUnique({
              where: {
                domain_key: {
                  domain,
                  key,
                },
              },
            }),
      ])) as [WorkspaceProps, LinkProps | undefined];

      if (!workspace) {
        // workspace doesn't exist
        throw new DubApiError({
          code: 'not_found',
          message: 'Workspace not found.',
        });
      }

      // edge case where linkId is an externalId and workspaceId was not provided (they must've used projectSlug instead)
      // in this case, we need to try fetching the link again
      if (linkId && linkId.startsWith('ext_') && !link && !workspaceId) {
        link = (await prisma.link.findUnique({
          where: {
            projectId_externalId: {
              projectId: workspace.id,
              externalId: linkId.replace('ext_', ''),
            },
          },
        })) as LinkProps;
      }

      // null if user is not part of the workspace
      let userWorkspaceRole = workspace.users.at(0)?.role || null;

      // super admins have the same priveleges as workspace owners
      if (session.user.role === 'super_admin') {
        userWorkspaceRole = 'owner';
      }

      // User is not part of the workspace, check if they have pending invitations
      if (!userWorkspaceRole) {
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
      if (!requiredRole.includes(userWorkspaceRole)) {
        throw new DubApiError({
          code: 'forbidden',
          message: 'Unauthorized: Insufficient permissions.',
        });
      }

      // link checks (if linkId is provided)
      if (linkId && !skipLinkChecks) {
        // make sure the link is owned by the workspace
        if (!link || link.projectId !== workspace?.id) {
          throw new DubApiError({
            code: 'not_found',
            message: 'Link not found.',
          });
        }
      }

      return await handler({
        req,
        params,
        searchParams,
        headers,
        session,
        workspace,
        domain,
        link,
        userWorkspaceRole,
      });
    } catch (error) {
      return handleAndReturnErrorResponse(error, headers);
    }
  };
};
