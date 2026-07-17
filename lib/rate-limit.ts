// Fixed-window in-memory rate limiter. Keyed by an arbitrary string (e.g. IP).
// Sufficient for a single-instance deployment; swap for Redis in a multi-node setup.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

type Entry = { count: number; resetAt: number; lockedUntil: number };

const store = new Map<string, Entry>();

// Drop entries past their window to avoid unbounded memory growth.
function sweep(now: number) {
  for (const [key, entry] of store) {
    if (now > entry.resetAt && now > entry.lockedUntil) store.delete(key);
  }
}

export type RateResult = { allowed: boolean; retryAfterSeconds: number };

export function checkRateLimit(key: string, now: number = Date.now()): RateResult {
  sweep(now);
  const entry = store.get(key);
  if (!entry) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS, lockedUntil: 0 });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (now < entry.lockedUntil) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.lockedUntil - now) / 1000) };
  }
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
    return { allowed: false, retryAfterSeconds: Math.ceil(LOCKOUT_MS / 1000) };
  }
  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function resetRateLimit(key: string) {
  store.delete(key);
}
