"use client";
import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard, ProductType } from "@/components/products/ProductCard";
import { useProducts } from "@/lib/hooks/useProducts";
import { useCategories } from "@/lib/hooks/useCategories";
import { Search, SlidersHorizontal, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
const SORT_MAP: Record<string, string> = { "": "Featured", "price-asc": "Price: Low → High", "price-desc": "Price: High → Low" };
function toCard(p: any): ProductType {
  return { id: p.id, name: p.name, price: p.price, oldPrice: p.oldPrice, images: p.images ?? [], stock: p.stock, isFeatured: p.isFeatured, isNew: new Date(p.createdAt) > new Date(Date.now() - 14 * 86400_000), seller: { name: p.seller?.name ?? "Unknown" }, store: p.store ? { id: p.store.id, name: p.store.name } : null, category: { name: p.category?.name ?? "" }, rating: p.avgRating ?? undefined };
}
function MarketplaceInner() {
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || ""); const [input, setInput] = useState(params.get("q") || ""); const [cat, setCat] = useState(params.get("category") || ""); const [sort, setSort] = useState(""); const [chip, setChip] = useState("All"); const [page, setPage] = useState(1);
  const { products: raw, total, pages, loading, error, refetch } = useProducts({ category: cat || undefined, search: search || undefined, page, limit: 20 });
  const { categories } = useCategories();
  const products = useCallback(() => {
    let list = raw.map(toCard);
    if (chip === "On Sale") list = list.filter(p => p.oldPrice);
    if (chip === "New") list = list.filter(p => p.isNew);
    if (chip === "Featured") list = list.filter(p => p.isFeatured);
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [raw, chip, sort])();
  function doSearch() { setSearch(input.trim()); setPage(1); }
  function clearAll() { setInput(""); setSearch(""); setCat(""); setChip("All"); setSort(""); setPage(1); }
  const hasFilters = search || cat || chip !== "All" || sort;
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="sticky top-[108px] z-40 bg-white border-b border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1280px] mx-auto px-5">
          <div className="flex overflow-x-auto scrollbar-hide gap-0 pt-1">
            <button onClick={() => { setCat(""); setPage(1); }} className={cn("px-5 py-3 text-[13px] font-semibold whitespace-nowrap border-b-[2.5px] transition-all shrink-0", cat === "" ? "text-pink border-pink" : "text-gray-500 border-transparent hover:text-pink hover:border-pink")}>All</button>
            {categories.map(c => <button key={c.id} onClick={() => { setCat(c.slug); setPage(1); }} className={cn("px-5 py-3 text-[13px] font-semibold whitespace-nowrap border-b-[2.5px] transition-all shrink-0", cat === c.slug ? "text-pink border-pink" : "text-gray-500 border-transparent hover:text-pink hover:border-pink")}>{c.emoji} {c.name}</button>)}
          </div>
          <div className="flex items-center gap-3 py-3 flex-wrap">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" /><input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") doSearch(); }} placeholder="Search products…" className="pl-9 pr-8 py-2 border-[1.5px] border-gray-200 rounded-full text-[12.5px] bg-white outline-none focus:border-pink transition-all w-52 placeholder:text-gray-400" />{input && <button onClick={() => { setInput(""); setSearch(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-pink"><X className="w-3 h-3" /></button>}</div>
            {input !== search && <button onClick={doSearch} className="text-[12px] font-bold text-white bg-pink px-4 py-2 rounded-full hover:opacity-90 transition-opacity">Search</button>}
            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className="text-[12.5px] font-semibold text-gray-600 border-[1.5px] border-gray-200 rounded-full px-4 py-2 bg-white outline-none cursor-pointer hover:border-pink transition-colors">{Object.entries(SORT_MAP).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            <div className="flex gap-1.5">{["All","On Sale","New","Featured"].map(c => <button key={c} onClick={() => { setChip(c); setPage(1); }} className={cn("px-3 py-1.5 rounded-full text-[12px] font-semibold border-[1.5px] transition-all", chip === c ? "border-pink text-pink bg-pink-pale" : "border-gray-200 text-gray-500 bg-white hover:border-pink hover:text-pink")}>{c}</button>)}</div>
            <div className="ml-auto flex items-center gap-3">{!loading && <span className="text-[12px] text-gray-400 font-medium">{products.length} of {total} products</span>}{hasFilters && <button onClick={clearAll} className="text-[12px] text-pink font-semibold hover:underline flex items-center gap-1"><X className="w-3 h-3" /> Clear</button>}</div>
          </div>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-5 py-10">
        {error && !loading && (<div className="text-center py-16"><div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><SlidersHorizontal className="w-6 h-6 text-red-300" /></div><h3 className="font-bold text-gray-600 text-[16px] mb-2">Could not load products</h3><p className="text-[13px] text-gray-400 mb-5">{error}</p><button onClick={() => refetch()} className="flex items-center gap-2 text-[13px] font-bold text-pink mx-auto hover:underline"><RefreshCw className="w-3.5 h-3.5" /> Try again</button></div>)}
        {loading && (<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">{Array.from({ length: 10 }).map((_, i) => (<div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse"><div className="h-52 bg-gray-100" /><div className="p-3.5 space-y-2"><div className="h-3 bg-gray-100 rounded w-1/2" /><div className="h-4 bg-gray-100 rounded w-3/4" /><div className="h-4 bg-gray-100 rounded w-1/3" /></div></div>))}</div>)}
        {!loading && !error && products.length === 0 && (<div className="text-center py-24"><div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><SlidersHorizontal className="w-7 h-7 text-gray-300" /></div><h3 className="font-extrabold text-gray-700 text-[18px] mb-2">No products found</h3><p className="text-[13px] text-gray-400 mb-5">{search ? `No results for "${search}"` : total === 0 ? "No products have been listed yet. Check back soon!" : "Try a different category or filter"}</p>{hasFilters && <button onClick={clearAll} className="text-[13px] font-bold text-pink border border-pink-pale2 px-5 py-2.5 rounded-full hover:bg-pink-pale transition-colors">Clear all filters</button>}</div>)}
        {!loading && !error && products.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-10">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
            {pages > 1 && (<div className="flex items-center justify-center gap-2"><button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-[13px] font-semibold border border-gray-200 rounded-full text-gray-600 hover:border-pink hover:text-pink transition-all disabled:opacity-40 disabled:cursor-not-allowed">← Previous</button>{Array.from({ length: pages }, (_, i) => i + 1).map(p => (<button key={p} onClick={() => setPage(p)} className={cn("w-9 h-9 rounded-full text-[13px] font-bold transition-all", page === p ? "bg-gradient-pink text-white shadow-pink" : "border border-gray-200 text-gray-500 hover:border-pink hover:text-pink")}>{p}</button>))}<button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="px-4 py-2 text-[13px] font-semibold border border-gray-200 rounded-full text-gray-600 hover:border-pink hover:text-pink transition-all disabled:opacity-40 disabled:cursor-not-allowed">Next →</button></div>)}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
export default function MarketplacePage() { return <Suspense><MarketplaceInner /></Suspense>; }
