import { withWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import z from "@/lib/zod";
import { DomainSchema } from "@/lib/zod/schemas/domains";
import { NextResponse } from "next/server";

// GET /api/domains – get all domains for a workspace
export const GET = withWorkspace(async ({ workspace }) => {
  const domains = await prisma.domain.findMany({
    where: {
      projectId: workspace.id,
    },
  });

  return NextResponse.json(z.array(DomainSchema).parse(domains));
});
