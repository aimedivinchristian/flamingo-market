"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { formatPrice, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronRight, MapPin, Phone, Loader2, AlertCircle, ShoppingBag, Copy, BadgeCheck, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
const ORDER_STATUS: Record<OrderStatus, { label: string; color: string; bg: string }> = { PENDING: { label: "Pending", color: "#d97706", bg: "#fef3c7" }, CONFIRMED: { label: "Confirmed", color: "#0db8d4", bg: "#e6f9fc" }, SHIPPED: { label: "Shipped", color: "#7c3aed", bg: "#ede9fe" }, DELIVERED: { label: "Delivered", color: "#059669", bg: "#d1fae5" }, CANCELLED: { label: "Cancelled", color: "#dc2626", bg: "#fee2e2" } };
interface StatusEvent { id: string; status: OrderStatus; note: string | null; createdAt: string; }
interface OrderDetail { id: string; total: number; status: OrderStatus; address: string; phone: string; notes: string | null; createdAt: string; updatedAt: string; buyer: { id: string; name: string; email: string; image: string | null }; items: { id: string; quantity: number; price: number; product: { id: string; name: string; images: string[]; store: { id: string; name: string } | null } }[]; statusHistory: StatusEvent[]; }
const STEPS: { key: OrderStatus; label: string; icon: any; desc: string }[] = [{ key: "PENDING", label: "Order Placed", icon: Clock, desc: "Your order has been received." }, { key: "CONFIRMED", label: "Confirmed", icon: BadgeCheck, desc: "Seller confirmed your order." }, { key: "SHIPPED", label: "On the Way", icon: Truck, desc: "Your order has been shipped." }, { key: "DELIVERED", label: "Delivered", icon: CheckCircle, desc: "Order delivered successfully." }];
export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [order, setOrder] = useState<OrderDetail | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [cancelling, setCancelling] = useState(false);
  useEffect(() => {
    async function load() { setLoading(true); try { const res = await fetch(`/api/orders/${id}`); const data = await res.json(); if (!res.ok) throw new Error(data.error || "Order not found"); setOrder(data); } catch (e: any) { setError(e.message); } finally { setLoading(false); } }
    load();
  }, [id]);
  async function cancelOrder() {
    if (!confirm("Cancel this order?")) return;
    setCancelling(true);
    try { const res = await fetch(`/api/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "CANCELLED" }) }); const data = await res.json(); if (!res.ok) { toast.error(data.error); return; } setOrder(o => o ? { ...o, status: "CANCELLED" } : o); toast.success("Order cancelled"); } finally { setCancelling(false); }
  }
  function copyId() { navigator.clipboard.writeText(id); toast.success("Order ID copied"); }
  if (loading) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-7 h-7 text-pink animate-spin" /></div></div>;
  if (error || !order) return <div className="min-h-screen bg-gray-50"><Navbar /><div className="flex items-center justify-center min-h-[60vh]"><div className="text-center"><div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertCircle className="w-6 h-6 text-red-400" /></div><h2 className="text-[17px] font-extrabold text-gray-700 mb-2">Order not found</h2><Link href="/buyer" className="text-[13px] font-bold text-pink hover:underline">← My Orders</Link></div></div></div>;
  const s = ORDER_STATUS[order.status]; const isCancelled = order.status === "CANCELLED"; const currentStep = STEPS.findIndex(st => st.key === order.status); const shortId = order.id.slice(-8).toUpperCase(); const isBuyer = session?.user?.id === order.buyer.id;
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[860px] mx-auto px-5 py-8">
        <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mb-6"><Link href="/buyer" className="hover:text-pink transition-colors font-medium">My Orders</Link><ChevronRight className="w-3 h-3" /><span className="text-gray-600 font-semibold">Order #{shortId}</span></div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-start justify-between gap-4 flex-wrap">
          <div><div className="flex items-center gap-2.5 mb-1.5 flex-wrap"><span className="font-extrabold text-[18px] text-gray-800">Order #{shortId}</span><button onClick={copyId} className="text-gray-300 hover:text-pink transition-colors"><Copy className="w-3.5 h-3.5" /></button><span className="text-[12px] font-bold px-3 py-1 rounded-full" style={{ color: s.color, background: s.bg }}>{s.label}</span></div><div className="text-[12.5px] text-gray-400">Placed on {formatDate(order.createdAt)} · {order.items.length} item{order.items.length !== 1 ? "s" : ""}</div></div>
          <div className="text-right shrink-0"><div className="text-[22px] font-extrabold text-pink">{formatPrice(order.total)}</div>{isBuyer && order.status === "PENDING" && <button onClick={cancelOrder} disabled={cancelling} className="text-[12px] font-semibold text-red-400 hover:underline mt-1 flex items-center gap-1 ml-auto">{cancelling ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}Cancel Order</button>}</div>
        </div>
        {!isCancelled && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <h3 className="font-extrabold text-[14px] text-gray-800 mb-5">Order Progress</h3>
            <div className="relative">
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100 z-0" />
              <div className="absolute top-5 left-5 h-0.5 bg-gradient-pink z-0 transition-all duration-700" style={{ width: `${currentStep < 0 ? 0 : (currentStep / (STEPS.length - 1)) * 100}%` }} />
              <div className="relative z-10 flex justify-between">{STEPS.map((step, idx) => { const done = idx <= currentStep; const current = idx === currentStep; const Icon = step.icon; return (<div key={step.key} className="flex flex-col items-center gap-2 flex-1"><div className={cn("w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all", done ? "bg-gradient-pink border-pink shadow-pink" : "bg-white border-gray-200")}><Icon className={cn("w-4 h-4", done ? "text-white" : "text-gray-300")} /></div><div className="text-center"><div className={cn("text-[11.5px] font-bold", current ? "text-pink" : done ? "text-gray-700" : "text-gray-400")}>{step.label}</div>{current && <div className="text-[10.5px] text-gray-400 mt-0.5 max-w-[80px] leading-tight">{step.desc}</div>}</div></div>); })}</div>
            </div>
          </div>
        )}
        {isCancelled && <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-4 flex items-center gap-3"><XCircle className="w-5 h-5 text-red-400 shrink-0" /><div><div className="font-bold text-[13.5px] text-red-700">Order Cancelled</div><div className="text-[12.5px] text-red-500 mt-0.5">Stock has been restored. Any payment will be refunded within 3–5 business days.</div></div></div>}
        {order.statusHistory.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <h3 className="font-extrabold text-[14px] text-gray-800 mb-5 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-pink" />Order Timeline</h3>
            <div className="space-y-0">{order.statusHistory.map((event, idx) => { const es = ORDER_STATUS[event.status]; const isLast = idx === order.statusHistory.length - 1; return (<div key={event.id} className="flex gap-3"><div className="flex flex-col items-center shrink-0"><div className="w-2.5 h-2.5 rounded-full mt-1.5" style={{ background: es.color }} />{!isLast && <div className="w-px flex-1 bg-gray-100 my-1" style={{ minHeight: "28px" }} />}</div><div className={cn("pb-4", isLast && "pb-0")}><div className="flex items-center gap-2 mb-0.5"><span className="text-[12.5px] font-bold" style={{ color: es.color }}>{es.label}</span><span className="text-[11px] text-gray-300">{new Date(event.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span></div>{event.note && <div className="text-[12px] text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mt-1 inline-block">{event.note}</div>}</div></div>); })}</div>
          </div>
        )}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="px-5 py-4 border-b border-gray-50 font-extrabold text-[14px] text-gray-800">Items Ordered</div>
              {order.items.map(item => (<div key={item.id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"><div className="w-16 h-16 rounded-xl overflow-hidden bg-pink-pale border border-pink-pale2 shrink-0 flex items-center justify-center">{item.product.images?.[0] ? <Image src={item.product.images[0]} alt={item.product.name} width={64} height={64} className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-pink" />}</div><div className="flex-1 min-w-0"><Link href={`/product/${item.product.id}`} className="text-[13.5px] font-bold text-gray-800 hover:text-pink transition-colors line-clamp-2 leading-snug block">{item.product.name}</Link>{item.product.store && <Link href={`/store/${item.product.store.id}`} className="text-[11.5px] text-gray-400 hover:text-pink transition-colors mt-0.5 block">{item.product.store.name}</Link>}<div className="text-[12px] text-gray-400 mt-1">Qty: {item.quantity}</div></div><div className="text-right shrink-0"><div className="font-extrabold text-[14px] text-pink">{formatPrice(item.price * item.quantity)}</div><div className="text-[11px] text-gray-400 mt-0.5">{formatPrice(item.price)} each</div></div></div>))}
              <div className="px-5 py-4 bg-gray-50 space-y-2"><div className="flex justify-between text-[13px] text-gray-500"><span>Subtotal</span><span>{formatPrice(order.total)}</span></div><div className="flex justify-between text-[13px] text-gray-500"><span>Shipping</span><span className="text-green-600 font-semibold">{order.total >= 30000 ? "Free" : formatPrice(2000)}</span></div><div className="flex justify-between text-[15px] font-extrabold text-gray-800 border-t border-gray-200 pt-2"><span>Total</span><span className="text-pink">{formatPrice(order.total)}</span></div></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"><h3 className="font-extrabold text-[13.5px] text-gray-800 mb-4">Delivery Details</h3><div className="space-y-3"><div className="flex items-start gap-2.5"><MapPin className="w-4 h-4 text-pink shrink-0 mt-0.5" /><div><div className="text-[11px] text-gray-400 font-semibold mb-0.5">Address</div><div className="text-[12.5px] text-gray-700 font-medium">{order.address}</div></div></div><div className="flex items-start gap-2.5"><Phone className="w-4 h-4 text-pink shrink-0 mt-0.5" /><div><div className="text-[11px] text-gray-400 font-semibold mb-0.5">Phone</div><div className="text-[12.5px] text-gray-700 font-medium">{order.phone}</div></div></div>{order.notes && <div className="bg-amber-50 border border-amber-100 rounded-xl p-3"><div className="text-[11px] text-amber-600 font-bold mb-0.5">Note</div><div className="text-[12px] text-amber-700">{order.notes}</div></div>}</div></div>
            {!isBuyer && <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"><h3 className="font-extrabold text-[13.5px] text-gray-800 mb-3">Customer</h3><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gradient-pink flex items-center justify-center text-white font-extrabold shrink-0">{order.buyer.name[0]}</div><div><div className="text-[13px] font-bold text-gray-800">{order.buyer.name}</div><div className="text-[11.5px] text-gray-400">{order.buyer.email}</div></div></div></div>}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-2.5"><Link href="/marketplace" className="w-full flex items-center justify-center gap-2 text-[13px] font-bold text-white bg-gradient-pink py-2.5 rounded-full shadow-pink hover:opacity-90 transition-all"><ShoppingBag className="w-4 h-4" /> Continue Shopping</Link><Link href="/buyer" className="w-full flex items-center justify-center gap-2 text-[13px] font-semibold text-gray-600 border border-gray-200 py-2.5 rounded-full hover:border-pink hover:text-pink transition-all">← All My Orders</Link></div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
