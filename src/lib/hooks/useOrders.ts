"use client";
import { useState, useEffect, useCallback } from "react";
export interface OrderItem { id: string; quantity: number; price: number; product: { id: string; name: string; images: string[]; sellerId: string }; }
export interface Order { id: string; total: number; status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED"; address: string; phone: string; notes: string | null; createdAt: string; updatedAt: string; buyer: { id: string; name: string; email: string; image: string | null }; items: OrderItem[]; }
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const fetchOrders = useCallback(async () => {
    setLoading(true); setError(null);
    try { const res = await fetch("/api/orders"); const data = await res.json(); if (!res.ok) throw new Error(data.error || "Failed to load orders"); setOrders(Array.isArray(data) ? data : []); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  return { orders, loading, error, refetch: fetchOrders };
}
export const ORDER_STATUS = {
  PENDING: { label: "Pending", color: "#d97706", bg: "#fef3c7", step: 0 }, CONFIRMED: { label: "Confirmed", color: "#0db8d4", bg: "#e6f9fc", step: 1 },
  SHIPPED: { label: "Shipped", color: "#7c3aed", bg: "#ede9fe", step: 2 }, DELIVERED: { label: "Delivered", color: "#059669", bg: "#d1fae5", step: 3 },
  CANCELLED: { label: "Cancelled", color: "#dc2626", bg: "#fee2e2", step: -1 },
} as const;
