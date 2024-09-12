import { DubApiError } from "@/lib/api/errors";
import { withAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = withAdmin(async ({ params }) => {
  if (!params.linkId) {
    throw new DubApiError({
      code: "bad_request",
      message: "Missing linkId in path params",
    });
  }

  const link = await prisma.link.findUnique({
    where: {
      id: params.linkId,
    },
  });

  if (!link) {
    throw new DubApiError({
      code: "not_found",
      message: "Link not found",
    });
  }

  const history = await prisma.linkHistory.findMany({
    where: {
      linkId: link.id,
    },
    include: {
      committedByUser: true,
    },
    orderBy: {
      timestamp: "desc",
    },
  });

  return NextResponse.json(history);
});
