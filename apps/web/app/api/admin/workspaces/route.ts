import { withAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkspaceSchema } from "@/lib/zod/schemas/workspaces";
import { NextResponse } from "next/server";
import { z } from "zod";

const GetWorkspacesSearchParams = z.object({
  search: z.string().optional(),
  sort: z.enum(["createdAt"]).optional().default("createdAt"),
  page: z.coerce.number().int().default(1),
});

// GET /api/admin/workspaces
export const GET = withAdmin(async ({ searchParams }) => {
  const { search, sort, page } =
    await GetWorkspacesSearchParams.parseAsync(searchParams);

  const RESULTS_PER_PAGE = 100;

  const projects = await prisma.project.findMany({
    where: {
      ...(search && {
        OR: [
          {
            name: { contains: search },
          },
          {
            slug: { contains: search },
          },
        ],
      }),
    },
    orderBy: {
      [sort]: "desc",
    },
    take: RESULTS_PER_PAGE,
    skip: (page - 1) * RESULTS_PER_PAGE,
  });

  const workspaces = projects.map((project) =>
    WorkspaceSchema.omit({ users: true, domains: true }).parse({
      ...project,
      id: `ws_${project.id}`,
    }),
  );

  return NextResponse.json(workspaces);
});
