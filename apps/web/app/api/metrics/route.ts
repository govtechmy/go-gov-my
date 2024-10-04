import { promClient } from '@/lib/metrics/statuscode';
import { NextResponse } from 'next/server';

export const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

export async function GET() {
  try {
    return NextResponse.json(await promClient.register.metrics(), {
      headers: {
        'Content-Type': promClient.register.contentType,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Error collecting metrics' },
      {
        status: 500,
      },
    );
  }
}
