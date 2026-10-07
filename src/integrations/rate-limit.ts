/**
 * Fixed-window rate limiter. Uses Upstash Redis (REST) when configured so limits hold across
 * serverless instances; otherwise falls back to an in-memory window per instance.
 */
const memory = new Map<string, { count: number; reset: number }>();

export async function rateLimit(key: string, limit: number, windowSec: number): Promise<{ ok: boolean; retryAfter: number }> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      const k = `rl:${key}:${Math.floor(Date.now() / 1000 / windowSec)}`;
      const res = await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify([
          ["INCR", k],
          ["EXPIRE", k, String(windowSec)],
        ]),
        cache: "no-store",
      });
      const data = (await res.json()) as { result: number }[];
      const count = Number(data?.[0]?.result ?? 0);
      return { ok: count <= limit, retryAfter: windowSec };
    } catch {
      /* fall through to memory */
    }
  }
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || entry.reset < now) {
    memory.set(key, { count: 1, reset: now + windowSec * 1000 });
    if (memory.size > 5000) for (const [k, v] of memory) if (v.reset < now) memory.delete(k);
    return { ok: true, retryAfter: 0 };
  }
  entry.count += 1;
  return { ok: entry.count <= limit, retryAfter: Math.ceil((entry.reset - now) / 1000) };
}

export function clientIp(req: Request) {
  const h = req.headers;
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
}
