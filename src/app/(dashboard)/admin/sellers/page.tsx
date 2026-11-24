"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { Loader2, ChevronRight } from "lucide-react";

interface A { id: string; name: string; email: string; phone: string | null; sellerStatus: "PENDING" | "REJECTED"; sellerApplication: string | null; sellerNote: string | null; createdAt: string }

export default function AdminSellerApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rows, setRows] = useState<A[]>([]); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => { if (status === "loading") return; if (!session || session.user.role !== "ADMIN") router.push("/login"); }, [session, status, router]);
  const load = useCallback(async () => { setLoading(true); try { const r = await fetch("/api/admin/seller-applications"); const d = await r.json(); if (r.ok) setRows(d); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  if (!session || session.user.role !== "ADMIN") return null;
  async function act(id: string, to: "APPROVED" | "REJECTED") {
    const note = to === "REJECTED" ? (window.prompt("Reason (sent to the applicant):") ?? "") : "";
    if (to === "REJECTED" && !note.trim()) return;
    setBusy(id);
    try { const r = await fetch(`/api/admin/seller-applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: to, note }) }); const d = await r.json(); if (!r.ok) toast.error(d.error || "Failed"); else { toast.success(to === "APPROVED" ? "Seller approved" : "Rejected"); load(); } } finally { setBusy(null); }
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[860px] mx-auto px-4 sm:px-5 py-6">
        <div className="flex items-center gap-1.5 text-[12.5px] text-gray-400 mb-3"><Link href="/admin" className="hover:text-pink">Admin</Link><ChevronRight className="w-3 h-3" /><span className="text-gray-700 font-semibold">Seller applications</span></div>
        <h1 className="text-[1.5rem] font-extrabold text-gray-800 mb-1">Seller applications</h1>
        <p className="text-gray-400 text-[13px] mb-5">Only approved applicants become sellers. Call or message the applicant if you need to verify them first.</p>
        {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-pink" /></div> : rows.length === 0 ? <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400 text-sm">No applications waiting.</div> : (
          <div className="space-y-3">{rows.map(a => (
            <div key={a.id} className="bg-white border border-gray-100 rounded-2xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-[220px]">
                  <div className="font-extrabold text-gray-800">{a.name} <span className={`text-[11px] font-bold ml-1 px-2 py-0.5 rounded-full ${a.sellerStatus === "PENDING" ? "text-amber-600 bg-amber-50" : "text-red-500 bg-red-50"}`}>{a.sellerStatus}</span></div>
                  <div className="text-[12.5px] text-gray-500">{a.email}{a.phone ? ` · ${a.phone}` : ""}</div>
                  <div className="text-[11.5px] text-gray-300">Joined {formatDate(a.createdAt)}</div>
                </div>
                <div className="flex gap-2">
                  <button disabled={busy === a.id} onClick={() => act(a.id, "APPROVED")} className="text-[12.5px] font-bold px-4 py-2 rounded-full bg-gradient-pink text-white disabled:opacity-50">Approve</button>
                  {a.sellerStatus === "PENDING" && <button disabled={busy === a.id} onClick={() => act(a.id, "REJECTED")} className="text-[12.5px] font-bold px-4 py-2 rounded-full border border-gray-200 hover:border-red-300 hover:text-red-500">Reject</button>}
                </div>
              </div>
              <p className="text-[13px] text-gray-600 mt-3 whitespace-pre-wrap bg-gray-50 rounded-xl p-3">{a.sellerApplication || "No details submitted yet."}</p>
              {a.sellerNote && <p className="text-[12px] text-red-400 mt-2">Rejection note: {a.sellerNote}</p>}
            </div>))}</div>
        )}
      </div>
    </div>
  );
}
