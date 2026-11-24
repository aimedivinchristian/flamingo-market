import webpush from "web-push";
import prisma from "./prisma";

let ready = false;
function configure(): boolean {
  if (ready) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || `mailto:${process.env.ADMIN_EMAIL || "admin@example.com"}`, pub, priv);
  ready = true;
  return true;
}

export interface PushPayload { title: string; body: string; url?: string }

/** Send a browser push notification to every device the given users enabled. Never throws. */
export async function pushToUsers(userIds: string[], payload: PushPayload) {
  try {
    if (!userIds.length || !configure()) return;
    const subs = await prisma.pushSubscription.findMany({ where: { userId: { in: userIds } } });
    await Promise.allSettled(subs.map(async s => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: 3600 });
      } catch (e: any) {
        if (e?.statusCode === 404 || e?.statusCode === 410) await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {}); // device unsubscribed
        else console.error("[PUSH]", e?.statusCode, e?.body || e?.message);
      }
    }));
  } catch (err) { console.error("[PUSH]", err); }
}

export async function pushToAdmins(payload: PushPayload) {
  try {
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    await pushToUsers(admins.map(a => a.id), payload);
  } catch (err) { console.error("[PUSH_ADMINS]", err); }
}
