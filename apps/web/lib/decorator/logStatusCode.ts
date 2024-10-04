import {
  counter200,
  counter201,
  counter400,
  counter401,
  counter500,
} from '@/lib/metrics/prom';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function logStatusCode(
  handler: (
    req: NextRequest,
    params: any,
  ) => Promise<NextResponse> | NextResponse,
) {
  return async (req: NextRequest, params: any) => {
    const response = await handler(req, params);

    console.log(`Status code: ${response.status}`);
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
    }

    return response;
  };
}
