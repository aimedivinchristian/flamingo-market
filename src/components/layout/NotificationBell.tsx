"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Bell, Package, X, ChevronRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
interface Order { id: string; total: number; createdAt: string; buyer: { name: string }; items: { quantity: number; price: number }[]; }
export function NotificationBell() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false); const [count, setCount] = useState(0); const [orders, setOrders] = useState<Order[]>([]); const [pulse, setPulse] = useState(false);
  const prevCount = useRef(0); const panelRef = useRef<HTMLDivElement>(null);
  const fetchNotifications = useCallback(async () => {
    try { const res = await fetch("/api/notifications"); if (!res.ok) return; const data = await res.json(); if (data.pendingOrders > prevCount.current && prevCount.current !== 0) { setPulse(true); setTimeout(() => setPulse(false), 2000); } prevCount.current = data.pendingOrders; setCount(data.pendingOrders); setOrders(data.recentOrders); } catch {}
  }, []);
  useEffect(() => { if (!session || session.user.role !== "ADMIN") return; fetchNotifications(); const interval = setInterval(fetchNotifications, 30_000); return () => clearInterval(interval); }, [fetchNotifications, session]);
  useEffect(() => { function handler(e: MouseEvent) { if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false); } document.addEventListener("mousedown", handler); return () => document.removeEventListener("mousedown", handler); }, []);
  if (!session || session.user.role !== "ADMIN") return null;
  function timeAgo(dateStr: string) { const diff = Date.now() - new Date(dateStr).getTime(); const mins = Math.floor(diff / 60_000); if (mins < 1) return "just now"; if (mins < 60) return `${mins}m ago`; const hrs = Math.floor(mins / 60); if (hrs < 24) return `${hrs}h ago`; return `${Math.floor(hrs / 24)}d ago`; }
  return (
    <div className="relative" ref={panelRef}>
      <button onClick={() => setOpen(o => !o)} className="relative w-9 h-9 rounded-xl border-[1.5px] border-gray-200 flex items-center justify-center text-gray-500 hover:border-pink hover:text-pink transition-all">
        <Bell className={`w-4 h-4 ${pulse ? "animate-bounce" : ""}`} />
        {count > 0 && <span className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-pink text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white ${pulse ? "animate-ping" : ""}`}>{count > 9 ? "9+" : count}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100"><div><div className="text-[13px] font-extrabold text-gray-800">Notifications</div>{count > 0 && <div className="text-[11px] text-pink font-semibold mt-0.5">{count} pending order{count !== 1 ? "s" : ""}</div>}</div><button onClick={() => setOpen(false)} className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-pink hover:bg-pink-pale transition-all"><X className="w-3.5 h-3.5" /></button></div>
          <div className="max-h-[340px] overflow-y-auto">
            {orders.length === 0 ? <div className="py-10 text-center"><div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3"><Bell className="w-5 h-5 text-gray-300" /></div><div className="text-[12.5px] font-semibold text-gray-400">No pending orders</div></div> : orders.map(order => (
              <div key={order.id} className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-pink-pale transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-xl bg-pink-pale border border-pink-pale2 flex items-center justify-center shrink-0 mt-0.5"><Package className="w-3.5 h-3.5 text-pink" /></div>
                <div className="flex-1 min-w-0"><div className="text-[12.5px] font-bold text-gray-800 truncate">New order from {order.buyer.name}</div><div className="text-[11px] text-gray-400 mt-0.5">{order.items.reduce((s, i) => s + i.quantity, 0)} item(s) · <span className="text-pink font-semibold">{formatPrice(order.total)}</span></div><div className="text-[10.5px] text-gray-300 mt-0.5">{timeAgo(order.createdAt)}</div></div>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full shrink-0 mt-1">PENDING</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-gray-100"><Link href="/admin" onClick={() => setOpen(false)} className="flex items-center justify-center gap-1.5 text-[12.5px] font-bold text-pink hover:underline">View all in Admin Dashboard <ChevronRight className="w-3.5 h-3.5" /></Link></div>
        </div>
      )}
    </div>
  );
}
