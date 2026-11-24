"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { formatPrice } from "@/lib/utils";
import { useSellerProducts } from "@/lib/hooks/useProducts";
import { useCategories } from "@/lib/hooks/useCategories";
import { Plus, X, TrendingUp, Package, ShoppingBag, AlertTriangle, Image as ImgIcon, CheckCircle, Loader2, Pencil, Trash2, Store } from "lucide-react";
import toast from "react-hot-toast";

const TABS = ["Overview", "Products", "Orders", "Earnings", "Analytics", "Boost", "Add Product"] as const;
type Tab = typeof TABS[number];

function Stat({ icon: Icon, label, value, bg, color }: { icon: any; label: string; value: string | number; bg: string; color: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}><Icon className="w-5 h-5" style={{ color }} /></div>
      <div className="text-[1.4rem] font-extrabold text-gray-800 mb-0.5 tracking-tight">{value}</div>
      <div className="text-[11.5px] text-gray-400 font-medium">{label}</div>
    </div>
  );
}

function ImageSlot({ index, url, onUpload, onRemove, uploading }: { index: number; url?: string; onUpload: (i: number, file: File) => void; onRemove: (i: number) => void; uploading: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div onClick={() => !url && inputRef.current?.click()} className={`relative aspect-square rounded-xl border-2 overflow-hidden transition-all ${url ? "border-pink-pale2" : "border-dashed border-gray-200 hover:border-pink hover:bg-pink-pale cursor-pointer"}`}>
      {url ? (
        <>
          <img src={url} alt="" className="w-full h-full object-cover" />
          <button type="button" onClick={e => { e.stopPropagation(); onRemove(index); }} className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600 transition-colors"><X className="w-3 h-3" /></button>
          {index === 0 && <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold bg-pink text-white px-1.5 py-0.5 rounded-full">MAIN</span>}
        </>
      ) : uploading ? <div className="w-full h-full flex items-center justify-center"><Loader2 className="w-6 h-6 text-pink animate-spin" /></div> : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1"><ImgIcon className="w-6 h-6 text-gray-300" /><span className="text-[10px] text-gray-400 font-medium">{index === 0 ? "Main photo" : `Photo ${index + 1}`}</span></div>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(index, f); e.target.value = ""; }} />
    </div>
  );
}

export default function SellerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Overview");
  const [storeId, setStoreId] = useState<string | null>(null);
  const { products, loading: prodLoading, refetch } = useSellerProducts(session?.user?.id);
  const { categories } = useCategories();
  const [saving, setSaving] = useState(false);
  const [imageUrls, setImageUrls] = useState<(string | undefined)[]>([undefined, undefined, undefined, undefined]);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", oldPrice: "", stock: "", categoryId: "" });

  useEffect(() => { if (status === "loading") return; if (!session || !["SELLER","ADMIN"].includes(session.user.role)) router.push("/login"); }, [session, status, router]);
  useEffect(() => { if (categories.length && !form.categoryId) setForm(f => ({ ...f, categoryId: categories[0].id })); }, [categories]);
  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/stores").then(r => r.json()).then((stores: any[]) => { const mine = stores.find((s: any) => s.sellerId === session!.user.id); if (mine) setStoreId(mine.id); }).catch(() => {});
  }, [session?.user?.id]);

  if (!session) return null;

  async function uploadImage(index: number, file: File) {
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploadingIdx(index);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Upload failed. Check Cloudinary env vars."); return; }
      setImageUrls(prev => { const next = [...prev]; next[index] = data.url; return next; });
      toast.success("Image uploaded!");
    } catch { toast.error("Upload failed. Check your connection."); } finally { setUploadingIdx(null); }
  }
  function removeImage(index: number) { setImageUrls(prev => { const next = [...prev]; next[index] = undefined; return next; }); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Product name is required"); return; }
    if (!form.description.trim()) { toast.error("Description is required"); return; }
    if (!form.price) { toast.error("Price is required"); return; }
    if (!form.categoryId) { toast.error("Select a category"); return; }
    const images = imageUrls.filter(Boolean) as string[];
    if (images.length === 0) { toast.error("Upload at least one product image"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), description: form.description.trim(), price: parseFloat(form.price), oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : null, stock: parseInt(form.stock) || 0, images, categoryId: form.categoryId }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to create product"); return; }
      toast.success("Product listed! It's live on the marketplace now.");
      setForm({ name: "", description: "", price: "", oldPrice: "", stock: "", categoryId: categories[0]?.id || "" });
      setImageUrls([undefined, undefined, undefined, undefined]);
      setTab("Products");
      refetch();
    } catch { toast.error("Something went wrong. Please try again."); } finally { setSaving(false); }
  }

  async function deleteProduct(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to delete product"); return; }
      toast.success("Product deleted"); refetch();
    } catch { toast.error("Something went wrong"); }
  }

  const activeCount = products.filter(p => p.isActive).length;
  const lowStock = products.filter(p => p.stock <= 3).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[1280px] mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div><h1 className="text-[1.6rem] font-extrabold text-gray-800 tracking-tight">Seller Dashboard</h1><p className="text-gray-400 text-sm mt-0.5">Welcome back, <span className="font-semibold text-gray-600">{session.user.name}</span></p></div>
          <div className="flex gap-2">
            <button onClick={() => setTab("Add Product")} className="flex items-center gap-2 bg-gradient-pink text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-pink hover:opacity-90 transition-all hover:-translate-y-0.5"><Plus className="w-4 h-4" /> Add Product</button>
            {storeId && <a href={`/store/${storeId}`} className="flex items-center gap-2 text-sm font-bold text-pink border border-pink-pale2 bg-pink-pale px-5 py-2.5 rounded-full hover:bg-pink hover:text-white transition-all"><Store className="w-4 h-4" /> View My Store</a>}
          </div>
        </div>

        <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl p-1 mb-7 w-fit shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-x-auto">
          {TABS.map(t => <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap ${tab === t ? "bg-gradient-pink text-white shadow-pink" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>{t}</button>)}
        </div>

        {tab === "Overview" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat icon={TrendingUp} label="Total Products" value={products.length} bg="#fff0f7" color="#e8267a" />
              <Stat icon={ShoppingBag} label="Active Products" value={activeCount} bg="#e6f9fc" color="#0db8d4" />
              <Stat icon={Package} label="Total Stock" value={products.reduce((s, p) => s + p.stock, 0)} bg="#f0fdf4" color="#059669" />
              <Stat icon={AlertTriangle} label="Low Stock" value={lowStock} bg="#fef3c7" color="#d97706" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"><h3 className="font-extrabold text-[15px] text-gray-800">Your Products</h3><span className="text-[12px] text-gray-400">{products.length} total</span></div>
              {prodLoading ? <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-pink animate-spin" /></div> : products.length === 0 ? (
                <div className="text-center py-16 px-6"><Package className="w-10 h-10 text-gray-200 mx-auto mb-3" /><div className="font-bold text-gray-500 mb-1">No products yet</div><p className="text-[12.5px] text-gray-400 mb-4">Add your first product to start selling</p><button onClick={() => setTab("Add Product")} className="text-[13px] font-bold text-pink hover:underline">+ Add your first product</button></div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {products.map(p => (
                    <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-pink-pale border border-pink-pale2 shrink-0 flex items-center justify-center">{p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-pink" />}</div>
                      <div className="flex-1 min-w-0"><div className="text-[13.5px] font-bold text-gray-800 truncate">{p.name}</div><div className="text-[11.5px] text-gray-400 mt-0.5">{p.category.name} · {p.stock} in stock</div></div>
                      <div className="text-right shrink-0"><div className="text-[14px] font-extrabold text-pink">{formatPrice(p.price)}</div><span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${p.isActive ? "text-green-600 bg-green-50" : "text-gray-400 bg-gray-100"}`}>{p.isActive ? "Active" : "Inactive"}</span></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "Products" && (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"><h3 className="font-extrabold text-[15px] text-gray-800">My Products <span className="text-gray-400 font-medium">({products.length})</span></h3><button onClick={() => setTab("Add Product")} className="flex items-center gap-1.5 text-[12px] font-bold text-white bg-gradient-pink px-4 py-2 rounded-full shadow-pink hover:opacity-90 transition-opacity"><Plus className="w-3.5 h-3.5" /> New</button></div>
            {prodLoading ? <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-pink animate-spin" /></div> : products.length === 0 ? (
              <div className="text-center py-16"><Package className="w-10 h-10 text-gray-200 mx-auto mb-3" /><div className="font-bold text-gray-500 mb-1">No products yet</div><button onClick={() => setTab("Add Product")} className="text-[13px] font-bold text-pink hover:underline mt-2">+ Add your first product</button></div>
            ) : (
              <div className="overflow-x-auto"><table className="w-full">
                <thead><tr className="border-b border-gray-50">{["Product","Category","Price","Stock","Status",""].map(h => <th key={h} className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-6 py-3">{h}</th>)}</tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl overflow-hidden bg-pink-pale shrink-0 flex items-center justify-center">{p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <Package className="w-4 h-4 text-pink" />}</div><span className="text-[13px] font-bold text-gray-800 line-clamp-1 max-w-[180px]">{p.name}</span></div></td>
                      <td className="px-6 py-3.5 text-[13px] text-gray-500">{p.category.name}</td>
                      <td className="px-6 py-3.5 text-[13px] font-extrabold text-pink">{formatPrice(p.price)}</td>
                      <td className="px-6 py-3.5"><span className={`text-[13px] font-bold ${p.stock === 0 ? "text-red-400" : p.stock <= 3 ? "text-amber-500" : "text-gray-600"}`}>{p.stock}</span></td>
                      <td className="px-6 py-3.5"><span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${p.isActive ? "text-green-600 bg-green-50" : "text-gray-400 bg-gray-100"}`}>{p.isActive ? "Active" : "Inactive"}</span></td>
                      <td className="px-6 py-3.5"><div className="flex gap-2"><Link href={`/seller/products/${p.id}`} className="h-8 px-3 flex items-center justify-center border border-gray-200 rounded-lg text-[12px] font-bold text-gray-500 hover:border-pink hover:text-pink transition-all" title="Edit product">Edit</Link><button onClick={() => deleteProduct(p.id, p.name)} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:border-red-300 hover:text-red-400 transition-all" title="Delete product"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            )}
          </div>
        )}

        {tab === "Orders" && (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="w-14 h-14 bg-pink-pale rounded-2xl flex items-center justify-center mx-auto mb-4"><ShoppingBag className="w-6 h-6 text-pink" /></div>
            <div className="text-[17px] font-extrabold text-gray-800 mb-2">Your Orders</div><p className="text-gray-400 text-[13px] mb-4">View and manage orders containing your products.</p>
            <a href="/seller/orders" className="inline-flex items-center gap-2 bg-gradient-pink text-white font-bold text-[13.5px] px-6 py-3 rounded-full shadow-pink hover:opacity-90 transition-all"><ShoppingBag className="w-4 h-4" /> View Orders</a>
          </div>
        )}

        {tab === "Analytics" && (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <p className="text-gray-400 text-[13px] mb-5 max-w-sm mx-auto">See views, orders, conversion and revenue per product, and export to CSV.</p>
            <a href="/seller/analytics" className="inline-flex items-center gap-2 bg-gradient-pink text-white font-bold text-[13.5px] px-6 py-3 rounded-full shadow-pink hover:opacity-90 transition-all">Open Analytics</a>
          </div>
        )}
        {tab === "Boost" && (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <p className="text-gray-400 text-[13px] mb-5 max-w-sm mx-auto">Pay to show a product first in the marketplace for 3–30 days.</p>
            <a href="/seller/boost" className="inline-flex items-center gap-2 bg-gradient-pink text-white font-bold text-[13.5px] px-6 py-3 rounded-full shadow-pink hover:opacity-90 transition-all">Boost a Product</a>
          </div>
        )}
        {tab === "Earnings" && (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="w-14 h-14 bg-pink-pale rounded-2xl flex items-center justify-center mx-auto mb-4"><TrendingUp className="w-6 h-6 text-pink" /></div>
            <div className="text-[17px] font-extrabold text-gray-800 mb-2">Earnings Dashboard</div><p className="text-gray-400 text-[13px] mb-5 max-w-sm mx-auto">View your revenue, top products, and request withdrawals.</p>
            <a href="/seller/earnings" className="inline-flex items-center gap-2 bg-gradient-pink text-white font-bold text-[13.5px] px-6 py-3 rounded-full shadow-pink hover:opacity-90 transition-all"><TrendingUp className="w-4 h-4" /> View Full Earnings</a>
          </div>
        )}

        {tab === "Add Product" && (
          <div className="max-w-2xl">
            <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <h3 className="text-[18px] font-extrabold text-gray-800 mb-6">List a New Product</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[12.5px] font-bold text-gray-600 mb-2">Product Images * <span className="text-gray-400 font-normal">(first is main · max 5MB each)</span></label>
                  <div className="grid grid-cols-4 gap-3">{[0,1,2,3].map(i => <ImageSlot key={i} index={i} url={imageUrls[i]} onUpload={uploadImage} onRemove={removeImage} uploading={uploadingIdx === i} />)}</div>
                  <p className="text-[11px] text-gray-400 mt-2">Images upload to Cloudinary. If uploads fail, verify CLOUDINARY_* env vars are set.</p>
                </div>
                <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Product Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Premium Ankara Wrap Dress" maxLength={120} className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all" /></div>
                <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Description *</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe your product…" rows={4} maxLength={2000} className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all resize-none" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Price (RWF) *</label><input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="45000" min={1} className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all" /></div>
                  <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Compare-at Price <span className="text-gray-400 font-normal">(optional)</span></label><input type="number" value={form.oldPrice} onChange={e => setForm(f => ({ ...f, oldPrice: e.target.value }))} placeholder="60000" min={1} className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Category *</label><select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink transition-all bg-white cursor-pointer"><option value="">— Select category —</option>{categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}</select></div>
                  <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Stock Quantity *</label><input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="50" min={0} className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all" /></div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={saving || uploadingIdx !== null} className="flex-1 bg-gradient-pink text-white font-bold text-[14px] py-3 rounded-full shadow-pink hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">{saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</> : uploadingIdx !== null ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading image…</> : <><CheckCircle className="w-4 h-4" /> Publish Product</>}</button>
                  <button type="button" onClick={() => setTab("Products")} className="px-6 py-3 border-[1.5px] border-gray-200 text-gray-600 font-semibold text-sm rounded-full hover:border-pink hover:text-pink transition-all">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
