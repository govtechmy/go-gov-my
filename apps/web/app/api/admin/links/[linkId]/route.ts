import { withAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/admin/links/[linkId] – get a link as an admin
export const GET = withAdmin(async ({ params }) => {
  const { linkId } = params;

  let link = await prisma.link.findUnique({
    where: {
      id: linkId,
    },
  });

  return NextResponse.json(link);
});
