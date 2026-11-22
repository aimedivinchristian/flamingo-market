"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard, ProductType } from "@/components/products/ProductCard";
import { useProducts } from "@/lib/hooks/useProducts";
import { Search, X, TrendingUp, Clock, Loader2 } from "lucide-react";
const TRENDING = ["Ankara Dress","iPhone 15","Nike","Skincare","MacBook","Coffee"];
function toCard(p: any): ProductType { return { id: p.id, name: p.name, price: p.price, oldPrice: p.oldPrice, images: p.images ?? [], stock: p.stock, isFeatured: p.isFeatured, seller: { name: p.seller?.name ?? "" }, store: p.store ? { id: p.store.id, name: p.store.name } : null, category: { name: p.category?.name ?? "" }, rating: 4.8 }; }
function SearchInner() {
  const params = useSearchParams(); const router = useRouter();
  const [query, setQuery] = useState(params.get("q") || ""); const [input, setInput] = useState(params.get("q") || ""); const [recent, setRecent] = useState<string[]>([]);
  const { products: raw, loading } = useProducts({ search: query || undefined, limit: 40, enabled: !!query });
  const products = raw.map(toCard);
  useEffect(() => { try { setRecent(JSON.parse(localStorage.getItem("flamingo-recent-searches") || "[]").slice(0, 5)); } catch {} }, []);
  function saveSearch(q: string) { if (!q.trim()) return; try { const saved = JSON.parse(localStorage.getItem("flamingo-recent-searches") || "[]") as string[]; const next = [q, ...saved.filter(s => s !== q)].slice(0, 5); localStorage.setItem("flamingo-recent-searches", JSON.stringify(next)); setRecent(next); } catch {} }
  function doSearch(q?: string) { const term = (q ?? input).trim(); setQuery(term); if (term) saveSearch(term); router.push(`/search?q=${encodeURIComponent(term)}`, { scroll: false }); }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-white border-b border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1280px] mx-auto px-5 py-5">
          <div className="flex gap-3 max-w-2xl">
            <div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" /><input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") doSearch(); }} placeholder="Search products, brands, sellers…" autoFocus className="w-full pl-11 pr-10 py-3 text-[14px] border-[1.5px] border-gray-200 rounded-2xl outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all bg-gray-50 focus:bg-white placeholder:text-gray-400" />{input && <button onClick={() => { setInput(""); setQuery(""); }} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"><X className="w-4 h-4" /></button>}</div>
            <button onClick={() => doSearch()} className="bg-gradient-pink text-white font-bold text-[14px] px-7 py-3 rounded-2xl shadow-pink hover:opacity-90 transition-all flex items-center gap-2"><Search className="w-4 h-4" /> Search</button>
          </div>
          {!query && (
            <div className="mt-4 space-y-3">
              {recent.length > 0 && <div className="flex items-center gap-2 flex-wrap"><div className="flex items-center gap-1.5 text-[11.5px] font-bold text-gray-400 uppercase tracking-wider"><Clock className="w-3.5 h-3.5" /> Recent</div>{recent.map(r => <button key={r} onClick={() => { setInput(r); doSearch(r); }} className="text-[12.5px] font-semibold text-gray-600 bg-gray-100 hover:bg-pink-pale hover:text-pink px-3 py-1 rounded-full transition-all">{r}</button>)}</div>}
              <div className="flex items-center gap-2 flex-wrap"><div className="flex items-center gap-1.5 text-[11.5px] font-bold text-gray-400 uppercase tracking-wider"><TrendingUp className="w-3.5 h-3.5" /> Trending</div>{TRENDING.map(t => <button key={t} onClick={() => { setInput(t); doSearch(t); }} className="text-[12.5px] font-semibold text-pink bg-pink-pale border border-pink-pale2 hover:bg-pink hover:text-white px-3 py-1 rounded-full transition-all">{t}</button>)}</div>
            </div>
          )}
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-5 py-8">
        {query && <div className="mb-6"><span className="text-[14px] text-gray-500">{loading ? "Searching for " : products.length === 0 ? "No results for " : `${products.length} result${products.length !== 1 ? "s" : ""} for `}</span><span className="font-extrabold text-gray-800 text-[14px]">&quot;{query}&quot;</span></div>}
        {loading && <div className="flex items-center justify-center py-16"><Loader2 className="w-7 h-7 text-pink animate-spin" /></div>}
        {query && !loading && products.length === 0 && (
          <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Search className="w-7 h-7 text-gray-300" /></div>
            <h3 className="text-[1.1rem] font-extrabold text-gray-700 mb-2">No results for &quot;{query}&quot;</h3>
            <p className="text-[13px] text-gray-400 mb-6 max-w-sm mx-auto">Try different keywords, check your spelling, or browse by category.</p>
            <div className="flex flex-wrap gap-2 justify-center">{TRENDING.map(t => <button key={t} onClick={() => { setInput(t); doSearch(t); }} className="text-[12.5px] font-semibold text-pink bg-pink-pale border border-pink-pale2 hover:bg-pink hover:text-white px-4 py-2 rounded-full transition-all">{t}</button>)}</div>
          </div>
        )}
        {!loading && products.length > 0 && <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>}
      </div>
      <Footer />
    </div>
  );
}
export default function SearchPage() { return <Suspense><SearchInner /></Suspense>; }
