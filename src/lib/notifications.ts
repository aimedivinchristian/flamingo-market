import { sendEmail, escapeHtml } from "./email";


interface OrderForNotification {
  id:      string;
  total:   number;
  address: string;
  phone:   string;
  status:  string;
  buyer:   { name: string; email: string };
  items:   { quantity: number; price: number; product: { name: string } }[];
}

/* ─── Email to admin ─── */
export async function sendOrderNotification(order: OrderForNotification) {
  if (!process.env.RESEND_API_KEY || !process.env.ADMIN_EMAIL) return;

  const itemsList = order.items
    .map(i => `<li><b>${escapeHtml(i.product.name)}</b> × ${i.quantity} = RWF ${(i.price * i.quantity).toLocaleString()}</li>`)
    .join("");

  try {
    await sendEmail({
      to:      process.env.ADMIN_EMAIL,
      subject: `🛒 New Order #${order.id.slice(-6).toUpperCase()} — RWF ${order.total.toLocaleString()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8" /></head>
        <body style="font-family:sans-serif;background:#f9f9f9;margin:0;padding:0;">
          <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <div style="background:linear-gradient(135deg,#e8267a,#f04d96);padding:32px 36px;">
              <h1 style="color:white;margin:0;font-size:22px;">New Order Received!</h1>
              <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">
                Order #${order.id.slice(-6).toUpperCase()} · ${new Date().toLocaleString()}
              </p>
            </div>
            <div style="padding:32px 36px;">
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                <tr>
                  <td style="padding:8px 0;color:#888;font-size:13px;width:120px;">Buyer</td>
                  <td style="padding:8px 0;font-weight:600;font-size:13px;">${escapeHtml(order.buyer.name)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#888;font-size:13px;">Email</td>
                  <td style="padding:8px 0;font-size:13px;">${order.buyer.email}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#888;font-size:13px;">Phone</td>
                  <td style="padding:8px 0;font-size:13px;">${order.phone}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#888;font-size:13px;">Address</td>
                  <td style="padding:8px 0;font-size:13px;">${order.address}</td>
                </tr>
              </table>

              <div style="background:#fff0f7;border-radius:12px;padding:20px;margin-bottom:24px;">
                <h3 style="margin:0 0 12px;font-size:14px;color:#e8267a;">Order Items</h3>
                <ul style="margin:0;padding:0 0 0 16px;font-size:13px;color:#444;line-height:2;">
                  ${itemsList}
                </ul>
              </div>

              <div style="border-top:2px solid #f0f0f0;padding-top:16px;display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:15px;color:#888;">Total Amount</span>
                <span style="font-size:20px;font-weight:800;color:#e8267a;">RWF ${order.total.toLocaleString()}</span>
              </div>

              <div style="margin-top:24px;text-align:center;">
                <a href="${process.env.NEXTAUTH_URL}/admin" style="background:linear-gradient(135deg,#e8267a,#f04d96);color:white;text-decoration:none;padding:12px 28px;border-radius:99px;font-weight:700;font-size:14px;display:inline-block;">
                  View in Admin Dashboard →
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log("[NOTIFY] Admin email sent for order:", order.id);
  } catch (err) {
    console.error("[NOTIFY] Email failed:", err);
  }
}

/* ─── Email to buyer (order confirmation) ─── */
export async function sendBuyerConfirmation(order: OrderForNotification) {
  if (!process.env.RESEND_API_KEY) return;

  const itemsList = order.items
    .map(i => `<li>${escapeHtml(i.product.name)} × ${i.quantity} = RWF ${(i.price * i.quantity).toLocaleString()}</li>`)
    .join("");

  try {
    await sendEmail({
      to:      order.buyer.email,
      subject: `Order Confirmed #${order.id.slice(-6).toUpperCase()} — Thank you, ${order.buyer.name}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family:sans-serif;background:#f9f9f9;margin:0;padding:0;">
          <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <div style="background:linear-gradient(135deg,#e8267a,#f04d96);padding:32px 36px;text-align:center;">
              <div style="font-size:36px;margin-bottom:8px;">✓</div>
              <h1 style="color:white;margin:0;font-size:22px;">Order Confirmed!</h1>
              <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">
                Thank you, ${escapeHtml(order.buyer.name)}. Your order is being processed.
              </p>
            </div>
            <div style="padding:32px 36px;">
              <p style="font-size:14px;color:#666;margin-bottom:20px;">
                Your order <b>#${order.id.slice(-6).toUpperCase()}</b> has been confirmed.
                We will notify you when it ships.
              </p>

              <div style="background:#f9f9f9;border-radius:12px;padding:20px;margin-bottom:20px;">
                <h3 style="margin:0 0 12px;font-size:14px;color:#333;">Items Ordered</h3>
                <ul style="margin:0;padding:0 0 0 16px;font-size:13px;color:#555;line-height:2;">
                  ${itemsList}
                </ul>
              </div>

              <div style="display:flex;justify-content:space-between;border-top:2px solid #f0f0f0;padding-top:16px;">
                <span style="color:#888;font-size:14px;">Total Paid</span>
                <span style="font-weight:800;font-size:18px;color:#e8267a;">RWF ${order.total.toLocaleString()}</span>
              </div>

              <div style="margin-top:24px;text-align:center;">
                <a href="${process.env.NEXTAUTH_URL}/buyer" style="background:linear-gradient(135deg,#e8267a,#f04d96);color:white;text-decoration:none;padding:12px 28px;border-radius:99px;font-weight:700;font-size:14px;display:inline-block;">
                  Track Your Order →
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (err) {
    console.error("[NOTIFY] Buyer email failed:", err);
  }
}

/* ─── Telegram notification (optional) ─── */
export async function sendTelegramNotification(order: OrderForNotification) {
  const token  = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = [
    `🛒 *New Order #${order.id.slice(-6).toUpperCase()}*`,
    `👤 Buyer: ${order.buyer.name}`,
    `📱 Phone: ${order.phone}`,
    `📍 Address: ${order.address}`,
    ``,
    order.items.map(i => `• ${i.product.name} ×${i.quantity}`).join("\n"),
    ``,
    `💰 *Total: RWF ${order.total.toLocaleString()}*`,
  ].join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id:    chatId,
        text,
        parse_mode: "Markdown",
      }),
    });
  } catch (err) {
    console.error("[TELEGRAM]", err);
  }
}

