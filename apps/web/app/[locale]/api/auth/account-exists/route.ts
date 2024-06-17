import { isWhitelistedEmail } from "@/lib/edge-config";
import { prisma } from "@/lib/prisma";
import { ratelimit } from "@/lib/redis/ratelimit";
import { ipAddress } from "@vercel/edge";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const ip = ipAddress(req);
  const { success } = await ratelimit(`account-exists:${ip}`, 5, "1 m");
  if (!success) {
    return new Response("Don't DDoS me pls 🥺", { status: 429 });
  }

  const { email } = (await req.json()) as { email: string };

  if (!prisma) {
    return new Response("Database connection not established", {
      status: 500,
    });
  }

  if (!process.env.NEXT_PUBLIC_IS_DUB) {
    return NextResponse.json({ exists: true });
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (user) {
    return NextResponse.json({ exists: true });
  }

  const whitelisted = await isWhitelistedEmail(email);
  if (whitelisted) {
    return NextResponse.json({ exists: true });
  }

  return NextResponse.json({ exists: false });
}
