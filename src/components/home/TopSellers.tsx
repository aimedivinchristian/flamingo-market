"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BadgeCheck, Loader2, Store } from "lucide-react";
interface StoreItem { id: string; name: string; description: string | null; logo: string | null; isVerified: boolean; seller: { name: string }; _count: { products: number }; }
export function TopSellers() {
  const [stores, setStores] = useState<StoreItem[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/stores").then(r => r.json()).then(data => setStores(Array.isArray(data) ? data.slice(0, 4) : [])).catch(() => {}).finally(() => setLoading(false)); }, []);
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="flex items-end justify-between mb-7">
          <div><span className="section-label">Trusted Sellers</span><h2 className="section-title">Top Stores</h2></div>
          <Link href="/marketplace" className="text-sm font-semibold text-pink flex items-center gap-1 hover:gap-2 transition-all">View All<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-pink animate-spin" /></div>
        ) : stores.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><Store className="w-6 h-6 text-gray-300" /></div>
            <p className="text-gray-400 text-sm">No stores have joined yet. <Link href="/register?role=SELLER" className="text-pink font-semibold hover:underline">Be the first seller!</Link></p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stores.map(store => (
              <Link key={store.id} href={`/store/${store.id}`} className="group bg-white border-[1.5px] border-gray-200 rounded-2xl p-6 text-center transition-all duration-250 hover:border-pink-pale2 hover:shadow-card hover:-translate-y-1 block">
                <div className="relative w-16 h-16 rounded-[18px] mx-auto mb-3 overflow-hidden">{store.logo ? <Image src={store.logo} alt={store.name} fill className="object-cover" /> : <div className="w-full h-full bg-gradient-pink flex items-center justify-center text-white text-2xl font-extrabold shadow-pink">{store.name[0]}</div>}</div>
                {store.isVerified && <div className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan bg-cyan-light px-2.5 py-0.5 rounded-full mb-2"><BadgeCheck className="w-3 h-3" /> Verified</div>}
                <div className="font-extrabold text-[14px] text-gray-800 group-hover:text-pink transition-colors mb-0.5">{store.name}</div>
                <div className="text-[11.5px] text-gray-400 mb-3 line-clamp-1">{store.description ?? store.seller.name}</div>
                <div className="flex gap-4 justify-center mb-4"><div className="text-center"><div className="font-extrabold text-[14px] text-gray-800">{store._count.products}</div><div className="text-[10.5px] text-gray-400">Products</div></div></div>
                <div className="w-full bg-pink-pale text-pink border-[1.5px] border-pink-pale2 rounded-xl py-2 text-[12px] font-bold group-hover:bg-pink group-hover:text-white transition-all">Visit Store</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
