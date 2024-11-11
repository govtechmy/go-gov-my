import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import { redis } from '.';

type Duration = `${number} ms` | `${number} s` | `${number} m` | `${number} h` | `${number} d`;

type RateLimitResult = {
  /** Whether the request may pass(true) or exceeded the limit(false) */
  success: boolean;
  /** Maximum number of requests allowed within a window. */
  limit: number;
  /** Unix timestamp in miliseconds when the limits are reset. */
  reset: number;
  /** How many requests the user has left within the current window. */
  remaining: number;
};

// Create a new ratelimiter, that allows 10 requests per 10 seconds by default
export const ratelimit = async (
  key: string,
  requests: number = 10,
  duration: Duration = '10 s'
): Promise<RateLimitResult> => {
  const ratelimiter = new RateLimiterRedis({
    storeClient: redis,
    points: requests,
    duration: durationToSeconds(duration),
    keyPrefix: process.env.NEXT_PUBLIC_APP_NAME?.concat('-'),
  });

  try {
    const res = await ratelimiter.consume(key);
    return toRateLimitResult(ratelimiter, res);
  } catch (caught) {
    if (caught instanceof RateLimiterRes) {
      return toRateLimitResult(ratelimiter, caught);
    }
    throw caught;
  }
};

function durationToSeconds(duration: Duration): number {
  const [numStr, unit] = duration.split(' ');
  const num = Number.parseInt(numStr);

  if (!unit) {
    throw Error(`failed to parse duration, duration is missing a unit`);
  }

  switch (unit) {
    case 'ms':
      return num / 1000;
    case 's':
      return num;
    case 'm':
      return num * 60;
    case 'h':
      return num * 60 * 60;
    case 'd':
      return num * 60 * 60 * 24;
    default:
      throw Error(`failed to parse duration, invalid unit "${unit}"`);
  }
}

function toRateLimitResult(
  { points }: RateLimiterRedis,
  { consumedPoints, msBeforeNext, remainingPoints }: RateLimiterRes
): RateLimitResult {
  return {
    success: consumedPoints <= points,
    limit: points,
    reset: Date.now() + msBeforeNext,
    remaining: remainingPoints,
  };
}
