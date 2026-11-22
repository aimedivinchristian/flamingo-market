"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Loader2, RefreshCw, Package, ChevronRight, Check, X, AlertTriangle, GripVertical, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
interface Category { id: string; name: string; slug: string; emoji: string; _count: { products: number }; }
const INPUT = "w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all";
function CategoryRow({ cat, others, onSaved, onDeleted }: { cat: Category; others: Category[]; onSaved: (updated: Category) => void; onDeleted: (id: string) => void }) {
  const [editing, setEditing] = useState(false); const [name, setName] = useState(cat.name); const [emoji, setEmoji] = useState(cat.emoji); const [saving, setSaving] = useState(false); const [deleting, setDeleting] = useState(false); const [reassignTo, setReassignTo] = useState(""); const [showReassign, setShowReassign] = useState(false);
  async function save() {
    if (!name.trim()) { toast.error("Name required"); return; }
    setSaving(true);
    try { const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, emoji }) }); const data = await res.json(); if (!res.ok) { toast.error(data.error); return; } toast.success("Category updated"); onSaved(data); setEditing(false); } finally { setSaving(false); }
  }
  async function remove(reassign?: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reassignTo: reassign || null }) });
      const data = await res.json();
      if (!res.ok) { if (data.error === "NEEDS_REASSIGN") { setShowReassign(true); return; } toast.error(data.error); return; }
      toast.success(data.reassigned > 0 ? `Category deleted. ${data.reassigned} products reassigned.` : "Category deleted.");
      onDeleted(cat.id);
    } finally { setDeleting(false); }
  }
  if (showReassign) return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4"><AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" /><div><div className="font-bold text-[14px] text-amber-800 mb-1">This category has {cat._count.products} product{cat._count.products !== 1 ? "s" : ""}</div><p className="text-[12.5px] text-amber-700">Choose a category to move them to before deleting <strong>{cat.name}</strong>.</p></div></div>
      <div className="flex items-center gap-3"><select value={reassignTo} onChange={e => setReassignTo(e.target.value)} className="flex-1 px-4 py-2.5 border-[1.5px] border-amber-300 rounded-xl text-sm outline-none focus:border-amber-500 bg-white cursor-pointer"><option value="">— Select target category —</option>{others.map(o => <option key={o.id} value={o.id}>{o.emoji} {o.name} ({o._count.products})</option>)}</select><button onClick={() => reassignTo && remove(reassignTo)} disabled={!reassignTo || deleting} className="flex items-center gap-2 text-[13px] font-bold text-white bg-red-500 px-5 py-2.5 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50">{deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}Reassign & Delete</button><button onClick={() => setShowReassign(false)} className="text-[13px] font-semibold text-gray-500 border border-gray-200 px-4 py-2.5 rounded-full hover:border-pink hover:text-pink transition-all">Cancel</button></div>
    </div>
  );
  if (editing) return (
    <div className="bg-pink-pale border-[1.5px] border-pink-pale2 rounded-2xl p-4 flex items-center gap-3">
      <input value={emoji} onChange={e => setEmoji(e.target.value)} maxLength={4} className="w-14 text-center text-[20px] px-2 py-2 border-[1.5px] border-gray-200 rounded-xl outline-none focus:border-pink transition-all bg-white" />
      <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }} placeholder="Category name" autoFocus className={cn(INPUT, "flex-1")} />
      <button onClick={save} disabled={saving} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-pink text-white shadow-pink hover:opacity-90 transition-opacity disabled:opacity-60">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}</button>
      <button onClick={() => { setEditing(false); setName(cat.name); setEmoji(cat.emoji); }} className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:border-pink hover:text-pink transition-all"><X className="w-4 h-4" /></button>
    </div>
  );
  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-pink-pale2 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all group">
      <GripVertical className="w-4 h-4 text-gray-200 group-hover:text-gray-400 transition-colors shrink-0 cursor-grab" />
      <div className="w-10 h-10 rounded-xl bg-pink-pale border border-pink-pale2 flex items-center justify-center text-[20px] shrink-0 select-none">{cat.emoji}</div>
      <div className="flex-1 min-w-0"><div className="font-bold text-[14px] text-gray-800">{cat.name}</div><div className="flex items-center gap-3 mt-0.5"><span className="text-[11px] font-mono text-gray-400">/{cat.slug}</span><span className="text-[11px] text-gray-400 font-medium">{cat._count.products} product{cat._count.products !== 1 ? "s" : ""}</span></div></div>
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl"><Package className="w-3.5 h-3.5 text-gray-400" /><span className="text-[12px] font-semibold text-gray-600">{cat._count.products}</span></div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={`/marketplace?category=${cat.slug}`} target="_blank" className="text-[12px] font-semibold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-pink hover:text-pink transition-all">View</Link>
        <button onClick={() => setEditing(true)} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:border-pink hover:text-pink transition-all"><Pencil className="w-3.5 h-3.5" /></button>
        <button onClick={() => remove()} disabled={deleting} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:border-red-300 hover:text-red-400 transition-all disabled:opacity-50">{deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}</button>
      </div>
    </div>
  );
}
export default function AdminCategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]); const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState(""); const [newEmoji, setNewEmoji] = useState(""); const [creating, setCreating] = useState(false); const [showForm, setShowForm] = useState(false);
  useEffect(() => { if (status === "loading") return; if (!session || session.user.role !== "ADMIN") router.push("/login"); }, [session, status, router]);
  const fetchCategories = useCallback(async () => { setLoading(true); try { const res = await fetch("/api/admin/categories"); const data = await res.json(); if (res.ok) setCategories(Array.isArray(data) ? data : []); } finally { setLoading(false); } }, []);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  if (!session || session.user.role !== "ADMIN") return null;
  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) { toast.error("Name is required"); return; }
    if (!newEmoji.trim()) { toast.error("Choose an emoji"); return; }
    setCreating(true);
    try { const res = await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName, emoji: newEmoji }) }); const data = await res.json(); if (!res.ok) { toast.error(data.error); return; } toast.success(`Category "${data.name}" created`); setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name))); setNewName(""); setNewEmoji(""); setShowForm(false); } finally { setCreating(false); }
  }
  const totalProducts = categories.reduce((s, c) => s + c._count.products, 0);
  const EMOJI_OPTS = ["👗","💄","📱","🏠","🛒","👜","🧴","🌍","⚡","🎨","📚","🏋️","🍕","🌿","💎","🔧"];
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[900px] mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <div><div className="flex items-center gap-2 mb-1"><Link href="/admin" className="text-[13px] text-gray-400 hover:text-pink transition-colors font-medium">Admin</Link><ChevronRight className="w-3.5 h-3.5 text-gray-300" /><span className="text-[13px] font-bold text-gray-700">Categories</span></div><h1 className="text-[1.6rem] font-extrabold text-gray-800 tracking-tight">Category Management</h1><p className="text-gray-400 text-sm mt-0.5">{categories.length} categories · {totalProducts} products total</p></div>
          <div className="flex items-center gap-2"><button onClick={fetchCategories} className="flex items-center gap-2 text-[13px] font-semibold text-gray-500 border border-gray-200 px-4 py-2 rounded-full hover:border-pink hover:text-pink transition-all"><RefreshCw className="w-3.5 h-3.5" /></button><button onClick={() => setShowForm(f => !f)} className="flex items-center gap-2 bg-gradient-pink text-white text-[13px] font-bold px-5 py-2.5 rounded-full shadow-pink hover:opacity-90 transition-all"><Plus className="w-4 h-4" />New Category</button></div>
        </div>
        {showForm && (
          <form onSubmit={createCategory} className="bg-white border-[1.5px] border-pink-pale2 rounded-2xl p-5 mb-5 shadow-[0_4px_20px_rgba(232,38,122,0.08)]">
            <div className="font-extrabold text-[15px] text-gray-800 mb-4 flex items-center gap-2"><Tag className="w-4 h-4 text-pink" />Create New Category</div>
            <div className="space-y-4">
              <div><label className="block text-[12.5px] font-bold text-gray-600 mb-2">Icon / Emoji *</label><div className="flex flex-wrap gap-2 mb-2">{EMOJI_OPTS.map(e => <button key={e} type="button" onClick={() => setNewEmoji(e)} className={cn("w-10 h-10 text-[20px] rounded-xl border-[1.5px] transition-all flex items-center justify-center", newEmoji === e ? "border-pink bg-pink-pale shadow-pink" : "border-gray-200 hover:border-gray-300 bg-white")}>{e}</button>)}</div><input value={newEmoji} onChange={e => setNewEmoji(e.target.value)} placeholder="Or type any emoji…" maxLength={4} className={cn(INPUT, "w-40 text-[18px] text-center")} /></div>
              <div className="grid sm:grid-cols-2 gap-4"><div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Category Name *</label><input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Sportswear" maxLength={40} className={INPUT} /></div><div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Auto-generated Slug</label><div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-mono text-gray-500">/{newName.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"") || "…"}</div></div></div>
            </div>
            <div className="flex gap-3 mt-5"><button type="submit" disabled={creating} className="flex items-center gap-2 bg-gradient-pink text-white font-bold text-[13.5px] px-6 py-2.5 rounded-full shadow-pink hover:opacity-90 transition-all disabled:opacity-60">{creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><Plus className="w-4 h-4" /> Create Category</>}</button><button type="button" onClick={() => { setShowForm(false); setNewName(""); setNewEmoji(""); }} className="px-5 py-2.5 border-[1.5px] border-gray-200 text-gray-600 font-semibold text-sm rounded-full hover:border-pink hover:text-pink transition-all">Cancel</button></div>
          </form>
        )}
        {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="w-7 h-7 text-pink animate-spin" /></div> : categories.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center"><Tag className="w-10 h-10 text-gray-200 mx-auto mb-4" strokeWidth={1} /><div className="font-bold text-gray-500 text-[15px] mb-2">No categories yet</div><button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-gradient-pink text-white font-bold text-[13px] px-5 py-2.5 rounded-full shadow-pink hover:opacity-90"><Plus className="w-4 h-4" /> Create First Category</button></div>
        ) : (
          <div className="space-y-2">{categories.map(cat => <CategoryRow key={cat.id} cat={cat} others={categories.filter(c => c.id !== cat.id)} onSaved={updated => setCategories(prev => prev.map(c => c.id === updated.id ? updated : c).sort((a, b) => a.name.localeCompare(b.name)))} onDeleted={id => setCategories(prev => prev.filter(c => c.id !== id))} />)}</div>
        )}
      </div>
    </div>
  );
}
