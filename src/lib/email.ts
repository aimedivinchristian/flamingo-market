import { Resend } from "resend";

let client: Resend | null = null;
function getClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

/** Sender address. Must be on a domain verified in Resend (or onboarding@resend.dev for testing). */
export const EMAIL_FROM = process.env.EMAIL_FROM || "Flamingo Market <onboarding@resend.dev>";

export async function sendEmail(opts: { to: string | string[]; subject: string; html: string; replyTo?: string }) {
  const resend = getClient();
  if (!resend) {
    console.error("[EMAIL] RESEND_API_KEY is not set — email not sent:", opts.subject);
    throw new Error("EMAIL_NOT_CONFIGURED");
  }
  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
  });
  if (error) {
    console.error("[EMAIL] Resend error:", error);
    throw new Error(error.message || "EMAIL_SEND_FAILED");
  }
  return data;
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
