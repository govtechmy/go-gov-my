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

    // Log the status code after the handler completes
    console.log(`Status code: ${response.status}`);

    return response;
  };
}
