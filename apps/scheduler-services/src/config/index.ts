import { z } from 'zod';
import { Config } from '../types';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate environment variables
const envSchema = z.object({
  API_KEY: z.string().min(1),
  WEB_BASE: z.string().url(),
  ENVIRONMENT: z.enum(['development', 'production', 'local']),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  DISCORD_WEBHOOK_URL: z.string().url(),
  DISCORD_THREAD_ID: z.string().optional(),
});

// Parse and validate environment variables
const env = envSchema.parse({
  API_KEY: process.env.API_KEY,
  WEB_BASE: process.env.WEB_BASE,
  ENVIRONMENT: process.env.ENVIRONMENT,
  LOG_LEVEL: process.env.LOG_LEVEL,
  DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
  DISCORD_THREAD_ID: process.env.DISCORD_THREAD_ID,
});

// Export validated config
export const config: Config = {
  apiKey: env.API_KEY,
  webBase: env.WEB_BASE,
  environment: env.ENVIRONMENT,
  discordWebhook: env.DISCORD_WEBHOOK_URL,
  discordThreadId: env.DISCORD_THREAD_ID,
};
