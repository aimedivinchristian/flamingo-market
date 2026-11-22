"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { formatPrice, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { Loader2, ChevronRight } from "lucide-react";

interface W { id: string; amount: number; method: string; accountNo: string; accountName: string; note: string | null; status: "PENDING" | "APPROVED" | "PAID" | "REJECTED"; createdAt: string; seller: { name: string; email: string; phone: string | null } }
const COLOR: Record<string, string> = { PENDING: "#d97706", APPROVED: "#0db8d4", PAID: "#059669", REJECTED: "#dc2626" };
const ACTIONS: Record<string, { to: string; label: string }[]> = {
  PENDING: [{ to: "APPROVED", label: "Approve" }, { to: "REJECTED", label: "Reject" }],
  APPROVED: [{ to: "PAID", label: "Mark paid" }, { to: "REJECTED", label: "Reject" }],
  PAID: [], REJECTED: [],
};

export default function AdminWithdrawalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rows, setRows] = useState<W[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => { if (status === "loading") return; if (!session || session.user.role !== "ADMIN") router.push("/login"); }, [session, status, router]);
  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch("/api/admin/withdrawals"); const d = await r.json(); if (r.ok) setRows(d); else toast.error(d.error || "Failed to load"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  if (!session || session.user.role !== "ADMIN") return null;

  async function act(id: string, to: string) {
    const note = to === "REJECTED" ? (window.prompt("Reason for rejection (sent to the seller):") ?? "") : "";
    if (to === "REJECTED" && !note.trim()) return;
    setBusy(id);
    try {
      const r = await fetch(`/api/admin/withdrawals/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: to, note }) });
      const d = await r.json();
      if (!r.ok) { toast.error(d.error || "Failed"); return; }
      toast.success(`Marked ${to.toLowerCase()}`); load();
    } finally { setBusy(null); }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[1000px] mx-auto px-5 py-8">
        <div className="flex items-center gap-1.5 text-[12.5px] text-gray-400 mb-3"><Link href="/admin" className="hover:text-pink">Admin</Link><ChevronRight className="w-3 h-3" /><span className="text-gray-700 font-semibold">Withdrawals</span></div>
        <h1 className="text-[1.6rem] font-extrabold text-gray-800 mb-1">Seller Withdrawals</h1>
        <p className="text-gray-400 text-sm mb-6">Approve, send the money manually via MoMo/bank, then mark as paid.</p>
        {loading ? <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-pink" /></div> : rows.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400 text-sm">No withdrawal requests yet.</div>
        ) : (
          <div className="space-y-3">
            {rows.map(w => (
              <div key={w.id} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-wrap items-center gap-4 justify-between">
                <div className="min-w-[220px]">
                  <div className="font-extrabold text-gray-800">{formatPrice(w.amount)} <span className="text-[11px] font-bold ml-2 px-2 py-0.5 rounded-full" style={{ color: COLOR[w.status], background: COLOR[w.status] + "18" }}>{w.status}</span></div>
                  <div className="text-[12.5px] text-gray-500 mt-1">{w.seller.name} · {w.seller.email}</div>
                  <div className="text-[12.5px] text-gray-500">{w.method.toUpperCase()} · {w.accountNo} · {w.accountName}</div>
                  <div className="text-[11.5px] text-gray-300 mt-0.5">{formatDate(w.createdAt)}{w.note ? ` · ${w.note}` : ""}</div>
                </div>
                <div className="flex gap-2">
                  {ACTIONS[w.status].map(a => (
                    <button key={a.to} disabled={busy === w.id} onClick={() => act(w.id, a.to)} className="text-[12.5px] font-bold px-4 py-2 rounded-full border border-gray-200 hover:border-pink hover:text-pink disabled:opacity-50">{a.label}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
