"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { formatPrice, formatDate } from "@/lib/utils";
import { useOrders, ORDER_STATUS } from "@/lib/hooks/useOrders";
import toast from "react-hot-toast";
import { Package, Loader2, RefreshCw, ChevronRight, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
type StatusKey = keyof typeof ORDER_STATUS;
const ALL_STATUSES = ["ALL","PENDING","CONFIRMED","SHIPPED","DELIVERED","CANCELLED"] as const;
export default function SellerOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { orders, loading, error, refetch } = useOrders();
  const [search, setSearch] = useState(""); const [statusF, setStatusF] = useState<typeof ALL_STATUSES[number]>("ALL"); const [updating, setUpdating] = useState<string | null>(null);
  useEffect(() => { if (status === "loading") return; if (!session || !["SELLER","ADMIN"].includes(session.user.role)) router.push("/login"); }, [session, status, router]);
  if (!session) return null;
  const myOrders = orders.filter(o => o.items.some(i => i.product.sellerId === session.user.id));
  const filtered = myOrders.filter(o => { const matchStatus = statusF === "ALL" || o.status === statusF; const matchSearch = !search || o.buyer.name.toLowerCase().includes(search.toLowerCase()) || o.id.slice(-8).toUpperCase().includes(search.toUpperCase()); return matchStatus && matchSearch; });
  const revenue = myOrders.filter(o => o.status !== "CANCELLED").reduce((s, o) => s + o.items.filter(i => i.product.sellerId === session.user.id).reduce((ss, i) => ss + i.price * i.quantity, 0), 0);
  async function updateStatus(orderId: string, newStatus: StatusKey) {
    setUpdating(orderId);
    try { const res = await fetch(`/api/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) }); const data = await res.json(); if (!res.ok) { toast.error(data.error); return; } toast.success(`Order marked as ${newStatus.toLowerCase()}`); refetch(); } finally { setUpdating(null); }
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[1280px] mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6"><div><h1 className="text-[1.6rem] font-extrabold text-gray-800 tracking-tight">My Orders</h1><p className="text-gray-400 text-sm mt-0.5">Orders containing your products</p></div><button onClick={refetch} className="flex items-center gap-2 text-[13px] font-semibold text-gray-500 border border-gray-200 px-4 py-2 rounded-full hover:border-pink hover:text-pink transition-all"><RefreshCw className="w-3.5 h-3.5" /> Refresh</button></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">{[{ label: "Total Orders", value: myOrders.length, color: "text-gray-800" }, { label: "Pending", value: myOrders.filter(o => o.status === "PENDING").length, color: "text-amber-500" }, { label: "Delivered", value: myOrders.filter(o => o.status === "DELIVERED").length, color: "text-green-600" }, { label: "Revenue", value: formatPrice(revenue), color: "text-pink" }].map(s => (<div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]"><div className={`text-[1.3rem] font-extrabold ${s.color} mb-0.5`}>{s.value}</div><div className="text-[11.5px] text-gray-400 font-medium">{s.label}</div></div>))}</div>
        <div className="flex items-center gap-3 flex-wrap mb-5">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search buyer or order ID…" className="pl-9 pr-8 py-2 border-[1.5px] border-gray-200 rounded-full text-[12.5px] bg-white outline-none focus:border-pink transition-all w-52 placeholder:text-gray-400" />{search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-pink"><X className="w-3 h-3" /></button>}</div>
          <div className="flex gap-1.5 flex-wrap">{ALL_STATUSES.map(s => <button key={s} onClick={() => setStatusF(s)} className={cn("px-3 py-1.5 rounded-full text-[12px] font-semibold border-[1.5px] transition-all", statusF === s ? "border-pink bg-pink-pale text-pink" : "border-gray-200 text-gray-500 bg-white hover:border-pink hover:text-pink")}>{s === "ALL" ? "All" : ORDER_STATUS[s as StatusKey]?.label ?? s}</button>)}</div>
          <span className="ml-auto text-[12px] text-gray-400">{filtered.length} orders</span>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-pink animate-spin" /></div> : error ? (<div className="text-center py-16"><p className="text-[13px] text-gray-400 mb-3">{error}</p><button onClick={refetch} className="text-pink font-bold text-[13px] hover:underline flex items-center gap-1.5 mx-auto"><RefreshCw className="w-3.5 h-3.5" /> Try again</button></div>) : filtered.length === 0 ? (<div className="text-center py-16"><Package className="w-10 h-10 text-gray-200 mx-auto mb-3" strokeWidth={1} /><div className="font-bold text-gray-500 mb-1">{myOrders.length === 0 ? "No orders yet" : "No orders match filters"}</div><p className="text-[12.5px] text-gray-400">{myOrders.length === 0 ? "Orders for your products appear here." : "Try a different filter."}</p></div>) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-gray-50">{["Order","Buyer","Items","Amount","Status","Date","Action"].map(h => <th key={h} className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.map(order => { const s = ORDER_STATUS[order.status]; const shortId = order.id.slice(-8).toUpperCase(); const myItems = order.items.filter(i => i.product.sellerId === session.user.id); const myTotal = myItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
                    return (
                      <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4"><Link href={`/order/${order.id}`} className="font-mono text-[13px] font-bold text-pink hover:underline">#{shortId}</Link></td>
                        <td className="px-5 py-4"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full bg-gradient-pink flex items-center justify-center text-white text-xs font-black shrink-0">{order.buyer.name[0]}</div><div><div className="text-[13px] font-bold text-gray-800">{order.buyer.name}</div><div className="text-[11px] text-gray-400 truncate max-w-[120px]">{order.buyer.email}</div></div></div></td>
                        <td className="px-5 py-4"><div className="space-y-1">{myItems.slice(0,2).map(i => <div key={i.id} className="text-[12px] text-gray-600 truncate max-w-[160px]">{i.product.name} <span className="text-gray-400">×{i.quantity}</span></div>)}{myItems.length > 2 && <div className="text-[11px] text-gray-400">+{myItems.length - 2} more</div>}</div></td>
                        <td className="px-5 py-4 font-extrabold text-[13px] text-pink">{formatPrice(myTotal)}</td>
                        <td className="px-5 py-4"><span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ color: s.color, background: s.bg }}>{s.label}</span></td>
                        <td className="px-5 py-4 text-[12px] text-gray-400">{formatDate(order.createdAt)}</td>
                        <td className="px-5 py-4"><div className="flex items-center gap-2">{updating === order.id ? <Loader2 className="w-4 h-4 text-pink animate-spin" /> : (<select value={order.status} onChange={e => updateStatus(order.id, e.target.value as StatusKey)} className="text-[11.5px] font-semibold border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none cursor-pointer hover:border-pink transition-colors">{(["PENDING","CONFIRMED","SHIPPED","DELIVERED"] as StatusKey[]).map(st => <option key={st} value={st}>{ORDER_STATUS[st].label}</option>)}</select>)}<Link href={`/order/${order.id}`} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:border-pink hover:text-pink transition-all"><ChevronRight className="w-4 h-4" /></Link></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
