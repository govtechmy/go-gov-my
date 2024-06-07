import { DubApiError } from "@/lib/api/errors";
import { withWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/domains/[domain] – get a workspace's domain
export const GET = withWorkspace(
  async ({ domain }) => {
    const data = await prisma.domain.findUnique({
      where: {
        slug: domain,
      },
      select: {
        slug: true,
        verified: true,
        primary: true,
        target: true,
        type: true,
        placeholder: true,
        clicks: true,
        expiredUrl: true,
      },
    });
    if (!data) {
      throw new DubApiError({
        code: "not_found",
        message: "Domain not found",
      });
    }
    return NextResponse.json({
      ...data,
      url: data.target,
    });
  },
  {
    domainChecks: true,
  },
);
