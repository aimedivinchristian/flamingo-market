"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { Loader2, ChevronRight, Trash2 } from "lucide-react";

interface U { id: string; name: string; email: string; role: string; suspended: boolean; emailVerified: string | null; createdAt: string }

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rows, setRows] = useState<U[]>([]); const [q, setQ] = useState(""); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => { if (status === "loading") return; if (!session || session.user.role !== "ADMIN") router.push("/login"); }, [session, status, router]);
  const load = useCallback(async (term: string) => { setLoading(true); try { const r = await fetch(`/api/admin/users?q=${encodeURIComponent(term)}`); const d = await r.json(); if (r.ok) setRows(d); } finally { setLoading(false); } }, []);
  useEffect(() => { const t = setTimeout(() => load(q), 300); return () => clearTimeout(t); }, [q, load]);
  if (!session || session.user.role !== "ADMIN") return null;
  async function toggle(u: U) {
    if (!confirm(`${u.suspended ? "Restore" : "Suspend"} ${u.name}?${!u.suspended && u.role === "SELLER" ? " Their products will be hidden." : ""}`)) return;
    setBusy(u.id);
    try { const r = await fetch(`/api/admin/users/${u.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ suspended: !u.suspended }) }); const d = await r.json(); if (!r.ok) toast.error(d.error || "Failed"); else { toast.success(u.suspended ? "Restored" : "Suspended"); load(q); } } finally { setBusy(null); }
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[900px] mx-auto px-4 sm:px-5 py-6">
        <div className="flex items-center gap-1.5 text-[12.5px] text-gray-400 mb-3"><Link href="/admin" className="hover:text-pink">Admin</Link><ChevronRight className="w-3 h-3" /><span className="text-gray-700 font-semibold">Users</span></div>
        <h1 className="text-[1.5rem] font-extrabold text-gray-800 mb-4">Users</h1>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or email…" className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-full text-sm outline-none focus:border-pink bg-white mb-4" />
        {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-pink" /></div> : (
          <div className="space-y-2">{rows.map(u => (
            <div key={u.id} className="bg-white border border-gray-100 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0"><div className="font-bold text-[14px] text-gray-800 truncate">{u.name} <span className="text-[10.5px] font-bold text-pink bg-pink-pale px-2 py-0.5 rounded-full ml-1">{u.role}</span>{u.suspended && <span className="text-[10.5px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full ml-1">SUSPENDED</span>}{!u.emailVerified && <span className="text-[10.5px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-1">UNVERIFIED</span>}</div><div className="text-[12px] text-gray-400 truncate">{u.email} · joined {formatDate(u.createdAt)}</div></div>
              {u.role !== "ADMIN" && u.id !== session.user.id && <button disabled={busy === u.id} onClick={() => toggle(u)} className={`text-[12px] font-bold px-4 py-2 rounded-full border shrink-0 ${u.suspended ? "border-green-200 text-green-600" : "border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500"}`}>{u.suspended ? "Restore" : "Suspend"}</button>}
            </div>))}
            {rows.length === 0 && <div className="text-center text-gray-400 text-sm py-10">No users found.</div>}</div>
        )}
      </div>
    </div>
  );
}
