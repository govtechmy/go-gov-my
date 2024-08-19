import { handleAndReturnErrorResponse } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userCount = await prisma.user.count();

    console.log("userCount", userCount);

    const linkCount = await prisma.link.count();
    console.log("linkCount", linkCount);

    const totalClicks = await prisma.link.aggregate({
      _sum: {
        clicks: true,
      },
    });

    console.log("totalClicks", totalClicks);

    const obj = {
      userCount,
      linkCount,
      totalClicks: totalClicks._sum.clicks || 0,
    };
    const buf = Buffer.from(JSON.stringify(obj));
    const { url } = await storage.upload("stats.json", buf);
    console.log("url", url);

    return NextResponse.json({
      url,
    });
  } catch (error) {
    return handleAndReturnErrorResponse(error);
  }
}
