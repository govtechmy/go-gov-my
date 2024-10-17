import { register } from '@/lib/metrics/prom';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const headers = new Headers({
      'Content-Type': register.contentType,
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
