import { withSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const ITEMS_PER_PAGE = 10;

// GET /api/admin/workspaces – Admin get to see all workspaces and links based on roles
export const GET = withSession(async ({ session, req }) => {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const search = url.searchParams.get("search") || "";

  if (!["super_admin", "agency_admin"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const where = {
    ...(session.user.role === "agency_admin"
      ? { user: { agencyCode: session.user.agencyCode } }
      : {}),
    OR: [
      { domain: { contains: search, mode: "insensitive" } },
      { key: { contains: search, mode: "insensitive" } },
      { url: { contains: search, mode: "insensitive" } },
      { project: { name: { contains: search, mode: "insensitive" } } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ],
  };

  const [links, totalCount] = await Promise.all([
    prisma.link.findMany({
      where: {
        ...where,
        OR: [
          { domain: { contains: search, mode: "insensitive" } },
          { key: { contains: search, mode: "insensitive" } },
          { url: { contains: search, mode: "insensitive" } },
          { project: { name: { contains: search, mode: "insensitive" } } },
          { user: { name: { contains: search, mode: "insensitive" } } },
        ],
      },
      include: {
        project: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
    }),
    prisma.link.count({
      where: {
        ...where,
        OR: where.OR?.map((condition) => ({
          domain: condition.domain
            ? { contains: condition.domain.contains, mode: "insensitive" }
            : undefined,
          key: condition.key
            ? { contains: condition.key.contains, mode: "insensitive" }
            : undefined,
          url: condition.url
            ? { contains: condition.url.contains, mode: "insensitive" }
            : undefined,
          project: condition.project
            ? {
                name: {
                  contains: condition.project.name.contains,
                  mode: "insensitive",
                },
              }
            : undefined,
          user: condition.user
            ? {
                name: {
                  contains: condition.user.name.contains,
                  mode: "insensitive",
                },
              }
            : undefined,
        })),
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return NextResponse.json({
    links,
    totalPages,
    currentPage: page,
  });
});
