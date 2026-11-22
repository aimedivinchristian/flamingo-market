"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { formatPrice, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { Search, X, Loader2, CheckSquare, Square, Trash2, Eye, EyeOff, Star, Package, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
interface Product { id: string; name: string; price: number; stock: number; images: string[]; isActive: boolean; isFeatured: boolean; createdAt: string; category: { name: string; slug: string; emoji: string }; seller: { id: string; name: string; email: string }; store: { id: string; name: string } | null; _count: { orderItems: number; reviews: number }; }
const STATUS_OPTS = [{ v: "all", l: "All Products" }, { v: "active", l: "Active" }, { v: "inactive", l: "Inactive" }, { v: "featured", l: "Featured" }] as const;
const BULK_ACTIONS = [{ v: "activate", l: "Activate", icon: Eye, color: "text-green-600" }, { v: "deactivate", l: "Deactivate", icon: EyeOff, color: "text-gray-500" }, { v: "feature", l: "Feature", icon: Star, color: "text-amber-500" }, { v: "delete", l: "Delete", icon: Trash2, color: "text-red-500" }] as const;
export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]); const [total, setTotal] = useState(0); const [pages, setPages] = useState(1); const [page, setPage] = useState(1); const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(""); const [searchInput, setSearchInput] = useState(""); const [statusF, setStatusF] = useState("all"); const [selected, setSelected] = useState<Set<string>>(new Set()); const [bulkAction, setBulkAction] = useState(""); const [applying, setApplying] = useState(false);
  useEffect(() => { if (status === "loading") return; if (!session || session.user.role !== "ADMIN") router.push("/login"); }, [session, status, router]);
  const fetchProducts = useCallback(async () => {
    setLoading(true); setSelected(new Set());
    try { const qs = new URLSearchParams({ page: String(page), limit: "20", status: statusF, ...(search && { search }) }); const res = await fetch(`/api/admin/products?${qs}`); const data = await res.json(); if (!res.ok) { toast.error(data.error); return; } setProducts(data.products); setTotal(data.total); setPages(data.pages); } finally { setLoading(false); }
  }, [page, statusF, search]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  if (!session || session.user.role !== "ADMIN") return null;
  const allSelected = products.length > 0 && products.every(p => selected.has(p.id));
  function toggleAll() { setSelected(allSelected ? new Set() : new Set(products.map(p => p.id))); }
  function toggleOne(id: string) { setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }); }
  async function quickAction(id: string, action: string) {
    const res = await fetch("/api/admin/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [id], action }) });
    const data = await res.json(); if (!res.ok) { toast.error(data.error); return; }
    if (action === "delete") { setProducts(prev => prev.filter(p => p.id !== id)); setTotal(t => t - 1); toast.success("Product deleted"); return; }
    setProducts(prev => prev.map(p => { if (p.id !== id) return p; if (action === "activate") return { ...p, isActive: true }; if (action === "deactivate") return { ...p, isActive: false }; if (action === "feature") return { ...p, isFeatured: true }; if (action === "unfeature") return { ...p, isFeatured: false }; return p; }));
    toast.success(`Product ${action}d`);
  }
  async function applyBulk() {
    if (!bulkAction || selected.size === 0) return;
    if (bulkAction === "delete" && !confirm(`Delete ${selected.size} product(s)?`)) return;
    setApplying(true);
    try { const res = await fetch("/api/admin/products", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: Array.from(selected), action: bulkAction }) }); const data = await res.json(); if (!res.ok) { toast.error(data.error); return; } toast.success(`${data.affected} product(s) ${bulkAction}d`); setBulkAction(""); fetchProducts(); } finally { setApplying(false); }
  }
  function doSearch() { setSearch(searchInput.trim()); setPage(1); }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[1280px] mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6"><div><div className="flex items-center gap-2 mb-1"><Link href="/admin" className="text-[13px] text-gray-400 hover:text-pink transition-colors font-medium">Admin</Link><ChevronRight className="w-3.5 h-3.5 text-gray-300" /><span className="text-[13px] font-bold text-gray-700">Products</span></div><h1 className="text-[1.6rem] font-extrabold text-gray-800 tracking-tight">Product Moderation</h1><p className="text-gray-400 text-sm mt-0.5">{total.toLocaleString()} total products</p></div></div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" /><input value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") doSearch(); }} placeholder="Search products…" className="pl-9 pr-8 py-2 border-[1.5px] border-gray-200 rounded-full text-[12.5px] bg-white outline-none focus:border-pink transition-all w-56 placeholder:text-gray-400" /></div>
            {searchInput !== search && <button onClick={doSearch} className="text-[12px] font-bold text-white bg-pink px-4 py-2 rounded-full hover:opacity-90">Search</button>}
            <div className="flex gap-1.5">{STATUS_OPTS.map(opt => <button key={opt.v} onClick={() => { setStatusF(opt.v); setPage(1); }} className={cn("px-3.5 py-1.5 rounded-full text-[12px] font-semibold border-[1.5px] transition-all", statusF === opt.v ? "border-pink bg-pink-pale text-pink" : "border-gray-200 text-gray-500 bg-white hover:border-pink hover:text-pink")}>{opt.l}</button>)}</div>
            <div className="ml-auto flex items-center gap-3"><span className="text-[12px] text-gray-400">{total} products</span></div>
          </div>
        </div>
        {selected.size > 0 && (
          <div className="bg-pink-pale border border-pink-pale2 rounded-2xl px-5 py-3 mb-4 flex items-center gap-4 flex-wrap">
            <span className="text-[13px] font-bold text-pink">{selected.size} selected</span>
            <div className="flex gap-2 flex-wrap">{BULK_ACTIONS.map(({ v, l, icon: Icon, color }) => (<button key={v} onClick={() => setBulkAction(v)} className={cn("flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-2 rounded-full border-[1.5px] transition-all", bulkAction === v ? "border-pink bg-pink text-white" : `border-gray-200 bg-white ${color} hover:border-current`)}><Icon className="w-3.5 h-3.5" /> {l}</button>))}</div>
            {bulkAction && <button onClick={applyBulk} disabled={applying} className="flex items-center gap-2 text-[12.5px] font-bold text-white bg-gradient-pink px-5 py-2 rounded-full shadow-pink hover:opacity-90 transition-all disabled:opacity-60 ml-auto">{applying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}Apply to {selected.size}</button>}
          </div>
        )}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          {loading ? <div className="flex items-center justify-center py-20"><Loader2 className="w-7 h-7 text-pink animate-spin" /></div> : products.length === 0 ? <div className="text-center py-20"><Package className="w-10 h-10 text-gray-200 mx-auto mb-3" strokeWidth={1} /><div className="font-bold text-gray-500 text-[15px]">No products found</div></div> : (
            <>
              <div className="overflow-x-auto"><table className="w-full">
                <thead><tr className="border-b border-gray-100"><th className="px-4 py-3 w-10"><button onClick={toggleAll} className="text-gray-400 hover:text-pink transition-colors">{allSelected ? <CheckSquare className="w-4 h-4 text-pink" /> : <Square className="w-4 h-4" />}</button></th>{["Product","Seller","Category","Price","Stock","Status","Actions"].map(h => <th key={h} className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>)}</tr></thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className={cn("border-b border-gray-50 transition-colors", selected.has(product.id) ? "bg-pink-pale/50" : "hover:bg-gray-50")}>
                      <td className="px-4 py-3.5"><button onClick={() => toggleOne(product.id)} className="text-gray-400 hover:text-pink transition-colors">{selected.has(product.id) ? <CheckSquare className="w-4 h-4 text-pink" /> : <Square className="w-4 h-4" />}</button></td>
                      <td className="px-4 py-3.5"><div className="flex items-center gap-3 max-w-[220px]"><div className="w-10 h-10 rounded-xl bg-pink-pale border border-pink-pale2 flex items-center justify-center shrink-0 overflow-hidden">{product.images?.[0] ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" /> : <Package className="w-4 h-4 text-pink" />}</div><div className="min-w-0"><div className="text-[13px] font-bold text-gray-800 truncate">{product.name}</div></div></div></td>
                      <td className="px-4 py-3.5"><div className="text-[12.5px] font-semibold text-gray-700 truncate max-w-[120px]">{product.store?.name ?? product.seller.name}</div></td>
                      <td className="px-4 py-3.5 text-[12.5px] text-gray-500 whitespace-nowrap">{product.category.emoji} {product.category.name}</td>
                      <td className="px-4 py-3.5 font-extrabold text-[13px] text-pink whitespace-nowrap">{formatPrice(product.price)}</td>
                      <td className="px-4 py-3.5"><span className={cn("text-[12.5px] font-bold", product.stock === 0 ? "text-red-400" : product.stock <= 3 ? "text-amber-500" : "text-gray-600")}>{product.stock}</span></td>
                      <td className="px-4 py-3.5"><div className="flex flex-col gap-1"><span className={cn("text-[10.5px] font-bold px-2 py-0.5 rounded-full w-fit", product.isActive ? "text-green-600 bg-green-50" : "text-gray-400 bg-gray-100")}>{product.isActive ? "Active" : "Inactive"}</span>{product.isFeatured && <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full w-fit text-amber-600 bg-amber-50">★ Featured</span>}</div></td>
                      <td className="px-4 py-3.5"><div className="flex items-center gap-1.5"><Link href={`/product/${product.id}`} target="_blank" className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-pink hover:text-pink transition-all"><ExternalLink className="w-3.5 h-3.5" /></Link><button onClick={() => quickAction(product.id, product.isActive ? "deactivate" : "activate")} className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-500 transition-all">{product.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button><button onClick={() => quickAction(product.id, product.isFeatured ? "unfeature" : "feature")} className={cn("w-7 h-7 flex items-center justify-center rounded-lg border transition-all", product.isFeatured ? "border-amber-300 text-amber-500 bg-amber-50" : "border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-500")}><Star className="w-3.5 h-3.5" /></button><button onClick={() => { if (confirm(`Delete "${product.name}"?`)) quickAction(product.id, "delete"); }} className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
              {pages > 1 && <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100"><span className="text-[12.5px] text-gray-400">Page {page} of {pages}</span><div className="flex items-center gap-2"><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:border-pink hover:text-pink transition-all disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button><button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:border-pink hover:text-pink transition-all disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button></div></div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
