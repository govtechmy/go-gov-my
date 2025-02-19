import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const allowedDomains = await prisma.allowedDomains.find();

    return NextResponse.json(allowedDomains);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
