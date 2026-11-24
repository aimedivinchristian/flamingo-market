"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { Loader2, ChevronRight, Trash2 } from "lucide-react";

interface L { id: string; actorEmail: string | null; action: string; target: string | null; meta: string | null; createdAt: string }

export default function AdminAuditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rows, setRows] = useState<L[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { if (status === "loading") return; if (!session || session.user.role !== "ADMIN") router.push("/login"); }, [session, status, router]);
  const load = useCallback(async () => { try { const r = await fetch("/api/admin/audit"); const d = await r.json(); if (r.ok) setRows(d); else toast.error(d.error || "Failed"); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  if (!session || session.user.role !== "ADMIN") return null;
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[900px] mx-auto px-4 sm:px-5 py-6">
        <div className="flex items-center gap-1.5 text-[12.5px] text-gray-400 mb-3"><Link href="/admin" className="hover:text-pink">Admin</Link><ChevronRight className="w-3 h-3" /><span className="text-gray-700 font-semibold">Audit log</span></div>
        <h1 className="text-[1.5rem] font-extrabold text-gray-800 mb-1">Audit log</h1>
        <p className="text-gray-400 text-[13px] mb-4">Who approved, paid, suspended or changed what.</p>
        {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-pink" /></div> : (
          <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-50">{rows.map(l => (
            <div key={l.id} className="px-4 py-3 text-[13px]"><span className="font-bold text-pink">{l.action}</span> <span className="text-gray-700">{l.target}</span><div className="text-[11.5px] text-gray-400">{l.actorEmail} · {formatDate(l.createdAt)}{l.meta ? ` · ${l.meta}` : ""}</div></div>))}
            {rows.length === 0 && <div className="text-center text-gray-400 text-sm py-10">No actions recorded yet.</div>}</div>
        )}
      </div>
    </div>
  );
}
