import prisma from "./prisma";

/** Record a sensitive admin action (who did what to whom). Never throws. */
export async function audit(actor: { id: string; email?: string | null }, action: string, target?: string, meta?: unknown) {
  try {
    await prisma.auditLog.create({ data: { actorId: actor.id, actorEmail: actor.email ?? null, action, target: target ?? null, meta: meta === undefined ? null : JSON.stringify(meta).slice(0, 2000) } });
  } catch (err) { console.error("[AUDIT]", err); }
}
