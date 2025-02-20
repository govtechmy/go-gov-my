import { JobConfig, JobContext, JobResult, GitHubReleases } from '../types';
import { HttpClient } from '../utils/http';
import { reduceGithubReleases } from '../utils/github';
import { S3Uploader } from '../utils/s3';

export const releaseJobsConfig: JobConfig = {
  name: 'release',
  schedule: '0 3 * * *', // Everyday 3 am
  enabled: true,
  timeout: 30000, // 30 seconds
};

export async function releaseJob(context: JobContext): Promise<JobResult> {
  const { logger, config, discord } = context;
  config.webBase = '';
  const client = new HttpClient(config);

  try {
    logger.info(`Starting release job`);

    const githubApiKey = config.githubApiKey;

    if (!githubApiKey) {
      throw new Error('GITHUB_APIKEY environment variable is not set');
    }

    // First, get the token
    logger.info('Requesting authentication token...');
    const releases = await client.fetch<GitHubReleases>(
      'https://api.github.com/repos/govtechmy/go-gov-my/releases?per_page=100',
      {
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${githubApiKey}`,
        },
      }
    );

    logger.info('releases received, fetching stats...');

    const reduced = reduceGithubReleases(releases);

    if (!config.bucketName || !config.bucketRegion) {
      console.error('S3 configuration missing');
      throw new Error('Missing S3 configuration');
    }

    const uploader = new S3Uploader(config.bucketName, config.bucketRegion);

    const s3UploadJson = JSON.stringify(reduced, null, 2);

    const uploadedUrl = await uploader.uploadFile(
      'public/releaseDate.json',
      Buffer.from(s3UploadJson),
      'application/json'
    );

    console.log('Uploaded JSON file URL:', uploadedUrl);

    await discord.notify({
      title: '📊 Releases Updated',
      description: `New releases have been collected url: ${uploadedUrl}`,
      status: 'success',
      data: reduced,
    });

    logger.info(`Stats job completed successfully`, { reduced });
    return { success: true, data: reduced };
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

    logger.error(`Release job failed: ${error}`, { error });
    return { success: false, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}
