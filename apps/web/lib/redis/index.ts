import { Redis } from "ioredis";

const REDIS_USER = "default";
const REDIS_PASSWORD = process.env.UPSTASH_REDIS_REST_TOKEN;
const { hostname: REDIS_ENDPOINT } = new URL(
  process.env.UPSTASH_REDIS_REST_URL as string,
);
const REDIS_PORT = 6379;

export const redis = new Redis(
  `rediss://${REDIS_USER}:${REDIS_PASSWORD}@${REDIS_ENDPOINT}:${REDIS_PORT}`,
);
