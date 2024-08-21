import { handleAndReturnErrorResponse } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const api_key = req.headers.get("API_KEY");
    if (api_key !== process.env.API_KEY) {
      return NextResponse.json({
        message: "WRONG API KEY",
      });
    }

    const userCount = await prisma.user.count();

    const linkCount = await prisma.link.count();

    const totalClicks = await prisma.link.aggregate({
      _sum: {
        clicks: true,
      },
    });

    const obj = {
      userCount,
      linkCount,
      totalClicks: totalClicks._sum.clicks || 0,
    };
    const buf = Buffer.from(JSON.stringify(obj));
    const { url } = await storage.upload("public/stats.json", buf);
    console.log("url", url);

    return NextResponse.json({
      url,
    });
  } catch (error) {
    return handleAndReturnErrorResponse(error);
  }
}
