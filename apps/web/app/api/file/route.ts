import { withSession } from '@/lib/auth';
import { logRequestMetrics } from '@/lib/decorator/logRequestMetrics';
import { NextResponse } from 'next/server';
import uploadFiles from '@/lib/api/links/upload-files';
// import uploadFiles from '../../../lib/api/links/upload-files';

// POST /api/file upload a specific file
export const POST = logRequestMetrics(
  withSession(async ({ req, session }) => {
    // Check for the API key in the headers
    const apiKey = req.headers.get('api_key');
    if (apiKey !== process.env.S3_API_KEY) {
      return NextResponse.json({ error: 'Bad request.' }, { status: 401 });
    }

    try {
      const formData = await req.formData();
      const result = uploadFiles(formData, session);

      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
  })
);