/* ─── Order status update email to buyer ─── */
const STATUS_COPY: Record<string, { title: string; body: string }> = {
  CONFIRMED: { title: "Order confirmed", body: "The seller has confirmed your order and is preparing it." },
  SHIPPED:   { title: "Order shipped",   body: "Your order is on its way." },
  DELIVERED: { title: "Order delivered", body: "Your order has been delivered. Enjoy! You can now leave a review." },
  CANCELLED: { title: "Order cancelled", body: "Your order has been cancelled." },
  PENDING:   { title: "Order pending",   body: "Your order is awaiting confirmation." },
};

export async function sendOrderStatusEmail(order: { id: string; buyer: { name: string; email: string } }, status: string, note?: string | null) {
  if (!process.env.RESEND_API_KEY) return;
  const c = STATUS_COPY[status] || { title: `Order ${status.toLowerCase()}`, body: "Your order status has changed." };
  try {
    await sendEmail({
      to: order.buyer.email,
      subject: `${c.title} — #${order.id.slice(-6).toUpperCase()}`,
      html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:28px;background:#fff;border-radius:16px;">
        <h2 style="color:#e8267a;margin:0 0 8px;">${c.title}</h2>
        <p style="font-size:14px;color:#555;">Hi ${escapeHtml(order.buyer.name)}, ${c.body}</p>
        ${note ? `<p style="background:#fff0f7;border-radius:10px;padding:12px;font-size:13px;color:#444;">Note from seller: ${escapeHtml(note)}</p>` : ""}
        <p style="margin-top:20px;"><a href="${process.env.NEXTAUTH_URL}/order/${order.id}" style="background:#e8267a;color:#fff;text-decoration:none;padding:10px 24px;border-radius:99px;font-weight:700;font-size:13px;">Track order →</a></p>
      </div>`,
    });
  } catch (err) { console.error("[NOTIFY] Status email failed:", err); }
}
