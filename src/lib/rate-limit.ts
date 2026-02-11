const hits = new Map<string, { count: number; windowStart: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = hits.get(key) ?? { count: 0, windowStart: now };
  if (now - current.windowStart > windowMs) {
    current.count = 0;
    current.windowStart = now;
  }
  current.count += 1;
  hits.set(key, current);

  if (current.count > limit) {
    return { allowed: false, resetAt: current.windowStart + windowMs };
  }
  return { allowed: true, resetAt: current.windowStart + windowMs };
}
