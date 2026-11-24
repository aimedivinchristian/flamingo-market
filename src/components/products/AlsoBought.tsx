"use client";
import { useEffect, useState } from "react";
import { ProductCard, ProductType } from "@/components/products/ProductCard";
import { toCard } from "@/components/home/RecommendedForYou";
import { useT } from "@/lib/i18n";

export function AlsoBought({ productId }: { productId: string }) {
  const t = useT();
  const [items, setItems] = useState<ProductType[]>([]);
  useEffect(() => { fetch(`/api/products/${productId}/also-bought`).then(r => r.json()).then(d => setItems((d.products ?? []).map(toCard))).catch(() => {}); }, [productId]);
  if (!items.length) return null;
  return (
    <div className="mt-12"><div className="mb-6"><span className="section-label">Popular combos</span><h2 className="section-title">{t("home.alsoBought")}</h2></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{items.map(p => <ProductCard key={p.id} product={p} />)}</div></div>
  );
}
