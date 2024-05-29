import { Redis } from "ioredis";

if (!process.env.REDIS_URL) {
  throw Error("environment variable 'REDIS_URL' is required");
}

export const redis = new Redis(process.env.REDIS_URL);
