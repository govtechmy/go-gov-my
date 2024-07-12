import { withAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkspaceSchema } from "@/lib/zod/schemas/workspaces";
import { NextResponse } from "next/server";
import { z } from "zod";

const GetWorkspacesSearchParams = z.object({
  search: z.string().optional(),
});

// GET /api/admin/workspaces
export const GET = withAdmin(async ({ searchParams }) => {
  const { search } = await GetWorkspacesSearchParams.parseAsync(searchParams);

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
  });

  const workspaces = projects.map((project) =>
    WorkspaceSchema.omit({ users: true, domains: true }).parse({
      ...project,
      id: `ws_${project.id}`,
    }),
  );

  return NextResponse.json(workspaces);
});
