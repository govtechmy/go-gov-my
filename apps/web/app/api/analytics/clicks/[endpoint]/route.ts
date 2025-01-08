import { getClicks } from '@/lib/analytics/clicks';
import { withWorkspace } from '@/lib/auth';
import { logRequestMetrics } from '@/lib/decorator/logRequestMetrics';
import { analyticsEndpointSchema, clickAnalyticsQuerySchema } from '@/lib/zod/schemas/analytics';
import { NextResponse } from 'next/server';

// GET /api/analytics/clicks/[endpoint] – get click analytics
export const GET = logRequestMetrics(
  withWorkspace(
    async ({ params, searchParams, workspace, link }) => {
      console.log('111', params, searchParams, workspace, link);
      const { endpoint = 'count' } = analyticsEndpointSchema.parse(params);

      const parsedParams = clickAnalyticsQuerySchema.parse(searchParams);
      const { domain, key, interval, start, end } = parsedParams;
      console.log('222', parsedParams);

      const linkId = link ? link.id : null;

      console.log('333', linkId);

      const response = await getClicks({
        ...parsedParams,
        endpoint,
        ...(linkId && { linkId }),
        workspaceId: workspace.id,
      });

      console.log('444', response);

      return NextResponse.json(response);
    },
    {
      needNotExceededClicks: true,
    }
  )
);
