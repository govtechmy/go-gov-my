import { register } from '@/lib/metrics/prom';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const headers = new Headers({
      'Content-Type': register.contentType,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'x-nextjs-cache': 'MISS',
    });
    return new NextResponse(await register.metrics(), { headers });
  } catch (err) {
    return NextResponse.json(
      { error: 'Error collecting metrics' },
      {
        status: 500,
      }
    );
  }
}
