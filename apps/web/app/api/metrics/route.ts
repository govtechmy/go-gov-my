import { counter200, register } from '@/lib/metrics/prom';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('1111', await counter200.get());
    const headers = new Headers({
      'Content-Type': register.contentType,
      'Cache-Control':
        'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0', // Disable caching
    });
    return new NextResponse(await register.metrics(), { headers });
  } catch (err) {
    return NextResponse.json(
      { error: 'Error collecting metrics' },
      {
        status: 500,
      },
    );
  }
}
