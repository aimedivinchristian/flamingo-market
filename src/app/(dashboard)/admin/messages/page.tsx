"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { Loader2, ChevronRight, Trash2 } from "lucide-react";

interface M { id: string; name: string; email: string; message: string; createdAt: string }

export default function AdminMessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rows, setRows] = useState<M[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { if (status === "loading") return; if (!session || session.user.role !== "ADMIN") router.push("/login"); }, [session, status, router]);
  const load = useCallback(async () => { setLoading(true); try { const r = await fetch("/api/admin/messages"); const d = await r.json(); if (r.ok) setRows(d); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  if (!session || session.user.role !== "ADMIN") return null;
  async function remove(id: string) { if (!confirm("Delete this message?")) return; const r = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" }); if (r.ok) { toast.success("Deleted"); load(); } }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[800px] mx-auto px-4 sm:px-5 py-6">
        <div className="flex items-center gap-1.5 text-[12.5px] text-gray-400 mb-3"><Link href="/admin" className="hover:text-pink">Admin</Link><ChevronRight className="w-3 h-3" /><span className="text-gray-700 font-semibold">Contact messages</span></div>
        <h1 className="text-[1.5rem] font-extrabold text-gray-800 mb-4">Contact messages</h1>
        {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-pink" /></div> : rows.length === 0 ? <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-400 text-sm">No messages yet.</div> : (
          <div className="space-y-3">{rows.map(m => (
            <div key={m.id} className="bg-white border border-gray-100 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3"><div><div className="font-bold text-[14px] text-gray-800">{m.name}</div><a href={`mailto:${m.email}`} className="text-[12.5px] text-pink">{m.email}</a><span className="text-[11.5px] text-gray-300"> · {formatDate(m.createdAt)}</span></div>
                <button onClick={() => remove(m.id)} className="w-8 h-8 shrink-0 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:text-red-400 hover:border-red-300"><Trash2 className="w-3.5 h-3.5" /></button></div>
              <p className="text-[13.5px] text-gray-600 mt-3 whitespace-pre-wrap">{m.message}</p>
            </div>))}</div>
        )}
      </div>
    </div>
  );
}
