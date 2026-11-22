"use client";
import Link from "next/link";
import { useProducts } from "@/lib/hooks/useProducts";
import { ProductCard, ProductType } from "@/components/products/ProductCard";
import { Loader2, Sparkles, Package } from "lucide-react";
function toCard(p: any): ProductType {
  return { id: p.id, name: p.name, price: p.price, oldPrice: p.oldPrice, images: p.images ?? [], stock: p.stock, isFeatured: p.isFeatured, isNew: new Date(p.createdAt) > new Date(Date.now() - 14 * 86400_000), seller: { name: p.seller?.name ?? "" }, store: p.store ? { id: p.store.id, name: p.store.name } : null, category: { name: p.category?.name ?? "" }, rating: p.avgRating ?? undefined };
}
export function FeaturedProducts() {
  const { products, loading } = useProducts({ limit: 10 });
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="flex items-end justify-between mb-7">
          <div><span className="section-label flex items-center gap-1.5"><Sparkles className="w-3 h-3" />Handpicked For You</span><h2 className="section-title">Featured Products</h2></div>
          <Link href="/marketplace" className="text-sm font-semibold text-pink flex items-center gap-1 hover:gap-2 transition-all">View All<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse"><div className="h-52 bg-gray-100" /><div className="p-3.5 space-y-2"><div className="h-3 bg-gray-100 rounded w-1/2" /><div className="h-4 bg-gray-100 rounded w-3/4" /></div></div>)}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><Package className="w-6 h-6 text-gray-300" /></div>
            <p className="text-gray-400 text-sm">No products have been listed yet. Check back soon, or <Link href="/register?role=SELLER" className="text-pink font-semibold hover:underline">become a seller</Link>.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">{products.slice(0, 10).map(p => <ProductCard key={p.id} product={toCard(p)} />)}</div>
        )}
      </div>
    </section>
  );
}
