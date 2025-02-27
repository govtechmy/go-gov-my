import { config } from './config';
import logger from './utils/logger';
import { statsJob } from './jobs/statsJob';
import { releaseJob } from './jobs/releaseDateJob';
import { JobContext } from './types';
import { DiscordNotifier } from './utils/discord';

async function main() {
  if (config.environment === 'local') {
    logger.info('Skipping job execution in local debug mode');
    process.exit(0);
  }

  const discord = new DiscordNotifier(config.discordWebhook, config.discordThreadId);
  const jobContext: JobContext = {
    logger,
    config,
    discord,
  };

  try {
    logger.info('Starting stats job execution');
    const result = await statsJob(jobContext);

    await discord.notify({
      title: '🤖 Stats Job Completed',
      description: 'The stats collection job has finished successfully',
      status: 'success',
      data: result.data,
    });

    logger.info('Job completed', { result });
  } catch (error) {
    await discord.notify({
      title: '❌ Stats Job Failed',
      description: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 'error',
      data: { error: error instanceof Error ? error.stack : 'Unknown error' },
    });

    logger.error('Job failed', { error });
    process.exit(1);
  }

  try {
    logger.info('Starting stats job execution');
    const result = await releaseJob(jobContext);

    await discord.notify({
      title: '🤖 Release Job Completed',
      description: 'The release date collection job has finished successfully',
      status: 'success',
      data: result.data,
    });

    logger.info('Job completed', { result });
  } catch (error) {
    await discord.notify({
      title: '❌ Release Job Failed',
      description: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 'error',
      data: { error: error instanceof Error ? error.stack : 'Unknown error' },
    });

    logger.error('Job failed', { error });
    process.exit(1);
  }
  process.exit(0);
}

main();
