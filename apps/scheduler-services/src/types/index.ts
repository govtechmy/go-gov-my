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
}
