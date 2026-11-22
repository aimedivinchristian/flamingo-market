"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { formatPrice, formatDate } from "@/lib/utils";
import { useOrders, ORDER_STATUS } from "@/lib/hooks/useOrders";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, Package, ShoppingBag, TrendingUp, Loader2, RefreshCw, Store, Search, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
type StatusKey = keyof typeof ORDER_STATUS;
function StatCard({ label, value, icon: Icon, iconBg, iconColor }: { label: string; value: string | number; icon: any; iconBg: string; iconColor: string }) {
  return (<div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"><div className="flex items-start justify-between mb-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg }}><Icon className="w-5 h-5" style={{ color: iconColor }} /></div></div><div className="text-[1.4rem] font-extrabold text-gray-800 mb-0.5 tracking-tight">{value}</div><div className="text-[11.5px] text-gray-400 font-medium">{label}</div></div>);
}
const TABS = ["Overview","Orders","Sellers","Products","Categories","Promo Codes","Withdrawals"] as const;
type Tab = typeof TABS[number];
export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Overview"); const [search, setSearch] = useState(""); const [statusF, setStatusF] = useState<"ALL" | StatusKey>("ALL"); const [updating, setUpdating] = useState<string | null>(null);
  const { orders, loading, error, refetch } = useOrders();
  const [sellers, setSellers] = useState<any[]>([]); const [selLoad, setSelLoad] = useState(false);
  useEffect(() => { if (status === "loading") return; if (!session || session.user.role !== "ADMIN") router.push("/login"); }, [session, status, router]);
  useEffect(() => { if (tab === "Sellers") { setSelLoad(true); fetch("/api/stores").then(r => r.json()).then(data => setSellers(Array.isArray(data) ? data : [])).catch(() => {}).finally(() => setSelLoad(false)); } }, [tab]);
  if (!session || session.user.role !== "ADMIN") return null;
  const totalRevenue = orders.filter(o => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === "PENDING").length;
  const uniqueBuyers = new Set(orders.map(o => o.buyer.id)).size;
  const monthly = orders.reduce((acc: Record<string,number>, o) => { if (o.status === "CANCELLED") return acc; const month = new Date(o.createdAt).toLocaleDateString("en-GB",{ month:"short", year:"2-digit" }); acc[month] = (acc[month] || 0) + o.total; return acc; }, {});
  const chartData = Object.entries(monthly).map(([month, revenue]) => ({ month, revenue })).slice(-8);
  const filteredOrders = orders.filter(o => { const matchStatus = statusF === "ALL" || o.status === statusF; const matchSearch = !search || o.buyer.name.toLowerCase().includes(search.toLowerCase()) || o.id.slice(-8).toUpperCase().includes(search.toUpperCase()); return matchStatus && matchSearch; });
  async function updateStatus(orderId: string, newStatus: StatusKey) {
    setUpdating(orderId);
    try { const res = await fetch(`/api/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) }); if (res.ok) refetch(); } finally { setUpdating(null); }
  }
  const Tip = ({ active, payload, label }: any) => active && payload?.length ? (<div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm shadow-card"><div className="text-gray-400 text-[11px] mb-0.5">{label}</div><div className="font-extrabold text-pink">{formatPrice(payload[0].value)}</div></div>) : null;
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[1280px] mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-[1.6rem] font-extrabold text-gray-800 tracking-tight">Admin Dashboard</h1><p className="text-gray-400 text-sm mt-0.5">Welcome, {session.user.name} · {pendingOrders > 0 && <span className="text-amber-500 font-semibold">{pendingOrders} pending orders</span>}</p></div>
          <button onClick={refetch} className="flex items-center gap-2 text-[13px] font-semibold text-gray-500 border border-gray-200 px-4 py-2 rounded-full hover:border-pink hover:text-pink transition-all"><RefreshCw className="w-3.5 h-3.5" /> Refresh</button>
        </div>
        <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl p-1 mb-7 w-fit shadow-[0_2px_8px_rgba(0,0,0,0.04)]">{TABS.map(t => <button key={t} onClick={() => setTab(t)} className={cn("px-5 py-2 rounded-xl text-[13px] font-bold transition-all capitalize", tab === t ? "bg-gradient-pink text-white shadow-pink" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50")}>{t}</button>)}</div>
        {tab === "Overview" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Revenue" value={formatPrice(totalRevenue)} icon={TrendingUp} iconBg="#fff0f7" iconColor="#e8267a" />
              <StatCard label="Total Orders" value={orders.length} icon={ShoppingBag} iconBg="#e6f9fc" iconColor="#0db8d4" />
              <StatCard label="Active Buyers" value={uniqueBuyers} icon={Users} iconBg="#fef3c7" iconColor="#d97706" />
              <StatCard label="Pending Orders" value={pendingOrders} icon={Package} iconBg="#f0fdf4" iconColor="#059669" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-5"><div><div className="text-[16px] font-extrabold text-gray-800">Revenue Overview</div><div className="text-[12px] text-gray-400 mt-0.5">Real orders from database</div></div><div className="text-right"><div className="text-[18px] font-extrabold text-pink">{formatPrice(totalRevenue)}</div><div className="text-[11px] text-gray-400">total revenue</div></div></div>
              {chartData.length === 0 ? <div className="flex items-center justify-center h-[220px] text-gray-300 text-[13px]">No order data yet. Revenue chart will appear here once orders come in.</div> : (
                <ResponsiveContainer width="100%" height={220}><AreaChart data={chartData}><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#e8267a" stopOpacity={0.15}/><stop offset="95%" stopColor="#e8267a" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="month" tick={{fill:"#aaa",fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:"#aaa",fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/><Tooltip content={<Tip/>}/><Area type="monotone" dataKey="revenue" stroke="#e8267a" strokeWidth={2.5} fill="url(#g1)"/></AreaChart></ResponsiveContainer>
              )}
            </div>
          </div>
        )}
        {tab === "Orders" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search buyer or ID…" className="pl-9 pr-8 py-2 border-[1.5px] border-gray-200 rounded-full text-[12.5px] bg-white outline-none focus:border-pink transition-all w-52 placeholder:text-gray-400" />{search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-pink"><X className="w-3 h-3"/></button>}</div>
              <div className="flex gap-1.5 flex-wrap">{(["ALL","PENDING","CONFIRMED","SHIPPED","DELIVERED","CANCELLED"] as const).map(s => <button key={s} onClick={() => setStatusF(s)} className={cn("px-3 py-1.5 rounded-full text-[12px] font-semibold border-[1.5px] transition-all", statusF === s ? "border-pink bg-pink-pale text-pink" : "border-gray-200 text-gray-500 bg-white hover:border-pink hover:text-pink")}>{s === "ALL" ? "All" : ORDER_STATUS[s]?.label ?? s}</button>)}</div>
              <span className="ml-auto text-[12px] text-gray-400">{filteredOrders.length} orders</span>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-pink animate-spin"/></div> : filteredOrders.length === 0 ? (<div className="text-center py-16"><Package className="w-10 h-10 text-gray-200 mx-auto mb-3" strokeWidth={1}/><div className="font-bold text-gray-500">{orders.length === 0 ? "No orders yet" : "No orders match filters"}</div></div>) : (
                <div className="overflow-x-auto"><table className="w-full">
                  <thead><tr className="border-b border-gray-50">{["Order","Buyer","Items","Total","Status","Date","Action"].map(h => <th key={h} className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>)}</tr></thead>
                  <tbody>
                    {filteredOrders.map(order => { const s = ORDER_STATUS[order.status]; const shortId = order.id.slice(-8).toUpperCase(); return (
                      <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4"><Link href={`/order/${order.id}`} className="font-mono text-[13px] font-bold text-pink hover:underline">#{shortId}</Link></td>
                        <td className="px-5 py-4"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-full bg-gradient-pink flex items-center justify-center text-white text-xs font-black shrink-0">{order.buyer.name[0]}</div><div><div className="text-[13px] font-bold text-gray-800">{order.buyer.name}</div><div className="text-[11px] text-gray-400 truncate max-w-[120px]">{order.buyer.email}</div></div></div></td>
                        <td className="px-5 py-4 text-[13px] text-gray-500">{order.items.length} item(s)</td>
                        <td className="px-5 py-4 font-extrabold text-[13px] text-pink">{formatPrice(order.total)}</td>
                        <td className="px-5 py-4"><span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{color:s.color, background:s.bg}}>{s.label}</span></td>
                        <td className="px-5 py-4 text-[12px] text-gray-400">{formatDate(order.createdAt)}</td>
                        <td className="px-5 py-4"><div className="flex items-center gap-2">{updating === order.id ? <Loader2 className="w-4 h-4 text-pink animate-spin"/> : (<select value={order.status} onChange={e => updateStatus(order.id, e.target.value as StatusKey)} className="text-[11.5px] font-semibold border border-gray-200 rounded-lg px-2 py-1.5 bg-white outline-none cursor-pointer hover:border-pink transition-colors">{(["PENDING","CONFIRMED","SHIPPED","DELIVERED","CANCELLED"] as StatusKey[]).map(st => <option key={st} value={st}>{ORDER_STATUS[st].label}</option>)}</select>)}<Link href={`/order/${order.id}`} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:border-pink hover:text-pink transition-all"><ChevronRight className="w-4 h-4"/></Link></div></td>
                      </tr>
                    ); })}
                  </tbody>
                </table></div>
              )}
            </div>
          </div>
        )}
        {tab === "Sellers" && (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"><div className="text-[15px] font-extrabold text-gray-800">Seller Management</div><span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">{sellers.filter((s:any) => !s.isVerified).length} Pending</span></div>
            {selLoad ? <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-pink animate-spin"/></div> : sellers.length === 0 ? (<div className="text-center py-16"><Store className="w-10 h-10 text-gray-200 mx-auto mb-3" strokeWidth={1}/><div className="font-bold text-gray-500">No stores yet</div></div>) : (
              <div className="overflow-x-auto"><table className="w-full">
                <thead><tr className="border-b border-gray-50">{["Store","Seller","Products","Status","Actions"].map(h => <th key={h} className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-6 py-3">{h}</th>)}</tr></thead>
                <tbody>
                  {sellers.map((store: any) => (
                    <tr key={store.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-gradient-pink flex items-center justify-center text-white font-extrabold text-sm shadow-pink">{store.name[0]}</div><Link href={`/store/${store.id}`} className="text-[13px] font-bold text-gray-800 hover:text-pink transition-colors">{store.name}</Link></div></td>
                      <td className="px-6 py-4"><div className="text-[13px] text-gray-600">{store.seller?.name}</div><div className="text-[11px] text-gray-400">{store.seller?.email}</div></td>
                      <td className="px-6 py-4 text-[13px] text-gray-500">{store._count?.products ?? 0}</td>
                      <td className="px-6 py-4"><span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full", store.isVerified ? "text-green-600 bg-green-50" : "text-amber-600 bg-amber-50")}>{store.isVerified ? "Verified" : "Pending"}</span></td>
                      <td className="px-6 py-4"><div className="flex gap-2">{!store.isVerified && <button onClick={async () => { await fetch(`/api/stores/${store.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ isVerified: true }) }); setSellers(prev => prev.map((s:any) => s.id === store.id ? {...s, isVerified:true} : s)); }} className="text-[12px] font-bold text-white bg-cyan px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity">Approve</button>}<Link href={`/store/${store.id}`} className="text-[12px] font-semibold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-pink hover:text-pink transition-colors">View Store</Link></div></td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            )}
          </div>
        )}
        {tab === "Products" && (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="w-14 h-14 bg-pink-pale rounded-2xl flex items-center justify-center mx-auto mb-4"><Package className="w-6 h-6 text-pink" /></div>
            <h3 className="text-[17px] font-extrabold text-gray-800 mb-2">Product Moderation</h3>
            <p className="text-gray-400 text-[13px] mb-5 max-w-sm mx-auto">Search, filter, activate, deactivate, feature, and delete products across all sellers.</p>
            <Link href="/admin/products" className="inline-flex items-center gap-2 bg-gradient-pink text-white font-bold text-[13.5px] px-6 py-3 rounded-full shadow-pink hover:opacity-90 transition-all"><Package className="w-4 h-4" /> Open Product Moderation</Link>
          </div>
        )}
        {tab === "Categories" && (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="w-14 h-14 bg-pink-pale rounded-2xl flex items-center justify-center mx-auto mb-4"><Package className="w-6 h-6 text-pink" /></div>
            <h3 className="text-[17px] font-extrabold text-gray-800 mb-2">Category Management</h3>
            <p className="text-gray-400 text-[13px] mb-5 max-w-sm mx-auto">Create, edit and delete product categories.</p>
            <Link href="/admin/categories" className="inline-flex items-center gap-2 bg-gradient-pink text-white font-bold text-[13.5px] px-6 py-3 rounded-full shadow-pink hover:opacity-90 transition-all"><Package className="w-4 h-4" /> Manage Categories</Link>
          </div>
        )}
        {tab === "Withdrawals" && (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <p className="text-gray-400 text-[13.5px] mb-5">Review and pay seller withdrawal requests.</p>
            <Link href="/admin/withdrawals" className="inline-flex items-center gap-2 bg-gradient-pink text-white font-bold text-[13.5px] px-6 py-3 rounded-full shadow-pink hover:opacity-90 transition-all">Manage Withdrawals</Link>
          </div>
        )}
        {tab === "Promo Codes" && (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            <div className="w-14 h-14 bg-pink-pale rounded-2xl flex items-center justify-center mx-auto mb-4"><Package className="w-6 h-6 text-pink" /></div>
            <h3 className="text-[17px] font-extrabold text-gray-800 mb-2">Promo Code Management</h3>
            <p className="text-gray-400 text-[13px] mb-5 max-w-sm mx-auto">Create percentage or flat discount codes.</p>
            <Link href="/admin/promo" className="inline-flex items-center gap-2 bg-gradient-pink text-white font-bold text-[13.5px] px-6 py-3 rounded-full shadow-pink hover:opacity-90 transition-all"><Package className="w-4 h-4" /> Manage Promo Codes</Link>
          </div>
        )}
      </div>
    </div>
  );
}
