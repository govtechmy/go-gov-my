import { promClient } from '@/lib/metrics/prom';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return new NextResponse(await promClient.register.metrics());
  } catch (err) {
    return NextResponse.json(
      { error: 'Error collecting metrics' },
      {
        status: 500,
      },
    );
  }
}
