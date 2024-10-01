import { NextResponse } from 'next/server';
import { collectDefaultMetrics, Registry } from 'prom-client';

const register = new Registry();
collectDefaultMetrics({ register });

export async function GET() {
  try {
    const metrics = await register.metrics();

    return NextResponse.json(metrics, {
      headers: {
        'Content-Type': register.contentType,
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
