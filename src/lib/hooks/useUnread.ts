"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

/** Total unread chat messages for the signed-in user (polls every 30 s while the tab is visible). */
export function useUnread() {
  const { data: session } = useSession();
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    if (!session) { setUnread(0); return; }
    let alive = true;
    async function load() {
      if (document.hidden) return;
      try { const r = await fetch("/api/chat/unread"); const d = await r.json(); if (alive) setUnread(d.unread || 0); } catch { /* offline */ }
    }
    load();
    const t = setInterval(load, 30_000);
    const onVis = () => { if (!document.hidden) load(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { alive = false; clearInterval(t); document.removeEventListener("visibilitychange", onVis); };
  }, [session]);
  return unread;
}
