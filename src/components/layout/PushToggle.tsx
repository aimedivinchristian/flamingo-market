"use client";
import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useT } from "@/lib/i18n";

function b64ToUint8(b64: string) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(Array.from(raw).map(c => c.charCodeAt(0)));
}

/** Enable/disable browser push notifications on this device. */
export function PushToggle() {
  const t = useT();
  const [supported, setSupported] = useState(true);
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !key) { setSupported(false); return; }
    navigator.serviceWorker.ready.then(reg => reg.pushManager.getSubscription()).then(sub => setOn(!!sub)).catch(() => {});
  }, [key]);

  async function enable() {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { toast.error("Notifications are blocked in your browser settings"); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToUint8(key!) });
      const res = await fetch("/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub.toJSON()) });
      if (!res.ok) throw new Error("save failed");
      setOn(true); toast.success("Notifications enabled");
    } catch { toast.error("Could not enable notifications on this device"); } finally { setBusy(false); }
  }
  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription();
      if (sub) { await fetch("/api/push/subscribe", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) }); await sub.unsubscribe(); }
      setOn(false);
    } finally { setBusy(false); }
  }

  if (!supported) return <p className="text-[12.5px] text-gray-400">Push notifications aren&apos;t available here (on iPhone, add the site to your Home Screen first).</p>;
  return (
    <button onClick={on ? disable : enable} disabled={busy} className="inline-flex items-center gap-2 border-[1.5px] border-gray-200 hover:border-pink hover:text-pink text-gray-600 font-bold text-[13px] px-5 py-2.5 rounded-full transition-all disabled:opacity-60">
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : on ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}{on ? t("acct.disablePush") : t("acct.enablePush")}
    </button>
  );
}
