import { DubApiError, ErrorCodes } from "@/lib/api/errors";
import { createLink, getLinksForWorkspace, processLink } from "@/lib/api/links";
import { parseRequestBody } from "@/lib/api/utils";
import { withWorkspace } from "@/lib/auth";
import {
  createLinkBodySchema,
  getLinksQuerySchemaExtended,
} from "@/lib/zod/schemas/links";
import { getSearchParamsWithArray } from "@dub/utils";
import { NextResponse } from "next/server";

// GET /api/links – get all links for a workspace
export const GET = withWorkspace(async ({ req, headers, workspace }) => {
  const searchParams = getSearchParamsWithArray(req.url);

  const {
    domain,
    tagId,
    tagIds,
    search,
    sort,
    page,
    userId,
    showArchived,
    withTags,
    includeUser,
  } = getLinksQuerySchemaExtended.parse(searchParams);

  const response = await getLinksForWorkspace({
    workspaceId: workspace.id,
    domain,
    tagId,
    tagIds,
    search,
    sort,
    page,
    userId,
    showArchived,
    withTags,
    includeUser,
  });

  return NextResponse.json(response, {
    headers,
  });
});

// POST /api/links – create a new link
export const POST = withWorkspace(
  async ({ req, headers, session, workspace }) => {
    const bodyRaw = await parseRequestBody(req);
    const body = createLinkBodySchema.parse(bodyRaw);

    const { link, error, code } = await processLink({
      payload: body,
      workspace,
      ...(session && { userId: session.user.id }),
    });

    if (error != null) {
      throw new DubApiError({
        code: code as ErrorCodes,
        message: error,
      });
    }

    try {
      console.log("yyyyyy", link);
      const response = await createLink(link, {
        sessionUserId: session.user.id,
      });
      return NextResponse.json(response, { headers });
    } catch (error) {
      if (error.code === "P2002") {
        throw new DubApiError({
          code: "conflict",
          message: "A link with this externalId already exists.",
        });
      }

      throw new DubApiError({
        code: "unprocessable_entity",
        message: error.message,
      });
    }
  },
  {
    needNotExceededLinks: true,
  },
);
