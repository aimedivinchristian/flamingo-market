"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { formatPrice, formatDate } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, Clock, CheckCircle, Loader2, RefreshCw, Send, Smartphone, Building2, ArrowUpRight, ArrowDownRight, Package, Info } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
interface EarningsData { totalRevenue: number; netRevenue: number; pendingRevenue: number; thisMonth: number; lastMonth: number; availableBalance: number; withdrawn: number; commission: number; totalOrders: number; totalUnits: number; dailyChart: { date: string; revenue: number }[]; topProducts: { id: string; name: string; image: string; category: string; revenue: number; units: number }[]; withdrawals: { id: string; amount: number; method: string; accountNo: string; accountName: string; status: string; createdAt: string }[]; }
const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = { PENDING: { label: "Pending", color: "#d97706", bg: "#fef3c7" }, APPROVED: { label: "Approved", color: "#0db8d4", bg: "#e6f9fc" }, PAID: { label: "Paid", color: "#059669", bg: "#d1fae5" }, REJECTED: { label: "Rejected", color: "#dc2626", bg: "#fee2e2" } };
function StatCard({ icon: Icon, label, value, sub, subUp, iconBg, iconColor }: { icon: any; label: string; value: string; sub?: string; subUp?: boolean; iconBg: string; iconColor: string }) {
  return (<div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"><div className="flex items-start justify-between mb-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: iconBg }}><Icon className="w-5 h-5" style={{ color: iconColor }} /></div>{sub && <div className={cn("flex items-center gap-0.5 text-[11.5px] font-bold", subUp ? "text-green-600" : "text-red-400")}>{subUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}{sub}</div>}</div><div className="text-[1.4rem] font-extrabold text-gray-800 tracking-tight mb-0.5">{value}</div><div className="text-[11.5px] text-gray-400 font-medium">{label}</div></div>);
}
function WithdrawForm({ available, onSubmitted }: { available: number; onSubmitted: () => void }) {
  const [method, setMethod] = useState<"momo"|"bank">("momo"); const [amount, setAmount] = useState(""); const [accountNo, setAccountNo] = useState(""); const [accountName, setAccountName] = useState(""); const [note, setNote] = useState(""); const [submitting, setSubmitting] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt < 5000) { toast.error("Minimum withdrawal is RWF 5,000"); return; }
    if (amt > available) { toast.error(`Max available: ${formatPrice(available)}`); return; }
    if (!accountNo.trim()) { toast.error("Enter your account number"); return; }
    if (!accountName.trim()) { toast.error("Enter the account holder name"); return; }
    setSubmitting(true);
    try { const res = await fetch("/api/seller/withdraw", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: amt, method, accountNo, accountName, note }) }); const data = await res.json(); if (!res.ok) { toast.error(data.error); return; } toast.success("Withdrawal request submitted! We process within 24h."); setAmount(""); setAccountNo(""); setAccountName(""); setNote(""); onSubmitted(); } finally { setSubmitting(false); }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div><label className="block text-[12.5px] font-bold text-gray-600 mb-2">Payment Method</label><div className="grid grid-cols-2 gap-2">{([{ v: "momo", icon: Smartphone, label: "MTN Mobile Money", sub: "Instant" }, { v: "bank", icon: Building2, label: "Bank Transfer", sub: "1–2 days" }] as { v: "momo"|"bank"; icon: any; label: string; sub: string }[]).map(({ v, icon: Icon, label, sub }) => (<button key={v} type="button" onClick={() => setMethod(v)} className={cn("flex items-center gap-2.5 p-3.5 rounded-xl border-[1.5px] transition-all text-left", method === v ? "border-pink bg-pink-pale" : "border-gray-200 hover:border-gray-300")}><Icon className={cn("w-5 h-5 shrink-0", method === v ? "text-pink" : "text-gray-400")} /><div><div className={cn("text-[12.5px] font-bold", method === v ? "text-pink" : "text-gray-700")}>{label}</div><div className="text-[10.5px] text-gray-400">{sub}</div></div></button>))}</div></div>
      <div><div className="flex items-center justify-between mb-1.5"><label className="text-[12.5px] font-bold text-gray-600">Amount (RWF) *</label><button type="button" onClick={() => setAmount(String(Math.floor(available)))} className="text-[11px] font-bold text-pink hover:underline">Max: {formatPrice(available)}</button></div><input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 50000" min={5000} max={Math.floor(available)} className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all" /><div className="text-[11px] text-gray-400 mt-1">Minimum: RWF 5,000</div></div>
      <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">{method === "momo" ? "MoMo Phone Number *" : "Bank Account Number *"}</label><input value={accountNo} onChange={e => setAccountNo(e.target.value)} placeholder={method === "momo" ? "078 000 0000" : "1234 5678 9012"} className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all" /></div>
      <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">{method === "momo" ? "MoMo Account Name *" : "Account Holder Name *"}</label><input value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Full name on account" className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all" /></div>
      <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Note <span className="text-gray-400 font-normal">(optional)</span></label><input value={note} onChange={e => setNote(e.target.value)} placeholder="Any additional info…" className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all" /></div>
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3.5"><Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /><p className="text-[12px] text-amber-700 leading-relaxed">Flamingo Market deducts a <strong>10% platform commission</strong>. Withdrawals process within <strong>24 hours</strong> on business days.</p></div>
      <button type="submit" disabled={submitting || available < 5000} className="w-full bg-gradient-pink text-white font-bold text-[14px] py-3 rounded-full shadow-pink hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50">{submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Send className="w-4 h-4" /> Request Withdrawal</>}</button>
    </form>
  );
}
export default function EarningsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<EarningsData | null>(null); const [loading, setLoading] = useState(true); const [tab, setTab] = useState<"overview"|"products"|"withdraw"|"history">("overview");
  useEffect(() => { if (status === "loading") return; if (!session || !["SELLER","ADMIN"].includes(session.user.role)) router.push("/login"); }, [session, status, router]);
  const fetchData = useCallback(async () => { setLoading(true); try { const res = await fetch("/api/seller/earnings"); const json = await res.json(); if (res.ok) setData(json); else toast.error(json.error); } finally { setLoading(false); } }, []);
  useEffect(() => { fetchData(); }, [fetchData]);
  if (!session) return null;
  const monthChange = data && data.lastMonth > 0 ? ((data.thisMonth - data.lastMonth) / data.lastMonth) * 100 : null;
  const CustomTooltip = ({ active, payload, label }: any) => active && payload?.length ? (<div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm shadow-card"><div className="text-gray-400 text-[11px] mb-0.5">{label}</div><div className="font-extrabold text-pink">{formatPrice(payload[0].value)}</div></div>) : null;
  const TABS = [{ key: "overview", label: "Overview" }, { key: "products", label: "Top Products" }, { key: "withdraw", label: "Withdraw" }, { key: "history", label: "History" }] as const;
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[1280px] mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6"><div><h1 className="text-[1.6rem] font-extrabold text-gray-800 tracking-tight">Earnings</h1><p className="text-gray-400 text-sm mt-0.5">Your sales revenue and withdrawal history</p></div><button onClick={fetchData} className="flex items-center gap-2 text-[13px] font-semibold text-gray-500 border border-gray-200 px-4 py-2 rounded-full hover:border-pink hover:text-pink transition-all"><RefreshCw className="w-3.5 h-3.5" /> Refresh</button></div>
        {loading ? <div className="flex items-center justify-center py-24"><Loader2 className="w-7 h-7 text-pink animate-spin" /></div> : !data ? <div className="text-center py-24 text-gray-400">Failed to load earnings data.</div> : (
          <>
            <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl p-1 mb-7 w-fit shadow-[0_2px_8px_rgba(0,0,0,0.04)]">{TABS.map(t => <button key={t.key} onClick={() => setTab(t.key)} className={cn("px-5 py-2 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap", tab === t.key ? "bg-gradient-pink text-white shadow-pink" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50")}>{t.label}</button>)}</div>
            {tab === "overview" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={TrendingUp} label="Gross Revenue" iconBg="#fff0f7" iconColor="#e8267a" value={formatPrice(data.totalRevenue)} sub={monthChange ? `${Math.abs(Math.round(monthChange))}% vs last month` : undefined} subUp={monthChange ? monthChange >= 0 : undefined} />
                  <StatCard icon={DollarSign} label="Net Earnings (after 10%)" iconBg="#f0fdf4" iconColor="#059669" value={formatPrice(data.netRevenue)} />
                  <StatCard icon={Clock} label="Pending Revenue" iconBg="#fef3c7" iconColor="#d97706" value={formatPrice(data.pendingRevenue)} />
                  <StatCard icon={CheckCircle} label="Available to Withdraw" iconBg="#e6f9fc" iconColor="#0db8d4" value={formatPrice(data.availableBalance)} />
                </div>
                <div className="bg-gradient-to-br from-pink to-pink-light rounded-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/4 translate-x-1/4" />
                  <div className="relative z-10"><div className="text-[13px] font-semibold text-white/70 mb-1">Available Balance</div><div className="text-[2.8rem] font-extrabold tracking-tight mb-1">{formatPrice(data.availableBalance)}</div><div className="text-[12.5px] text-white/70 mb-5">After 10% commission · {formatPrice(data.withdrawn)} withdrawn to date</div><button onClick={() => setTab("withdraw")} disabled={data.availableBalance < 5000} className="inline-flex items-center gap-2 bg-white text-pink font-bold text-[13.5px] px-6 py-2.5 rounded-full hover:bg-pink-pale transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_16px_rgba(0,0,0,0.15)]"><Send className="w-4 h-4" />{data.availableBalance < 5000 ? "Minimum RWF 5,000 to withdraw" : "Request Withdrawal"}</button></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"><div className="text-[12px] text-gray-400 font-medium mb-1">This Month</div><div className="text-[1.5rem] font-extrabold text-gray-800">{formatPrice(data.thisMonth)}</div></div>
                  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"><div className="text-[12px] text-gray-400 font-medium mb-1">Last Month</div><div className="text-[1.5rem] font-extrabold text-gray-800">{formatPrice(data.lastMonth)}</div></div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between mb-5"><div><div className="text-[15px] font-extrabold text-gray-800">Daily Revenue</div><div className="text-[12px] text-gray-400 mt-0.5">Last 30 days</div></div><div className="text-[11px] font-semibold text-gray-400">{data.totalOrders} orders · {data.totalUnits} units sold</div></div>
                  {data.dailyChart.every(d => d.revenue === 0) ? <div className="flex items-center justify-center h-[200px] text-gray-300 text-[13px]">No sales yet — your chart will appear here</div> : (
                    <ResponsiveContainer width="100%" height={200}><AreaChart data={data.dailyChart}><defs><linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#e8267a" stopOpacity={0.15}/><stop offset="95%" stopColor="#e8267a" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="date" tick={{fill:"#aaa",fontSize:10}} axisLine={false} tickLine={false} interval={4}/><YAxis tick={{fill:"#aaa",fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/><Tooltip content={<CustomTooltip/>}/><Area type="monotone" dataKey="revenue" stroke="#e8267a" strokeWidth={2.5} fill="url(#earningsGrad)"/></AreaChart></ResponsiveContainer>
                  )}
                </div>
              </div>
            )}
            {tab === "products" && (
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <div className="px-6 py-4 border-b border-gray-100 font-extrabold text-[15px] text-gray-800">Top Products by Revenue</div>
                {data.topProducts.length === 0 ? <div className="text-center py-16"><Package className="w-10 h-10 text-gray-200 mx-auto mb-3" strokeWidth={1}/><div className="font-bold text-gray-500">No sales data yet</div></div> : (
                  <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-gray-50">{["#","Product","Category","Units Sold","Revenue","Share"].map(h => <th key={h} className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>)}</tr></thead><tbody>
                    {data.topProducts.map((p, idx) => { const share = data.totalRevenue > 0 ? Math.round((p.revenue / data.totalRevenue) * 100) : 0; return (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 text-[13px] font-bold text-gray-400">#{idx+1}</td>
                        <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-pink-pale border border-pink-pale2 flex items-center justify-center shrink-0 overflow-hidden">{p.image ? <img src={p.image} alt="" className="w-full h-full object-cover"/> : <Package className="w-4 h-4 text-pink"/>}</div><span className="text-[13px] font-bold text-gray-800 line-clamp-1 max-w-[180px]">{p.name}</span></div></td>
                        <td className="px-5 py-4 text-[13px] text-gray-500">{p.category}</td>
                        <td className="px-5 py-4 text-[13px] font-semibold text-gray-700">{p.units}</td>
                        <td className="px-5 py-4 text-[13px] font-extrabold text-pink">{formatPrice(p.revenue)}</td>
                        <td className="px-5 py-4"><div className="flex items-center gap-2"><div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[80px]"><div className="h-full bg-gradient-pink rounded-full" style={{width:`${share}%`}}/></div><span className="text-[11.5px] font-bold text-gray-500">{share}%</span></div></td>
                      </tr>
                    ); })}
                  </tbody></table></div>
                )}
              </div>
            )}
            {tab === "withdraw" && (
              <div className="max-w-lg"><div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between mb-5"><h3 className="font-extrabold text-[16px] text-gray-800">Request Withdrawal</h3><div className="text-right"><div className="text-[11px] text-gray-400">Available</div><div className="text-[17px] font-extrabold text-pink">{formatPrice(data.availableBalance)}</div></div></div>
                {data.availableBalance < 5000 ? <div className="text-center py-8 text-gray-400"><DollarSign className="w-10 h-10 text-gray-200 mx-auto mb-3" strokeWidth={1}/><div className="font-bold text-gray-500 mb-1">Not enough balance</div><p className="text-[12.5px]">You need at least RWF 5,000 to withdraw.</p></div> : <WithdrawForm available={data.availableBalance} onSubmitted={() => { fetchData(); setTab("history"); }} />}
              </div></div>
            )}
            {tab === "history" && (
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                <div className="px-6 py-4 border-b border-gray-100 font-extrabold text-[15px] text-gray-800">Withdrawal History</div>
                {data.withdrawals.length === 0 ? <div className="text-center py-16"><Send className="w-10 h-10 text-gray-200 mx-auto mb-3" strokeWidth={1}/><div className="font-bold text-gray-500">No withdrawals yet</div></div> : (
                  <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-gray-50">{["Amount","Method","Account","Status","Date"].map(h => <th key={h} className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>)}</tr></thead><tbody>
                    {data.withdrawals.map(w => { const s = STATUS_STYLE[w.status] ?? STATUS_STYLE.PENDING; return (
                      <tr key={w.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 font-extrabold text-[13px] text-pink">{formatPrice(w.amount)}</td>
                        <td className="px-5 py-4"><div className="flex items-center gap-1.5 text-[13px] text-gray-600">{w.method === "momo" ? <><Smartphone className="w-3.5 h-3.5 text-amber-500"/> MTN MoMo</> : <><Building2 className="w-3.5 h-3.5 text-blue-500"/> Bank</>}</div></td>
                        <td className="px-5 py-4"><div className="text-[13px] text-gray-700 font-medium">{w.accountName}</div><div className="text-[11px] text-gray-400">{w.accountNo}</div></td>
                        <td className="px-5 py-4"><span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{color:s.color, background:s.bg}}>{s.label}</span></td>
                        <td className="px-5 py-4 text-[12px] text-gray-400">{formatDate(w.createdAt)}</td>
                      </tr>
                    ); })}
                  </tbody></table></div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
