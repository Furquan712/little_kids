type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

declare global {
  var __rateLimitBuckets: Map<string, Bucket> | undefined;
}

const store = global.__rateLimitBuckets ?? buckets;
global.__rateLimitBuckets = store;

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterMs: number };

/**
 * In-memory fixed-window limiter, sufficient for a single-process local dev
 * deployment. Swap for a shared store (Redis) before running multi-instance.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true };
}
