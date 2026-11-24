"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { formatPrice, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { Loader2, ChevronRight } from "lucide-react";

interface B { id: string; days: number; amount: number; status: string; note: string | null; createdAt: string; product: { name: string }; seller: { name: string; email: string; phone: string | null } }
const COLOR: Record<string, string> = { PENDING: "#d97706", APPROVED: "#059669", REJECTED: "#dc2626" };

export default function AdminBoostsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rows, setRows] = useState<B[]>([]); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => { if (status === "loading") return; if (!session || session.user.role !== "ADMIN") router.push("/login"); }, [session, status, router]);
  const load = useCallback(async () => { setLoading(true); try { const r = await fetch("/api/admin/boosts"); const d = await r.json(); if (r.ok) setRows(d); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  if (!session || session.user.role !== "ADMIN") return null;
  async function act(id: string, to: "APPROVED" | "REJECTED") {
    const note = to === "REJECTED" ? (window.prompt("Reason (sent to the seller):") ?? "") : "";
    if (to === "REJECTED" && !note.trim()) return;
    if (to === "APPROVED" && !window.confirm("Approve only after you received the payment. Continue?")) return;
    setBusy(id);
    try { const r = await fetch(`/api/admin/boosts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: to, note }) }); const d = await r.json(); if (!r.ok) toast.error(d.error || "Failed"); else { toast.success(to === "APPROVED" ? "Boost activated" : "Rejected"); load(); } } finally { setBusy(null); }
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[900px] mx-auto px-4 sm:px-5 py-6">
        <div className="flex items-center gap-1.5 text-[12.5px] text-gray-400 mb-3"><Link href="/admin" className="hover:text-pink">Admin</Link><ChevronRight className="w-3 h-3" /><span className="text-gray-700 font-semibold">Boost requests</span></div>
        <h1 className="text-[1.5rem] font-extrabold text-gray-800 mb-1">Boost requests</h1>
        <p className="text-gray-400 text-[13px] mb-5">Confirm the seller&apos;s MoMo payment (match the reference), then approve.</p>
        {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-pink" /></div> : rows.length === 0 ? <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400 text-sm">No requests yet.</div> : (
          <div className="space-y-3">{rows.map(b => (
            <div key={b.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-[220px]">
                <div className="font-extrabold text-gray-800">{b.product.name} <span className="text-[11px] font-bold ml-1 px-2 py-0.5 rounded-full" style={{ color: COLOR[b.status], background: COLOR[b.status] + "18" }}>{b.status}</span></div>
                <div className="text-[12.5px] text-gray-500">{b.days} days · {formatPrice(b.amount)} · ref <b>{b.id.slice(-6).toUpperCase()}</b></div>
                <div className="text-[12px] text-gray-400">{b.seller.name} · {b.seller.email}{b.seller.phone ? ` · ${b.seller.phone}` : ""} · {formatDate(b.createdAt)}</div>
              </div>
              {b.status === "PENDING" && <div className="flex gap-2"><button disabled={busy === b.id} onClick={() => act(b.id, "APPROVED")} className="text-[12.5px] font-bold px-4 py-2 rounded-full bg-gradient-pink text-white disabled:opacity-50">Approve</button><button disabled={busy === b.id} onClick={() => act(b.id, "REJECTED")} className="text-[12.5px] font-bold px-4 py-2 rounded-full border border-gray-200 hover:border-red-300 hover:text-red-500">Reject</button></div>}
            </div>))}</div>
        )}
      </div>
    </div>
  );
}
