import prisma from "./prisma";

/** Best-effort client IP (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  return (xf ? xf.split(",")[0].trim() : req.headers.get("x-real-ip")) || "unknown";
}

/**
 * Database-backed fixed-window rate limiter (works on serverless, no Redis needed).
 * Returns ok=false when `limit` hits were already made in the current window.
 * Fails OPEN if the database is briefly unreachable so a DB blip never locks everyone out.
 */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<{ ok: boolean; retryAfter: number }> {
  try {
    const now = Date.now();
    const row = await prisma.rateLimit.findUnique({ where: { key } });
    if (!row || row.resetAt.getTime() <= now) {
      await prisma.rateLimit.upsert({ where: { key }, update: { count: 1, resetAt: new Date(now + windowSec * 1000) }, create: { key, count: 1, resetAt: new Date(now + windowSec * 1000) } });
      if (Math.random() < 0.02) prisma.rateLimit.deleteMany({ where: { resetAt: { lt: new Date() } } }).catch(() => {});
      return { ok: true, retryAfter: 0 };
    }
    if (row.count >= limit) return { ok: false, retryAfter: Math.ceil((row.resetAt.getTime() - now) / 1000) };
    await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
    return { ok: true, retryAfter: 0 };
  } catch (err) {
    console.error("[RATE_LIMIT]", err);
    return { ok: true, retryAfter: 0 };
  }
}

export function tooMany(retryAfter: number) {
  const mins = Math.max(1, Math.ceil(retryAfter / 60));
  return Response.json({ error: `Too many attempts. Please try again in ${mins} minute${mins > 1 ? "s" : ""}.` }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
}
