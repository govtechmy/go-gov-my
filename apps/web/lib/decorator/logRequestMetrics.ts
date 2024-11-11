import {
  counter200,
  counter201,
  counter400,
  counter401,
  counter500,
  httpRequestCount,
  httpRequestTimeTaken,
} from '@/lib/metrics/prom';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function logRequestMetrics(
  handler: (req: Request, params: any) => Promise<Response> | NextResponse
) {
  return async (req: NextRequest, params: any) => {
    const start_timestamp = Date.now();
    const response = await handler(req, params);
    const end_timestamp = Date.now();

    const time_diff = end_timestamp - start_timestamp;

    httpRequestCount.inc();
    httpRequestTimeTaken.inc(time_diff);

    switch (response.status) {
      case 200:
        counter200.inc();
        break;
      case 201:
        counter201.inc();
        break;
      case 400:
        counter400.inc();
        break;
      case 401:
        counter401.inc();
        break;
      case 500:
        counter500.inc();
        break;
      default:
        break;
    }

    return response;
  };
}
