"use client";
import { useState, useEffect, useCallback } from "react";
export interface ApiProduct { id: string; name: string; description: string; price: number; oldPrice: number | null; stock: number; images: string[]; isActive: boolean; isFeatured: boolean; createdAt: string; category: { id: string; name: string; slug: string; emoji: string }; seller: { id: string; name: string; image: string | null }; store: { id: string; name: string; logo: string | null } | null; }
interface Params { category?: string; search?: string; sellerId?: string; featured?: boolean; page?: number; limit?: number; enabled?: boolean; }
export function useProducts(params: Params = {}) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [total, setTotal] = useState(0); const [pages, setPages] = useState(1); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const enabled = params.enabled !== false;
  const fetchProducts = useCallback(async () => {
    if (!enabled) return;
    setLoading(true); setError(null);
    try {
      const qs = new URLSearchParams();
      if (params.category) qs.set("category", params.category);
      if (params.search) qs.set("search", params.search);
      if (params.sellerId) qs.set("sellerId", params.sellerId);
      if (params.featured) qs.set("featured", "true");
      if (params.page) qs.set("page", String(params.page));
      if (params.limit) qs.set("limit", String(params.limit));
      const res = await fetch(`/api/products?${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load products");
      setProducts(data.products ?? []); setTotal(data.total ?? 0); setPages(data.pages ?? 1);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.category, params.search, params.sellerId, params.featured, params.page, params.limit, enabled]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  return { products, total, pages, loading, error, refetch: fetchProducts };
}
export function useSellerProducts(sellerId?: string) { return useProducts({ sellerId, limit: 50, enabled: !!sellerId }); }
