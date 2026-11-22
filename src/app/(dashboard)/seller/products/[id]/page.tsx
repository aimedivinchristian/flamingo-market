"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import toast from "react-hot-toast";
import { Loader2, ChevronRight } from "lucide-react";

const INPUT = "w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all";

export default function EditProductPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({ name: "", description: "", price: "", oldPrice: "", stock: "", isActive: true });

  useEffect(() => { if (status === "loading") return; if (!session || !["SELLER", "ADMIN"].includes(session.user.role)) router.push("/login"); }, [session, status, router]);
  useEffect(() => {
    fetch(`/api/products/${params.id}`).then(r => r.json()).then(p => {
      if (p.error) { toast.error(p.error); router.push("/seller"); return; }
      setF({ name: p.name, description: p.description, price: String(p.price), oldPrice: p.oldPrice ? String(p.oldPrice) : "", stock: String(p.stock), isActive: p.isActive });
    }).finally(() => setLoading(false));
  }, [params.id, router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim() || !f.description.trim() || !f.price) { toast.error("Name, description and price are required"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${params.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: f.name, description: f.description, price: f.price, oldPrice: f.oldPrice || null, stock: f.stock === "" ? undefined : f.stock, isActive: f.isActive }) });
      const d = await res.json();
      if (!res.ok) { toast.error(d.error || "Could not save"); return; }
      toast.success("Product updated"); router.push("/seller");
    } finally { setSaving(false); }
  }

  if (!session) return null;
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[640px] mx-auto px-5 py-8">
        <div className="flex items-center gap-1.5 text-[12.5px] text-gray-400 mb-3"><Link href="/seller" className="hover:text-pink">Seller</Link><ChevronRight className="w-3 h-3" /><span className="text-gray-700 font-semibold">Edit product</span></div>
        <h1 className="text-[1.5rem] font-extrabold text-gray-800 mb-5">Edit Product</h1>
        {loading ? <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-pink" /></div> : (
          <form onSubmit={save} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
            <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Name</label><input className={INPUT} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
            <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Description</label><textarea rows={5} className={INPUT} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Price (RWF)</label><input type="number" min="1" className={INPUT} value={f.price} onChange={e => setF({ ...f, price: e.target.value })} /></div>
              <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Old price</label><input type="number" min="0" className={INPUT} value={f.oldPrice} onChange={e => setF({ ...f, oldPrice: e.target.value })} /></div>
              <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Stock</label><input type="number" min="0" className={INPUT} value={f.stock} onChange={e => setF({ ...f, stock: e.target.value })} /></div>
            </div>
            <label className="flex items-center gap-2 text-[13px] font-semibold text-gray-600"><input type="checkbox" checked={f.isActive} onChange={e => setF({ ...f, isActive: e.target.checked })} /> Visible in the marketplace</label>
            <button type="submit" disabled={saving} className="w-full bg-gradient-pink text-white font-bold text-[14px] py-3 rounded-full shadow-pink hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2">{saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : "Save changes"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
