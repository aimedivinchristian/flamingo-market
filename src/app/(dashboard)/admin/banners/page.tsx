"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import toast from "react-hot-toast";
import { Loader2, ChevronRight, Trash2, ImagePlus } from "lucide-react";

interface B { id: string; title: string; subtitle: string | null; image: string; link: string | null; sortOrder: number; isActive: boolean }
const INPUT = "w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink bg-white";

export default function AdminBannersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rows, setRows] = useState<B[]>([]); const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState(""); const [subtitle, setSubtitle] = useState(""); const [link, setLink] = useState(""); const [sortOrder, setSortOrder] = useState("0");
  const [image, setImage] = useState(""); const [uploading, setUploading] = useState(false); const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (status === "loading") return; if (!session || session.user.role !== "ADMIN") router.push("/login"); }, [session, status, router]);
  const load = useCallback(async () => { setLoading(true); try { const r = await fetch("/api/admin/banners"); const d = await r.json(); if (r.ok) setRows(d); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  if (!session || session.user.role !== "ADMIN") return null;

  async function upload(file: File) {
    setUploading(true);
    try { const fd = new FormData(); fd.append("file", file); const r = await fetch("/api/upload", { method: "POST", body: fd }); const d = await r.json(); if (!r.ok) toast.error(d.error || "Upload failed"); else setImage(d.url); } finally { setUploading(false); }
  }
  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !image) { toast.error("Title and image are required"); return; }
    setSaving(true);
    try {
      const r = await fetch("/api/admin/banners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, subtitle, link: link || null, image, sortOrder }) });
      const d = await r.json(); if (!r.ok) { toast.error(d.error || "Failed"); return; }
      toast.success("Banner added"); setTitle(""); setSubtitle(""); setLink(""); setImage(""); setSortOrder("0"); load();
    } finally { setSaving(false); }
  }
  async function toggle(b: B) { await fetch(`/api/admin/banners/${b.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !b.isActive }) }); load(); }
  async function remove(b: B) { if (!confirm(`Delete banner "${b.title}"?`)) return; await fetch(`/api/admin/banners/${b.id}`, { method: "DELETE" }); load(); }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[800px] mx-auto px-4 sm:px-5 py-6">
        <div className="flex items-center gap-1.5 text-[12.5px] text-gray-400 mb-3"><Link href="/admin" className="hover:text-pink">Admin</Link><ChevronRight className="w-3 h-3" /><span className="text-gray-700 font-semibold">Banners</span></div>
        <h1 className="text-[1.5rem] font-extrabold text-gray-800 mb-1">Homepage banners</h1>
        <p className="text-gray-400 text-[13px] mb-5">Shown as a swipeable carousel at the top of the homepage. Best image size: 1600×600 (wide).</p>
        <form onSubmit={add} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3 mb-6">
          <input className={INPUT} placeholder="Title *" value={title} onChange={e => setTitle(e.target.value)} maxLength={120} />
          <input className={INPUT} placeholder="Subtitle (optional)" value={subtitle} onChange={e => setSubtitle(e.target.value)} maxLength={200} />
          <div className="grid grid-cols-3 gap-3"><input className={`${INPUT} col-span-2`} placeholder="Link (e.g. /marketplace?category=fashion)" value={link} onChange={e => setLink(e.target.value)} /><input className={INPUT} type="number" placeholder="Order" value={sortOrder} onChange={e => setSortOrder(e.target.value)} /></div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
          <button type="button" onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-gray-200 hover:border-pink rounded-xl py-6 text-gray-400 text-[13px] flex flex-col items-center gap-1">
            {uploading ? <Loader2 className="w-5 h-5 animate-spin text-pink" /> : image ? <img src={image} alt="" className="max-h-32 rounded-lg" /> : <><ImagePlus className="w-5 h-5" />Upload banner image</>}
          </button>
          <button disabled={saving || uploading} className="w-full bg-gradient-pink text-white font-bold text-[14px] py-3 rounded-full shadow-pink disabled:opacity-60">{saving ? "Saving…" : "Add banner"}</button>
        </form>
        {loading ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-pink" /></div> : (
          <div className="space-y-3">{rows.map(b => (
            <div key={b.id} className="bg-white border border-gray-100 rounded-2xl p-3 flex items-center gap-3">
              <img src={b.image} alt="" className="w-24 h-14 object-cover rounded-lg shrink-0" />
              <div className="min-w-0 flex-1"><div className="font-bold text-[13.5px] text-gray-800 truncate">{b.title}</div><div className="text-[11.5px] text-gray-400 truncate">Order {b.sortOrder}{b.link ? ` · ${b.link}` : ""}</div></div>
              <button onClick={() => toggle(b)} className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${b.isActive ? "text-green-600 bg-green-50" : "text-gray-400 bg-gray-100"}`}>{b.isActive ? "Live" : "Hidden"}</button>
              <button onClick={() => remove(b)} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:text-red-400 hover:border-red-300"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>))}
            {rows.length === 0 && <div className="text-center text-gray-400 text-sm py-8">No banners yet.</div>}</div>
        )}
      </div>
    </div>
  );
}
