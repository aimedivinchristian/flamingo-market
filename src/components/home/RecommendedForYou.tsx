"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ProductCard, ProductType } from "@/components/products/ProductCard";
import { useT } from "@/lib/i18n";

export function toCard(p: any): ProductType {
  return { id: p.id, name: p.name, price: p.price, oldPrice: p.oldPrice, images: p.images ?? [], stock: p.stock, isFeatured: p.isFeatured, isNew: new Date(p.createdAt) > new Date(Date.now() - 14 * 86400_000), seller: { name: p.seller?.name ?? "" }, store: p.store ? { id: p.store.id, name: p.store.name } : null, category: { name: p.category?.name ?? "" }, rating: p.avgRating ?? undefined };
}

/** Homepage block: based on what this visitor recently viewed (kept on their device), else trending products. */
export function RecommendedForYou() {
  const t = useT();
  const [items, setItems] = useState<ProductType[]>([]);
  const [personal, setPersonal] = useState(false);
  useEffect(() => {
    let recent: { id: string; cat: string }[] = [];
    try { recent = JSON.parse(localStorage.getItem("recent") || "[]"); } catch { /* ignore */ }
    const cats = Array.from(new Set(recent.map(r => r.cat).filter(Boolean))).slice(0, 5);
    const exclude = recent.map(r => r.id).slice(0, 20);
    fetch(`/api/recommendations?limit=8&cats=${cats.join(",")}&exclude=${exclude.join(",")}`).then(r => r.json()).then(d => { setItems((d.products ?? []).map(toCard)); setPersonal(!!d.personalised); }).catch(() => {});
  }, []);
  if (items.length < 4) return null; // don't show a thin row on a new marketplace
  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-5">
        <div className="mb-6"><span className="section-label flex items-center gap-1.5"><Sparkles className="w-3 h-3" />{personal ? "For you" : "Popular"}</span><h2 className="section-title">{personal ? t("home.recommended") : t("home.trending")}</h2></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{items.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}</div>
      </div>
    </section>
  );
}
