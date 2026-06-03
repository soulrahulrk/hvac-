import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return redis;
}

// ── Rate Limiting ──────────────────────────────────────────────

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Token-bucket rate limiter using Upstash Redis.
 * Falls back to allow-all if Redis is not configured.
 */
export async function rateLimit(
  key: string,
  maxRequests: number = 60,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const client = getRedis();
  if (!client) {
    return { allowed: true, remaining: maxRequests, resetAt: 0 };
  }

  const now = Math.floor(Date.now() / 1000);
  const windowKey = `rl:${key}:${Math.floor(now / windowSeconds)}`;

  const count = await client.incr(windowKey);

  if (count === 1) {
    await client.expire(windowKey, windowSeconds);
  }

  const allowed = count <= maxRequests;
  const remaining = Math.max(0, maxRequests - count);
  const resetAt = (Math.floor(now / windowSeconds) + 1) * windowSeconds;

  return { allowed, remaining, resetAt };
}

// ── Caching ────────────────────────────────────────────────────

export async function getCached<T>(key: string): Promise<T | null> {
  const client = getRedis();
  if (!client) return null;

  const value = await client.get(key);
  if (!value) return null;

  return value as T;
}

export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds: number = 300
): Promise<void> {
  const client = getRedis();
  if (!client) return;

  await client.set(key, value, { ex: ttlSeconds });
}

export async function invalidateCache(key: string): Promise<void> {
  const client = getRedis();
  if (!client) return;

  await client.del(key);
}
