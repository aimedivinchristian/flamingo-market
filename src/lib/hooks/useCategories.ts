"use client";
import { useState, useEffect } from "react";
export interface ApiCategory { id: string; name: string; slug: string; emoji: string; _count?: { products: number }; }
export function useCategories() {
  const [categories, setCategories] = useState<ApiCategory[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/categories").then(r => r.json()).then(data => setCategories(data)).catch(() => {}).finally(() => setLoading(false)); }, []);
  return { categories, loading };
}
