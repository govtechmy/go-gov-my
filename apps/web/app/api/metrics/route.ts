import { counter200, register } from '@/lib/metrics/prom';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const headers = new Headers({
      'Content-Type': register.contentType,
    });
    console.log('1111', await counter200.get());
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
