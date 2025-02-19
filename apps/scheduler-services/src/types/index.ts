import { Logger } from 'winston';
import { DiscordNotifier } from '../utils/discord';

export interface JobConfig {
  name: string;
  schedule: string;
  enabled: boolean;
  timeout?: number;
}

export interface JobContext {
  logger: Logger;
  config: Config;
  discord: DiscordNotifier;
}

export interface JobResult {
  success: boolean;
  data?: any;
  error?: Error;
}

export interface Config {
  apiKey: string;
  webBase: string;
  environment: string;
  discordWebhook: string;
  discordThreadId?: string;
  githubApiKey?: string;
  bucketName?: string;
  bucketRegion?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
}

export interface GitHubRelease {
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
  id: number;
  author: GitHubUser;
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string;
  draft: boolean;
  prerelease: boolean;
  created_at: string;
  published_at: string;
  assets: GitHubAsset[];
  tarball_url: string;
  zipball_url: string;
  body: string;
}

export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  user_view_type: string;
  site_admin: boolean;
  mention_count?: number;
}

export interface GitHubAsset {
  name: string;
  browser_download_url: string;
}

export type GitHubReleases = GitHubRelease[];

export interface App {
  name: string;
  published_at: string;
}

export interface FormattedRelease {
  app: string;
  last_released: string;
}
