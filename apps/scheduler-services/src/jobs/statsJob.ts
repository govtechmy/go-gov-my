import { JobConfig, JobContext, JobResult } from '../types';
import { HttpClient } from '../utils/http';

export const statsJobConfig: JobConfig = {
  name: 'stats',
  schedule: '*/5 * * * *', // Every 5 minutes
  enabled: true,
  timeout: 30000, // 30 seconds
};

export async function statsJob(context: JobContext): Promise<JobResult> {
  const { logger, config, discord } = context;
  const client = new HttpClient(config);

  try {
    logger.info(`Starting stats job`);

    const data = await client.fetch<any>('/api/stats');

    await discord.notify({
      title: '📊 Stats Updated',
      description: 'New statistics have been collected',
      status: 'success',
      data: data,
    });

    logger.info(`Stats job completed successfully`, { data });
    return { success: true, data };
  } catch (error) {
    await discord.notify({
      title: '❌ Stats Collection Failed',
      description: 'Failed to collect statistics',
      status: 'error',
      data: {
        error: error instanceof Error ? error.name : 'Unknown error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'Unknown error',
      },
    });

    logger.error(`Stats job failed: ${error}`, { error });
    return { success: false, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}
