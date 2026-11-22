"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard, ProductType } from "@/components/products/ProductCard";
import toast from "react-hot-toast";
import { BadgeCheck, Package, ShoppingBag, Star, MapPin, Calendar, Pencil, X, Loader2, AlertCircle, Search, SlidersHorizontal, Upload, Check } from "lucide-react";
import { cn } from "@/lib/utils";
interface StoreData { id: string; name: string; description: string | null; logo: string | null; banner: string | null; isVerified: boolean; createdAt: string; totalOrders: number; _count: { products: number }; seller: { id: string; name: string; image: string | null; createdAt: string }; products: any[]; }
function toCard(p: any): ProductType { return { id: p.id, name: p.name, price: p.price, oldPrice: p.oldPrice, images: p.images ?? [], stock: p.stock, isFeatured: p.isFeatured, seller: { name: p.seller?.name ?? "" }, category: { name: p.category?.name ?? "" }, rating: 4.8 }; }
const SORT_OPTS = [{ v: "newest", l: "Newest First" }, { v: "price-asc", l: "Price: Low → High" }, { v: "price-desc", l: "Price: High → Low" }];
function EditStoreModal({ store, onClose, onSaved }: { store: StoreData; onClose: () => void; onSaved: (updated: Partial<StoreData>) => void }) {
  const [name, setName] = useState(store.name); const [description, setDescription] = useState(store.description ?? ""); const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false); const [bannerUploading, setBannerUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(store.logo); const [bannerPreview, setBannerPreview] = useState<string | null>(store.banner);
  async function uploadImage(file: File, setUploading: (v: boolean) => void, setPreview: (v: string) => void) {
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    setUploading(true);
    try { const fd = new FormData(); fd.append("file", file); const res = await fetch("/api/upload", { method: "POST", body: fd }); const data = await res.json(); if (!res.ok) { toast.error(data.error || "Upload failed"); return; } setPreview(data.url); } catch { toast.error("Upload failed"); } finally { setUploading(false); }
  }
  async function handleSave() {
    if (!name.trim()) { toast.error("Store name is required"); return; }
    setSaving(true);
    try { const res = await fetch(`/api/stores/${store.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), description: description.trim() || null, logo: logoPreview, banner: bannerPreview }) }); const data = await res.json(); if (!res.ok) { toast.error(data.error || "Failed to save"); return; } toast.success("Store updated!"); onSaved({ name: data.name, description: data.description, logo: data.logo, banner: data.banner }); onClose(); } finally { setSaving(false); }
  }
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-[0_24px_80px_rgba(0,0,0,0.15)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"><div className="font-extrabold text-[16px] text-gray-800">Edit Store</div><button onClick={onClose} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-pink hover:text-pink transition-all"><X className="w-4 h-4" /></button></div>
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div><label className="block text-[12.5px] font-bold text-gray-600 mb-2">Store Banner</label><div className="relative h-28 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer hover:border-pink hover:bg-pink-pale transition-all" onClick={() => document.getElementById("banner-upload")?.click()}>{bannerPreview ? <img src={bannerPreview} alt="" className="w-full h-full object-cover" /> : <div className="text-center"><Upload className="w-5 h-5 text-gray-300 mx-auto mb-1" /><span className="text-[11px] text-gray-400">Upload banner (1200×300)</span></div>}{bannerUploading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><Loader2 className="w-5 h-5 text-pink animate-spin" /></div>}<input id="banner-upload" type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, setBannerUploading, setBannerPreview); e.target.value = ""; }} /></div></div>
          <div><label className="block text-[12.5px] font-bold text-gray-600 mb-2">Store Logo</label><div className="flex items-center gap-4"><div className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer hover:border-pink hover:bg-pink-pale transition-all shrink-0" onClick={() => document.getElementById("logo-upload")?.click()}>{logoPreview ? <img src={logoPreview} alt="" className="w-full h-full object-cover" /> : logoUploading ? <Loader2 className="w-5 h-5 text-pink animate-spin" /> : <Upload className="w-5 h-5 text-gray-300" />}<input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, setLogoUploading, setLogoPreview); e.target.value = ""; }} /></div><div className="text-[12px] text-gray-400 leading-relaxed">Square image recommended.<br />Min 200×200px, max 5MB.</div></div></div>
          <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Store Name *</label><input value={name} onChange={e => setName(e.target.value)} maxLength={60} className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all" /></div>
          <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Store Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} maxLength={500} placeholder="Tell customers what your store is about…" className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all resize-none" /><div className="text-right text-[10.5px] text-gray-300 mt-0.5">{description.length}/500</div></div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100"><button onClick={handleSave} disabled={saving || logoUploading || bannerUploading} className="flex-1 bg-gradient-pink text-white font-bold text-[14px] py-2.5 rounded-full shadow-pink hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">{saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Check className="w-4 h-4" /> Save Changes</>}</button><button onClick={onClose} className="px-5 py-2.5 border-[1.5px] border-gray-200 text-gray-600 font-semibold text-sm rounded-full hover:border-pink hover:text-pink transition-all">Cancel</button></div>
      </div>
    </div>
  );
}
export default function StorePage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [store, setStore] = useState<StoreData | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(""); const [sort, setSort] = useState("newest"); const [catFilter, setCatFilter] = useState("All"); const [showEdit, setShowEdit] = useState(false);
  const isOwner = session?.user?.id === store?.seller?.id;
  useEffect(() => {
    async function load() { setLoading(true); setError(null); try { const res = await fetch(`/api/stores/${id}`); const data = await res.json(); if (!res.ok) throw new Error(data.error || "Store not found"); setStore(data); } catch (e: any) { setError(e.message); } finally { setLoading(false); } }
    load();
  }, [id]);
  if (loading) return <div className="min-h-screen bg-white"><Navbar /><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-7 h-7 text-pink animate-spin" /></div></div>;
  if (error || !store) return <div className="min-h-screen bg-white"><Navbar /><div className="flex items-center justify-center min-h-[60vh]"><div className="text-center"><div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-6 h-6 text-red-400" /></div><h2 className="text-[17px] font-extrabold text-gray-700 mb-2">Store not found</h2><Link href="/marketplace" className="text-[13px] font-bold text-pink hover:underline">← Back to Marketplace</Link></div></div></div>;
  const categories = ["All", ...Array.from(new Set(store.products.map((p: any) => p.category?.name).filter(Boolean)))];
  let products = store.products.map(toCard);
  if (search) products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  if (catFilter !== "All") products = products.filter(p => p.category.name === catFilter);
  if (sort === "price-asc") products.sort((a, b) => a.price - b.price); if (sort === "price-desc") products.sort((a, b) => b.price - a.price);
  const joinDate = new Date(store.seller.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-pink-pale via-white to-cyan-light overflow-hidden">
        {store.banner ? <Image src={store.banner} alt="" fill className="object-cover" priority /> : <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(232,38,122,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(13,184,212,0.1) 0%, transparent 50%)" }}><div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(rgba(232,38,122,1) 1px, transparent 1px), linear-gradient(90deg, rgba(232,38,122,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} /></div>}
        {isOwner && <button onClick={() => setShowEdit(true)} className="absolute top-4 right-4 flex items-center gap-1.5 text-[12px] font-bold text-white bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full hover:bg-black/60 transition-colors"><Pencil className="w-3 h-3" /> Edit Store</button>}
      </div>
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] -mt-10 relative z-10 mb-8 p-6">
          <div className="flex items-start gap-5">
            <div className="relative -mt-14 shrink-0"><div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white shadow-card overflow-hidden bg-gradient-pink flex items-center justify-center">{store.logo ? <Image src={store.logo} alt={store.name} fill className="object-cover" /> : <span className="text-white font-extrabold text-3xl">{store.name[0]}</span>}</div>{store.isVerified && <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-cyan rounded-full flex items-center justify-center border-2 border-white shadow"><BadgeCheck className="w-4 h-4 text-white" /></div>}</div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div><div className="flex items-center gap-2 flex-wrap"><h1 className="text-[1.4rem] font-extrabold text-gray-800 tracking-tight">{store.name}</h1>{store.isVerified && <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan bg-cyan-light px-2.5 py-0.5 rounded-full"><BadgeCheck className="w-3 h-3" /> Verified</span>}</div>{store.description && <p className="text-[13px] text-gray-500 mt-1 leading-relaxed max-w-xl">{store.description}</p>}<div className="flex items-center gap-4 mt-2.5 flex-wrap"><div className="flex items-center gap-1.5 text-[12px] text-gray-400"><Calendar className="w-3.5 h-3.5" /><span>Joined {joinDate}</span></div><div className="flex items-center gap-1.5 text-[12px] text-gray-400"><MapPin className="w-3.5 h-3.5" /><span>Kigali, Rwanda</span></div><div className="flex items-center gap-1 text-[12px] text-gray-400"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /><span className="font-bold text-gray-700">4.8</span><span>seller rating</span></div></div></div>
                {isOwner && <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 text-[13px] font-bold text-pink border border-pink-pale2 bg-pink-pale px-4 py-2 rounded-full hover:bg-pink hover:text-white transition-all shrink-0"><Pencil className="w-3.5 h-3.5" /> Edit Store</button>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100">{[{ icon: Package, label: "Products", value: store._count.products }, { icon: ShoppingBag, label: "Orders", value: store.totalOrders }, { icon: Star, label: "Avg. Rating", value: "4.8 / 5" }].map(({ icon: Icon, label, value }) => (<div key={label} className="text-center"><div className="flex items-center justify-center gap-1.5 text-gray-400 mb-0.5"><Icon className="w-3.5 h-3.5" /><span className="text-[11.5px] font-medium">{label}</span></div><div className="text-[1.2rem] font-extrabold text-gray-800">{value}</div></div>))}</div>
        </div>
        <div className="pb-14">
          <div className="flex items-center gap-3 flex-wrap mb-5">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${store.name}…`} className="pl-9 pr-4 py-2 border-[1.5px] border-gray-200 rounded-full text-[12.5px] bg-white outline-none focus:border-pink transition-all w-52 placeholder:text-gray-400" /></div>
            <div className="flex gap-1.5 flex-wrap">{categories.map(c => <button key={c} onClick={() => setCatFilter(c)} className={cn("px-3.5 py-1.5 rounded-full text-[12px] font-semibold border-[1.5px] transition-all", catFilter === c ? "border-pink bg-pink-pale text-pink" : "border-gray-200 text-gray-500 bg-white hover:border-pink hover:text-pink")}>{c}</button>)}</div>
            <div className="ml-auto flex items-center gap-3"><span className="text-[12px] text-gray-400">{products.length} products</span><select value={sort} onChange={e => setSort(e.target.value)} className="text-[12.5px] font-semibold text-gray-600 border-[1.5px] border-gray-200 rounded-full px-4 py-1.5 bg-white outline-none cursor-pointer hover:border-pink transition-colors">{SORT_OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}</select></div>
          </div>
          {products.length === 0 ? (<div className="bg-white border border-gray-100 rounded-2xl p-16 text-center"><div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><SlidersHorizontal className="w-6 h-6 text-gray-300" /></div><h3 className="font-extrabold text-gray-600 text-[15px] mb-1.5">{search ? `No results for "${search}"` : "No products yet"}</h3><p className="text-[12.5px] text-gray-400">{search ? "Try a different search term." : "This store hasn't listed any products yet."}</p>{search && <button onClick={() => setSearch("")} className="mt-3 text-[12.5px] font-bold text-pink hover:underline">Clear search</button>}</div>) : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>}
        </div>
      </div>
      {showEdit && <EditStoreModal store={store} onClose={() => setShowEdit(false)} onSaved={(updated) => setStore(s => s ? { ...s, ...updated } : s)} />}
      <Footer />
    </div>
  );
}
