"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MessageCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function ChatButton({ sellerId, productId, className }: { sellerId: string; productId?: string; className?: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (session?.user.id === sellerId) return null;
  async function start() {
    if (!session) { router.push("/login"); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/chat/conversations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sellerId, productId }) });
      const d = await r.json();
      if (!r.ok) { toast.error(d.error || "Could not start chat"); return; }
      router.push(`/messages?c=${d.id}`);
    } finally { setBusy(false); }
  }
  return (
    <button onClick={start} disabled={busy} className={className || "inline-flex items-center gap-2 border-[1.5px] border-gray-200 hover:border-pink hover:text-pink text-gray-600 font-bold text-[13px] px-5 py-2.5 rounded-full transition-all disabled:opacity-60"}>
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />} Chat with seller
    </button>
  );
}
