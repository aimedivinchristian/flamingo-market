"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { formatPrice, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { Plus, Tag, Loader2, RefreshCw, Trash2, ToggleLeft, ToggleRight, ChevronRight, Percent, DollarSign, Calendar, Users, CheckCircle, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
interface PromoCode { id: string; code: string; type: "PERCENT" | "FLAT"; value: number; minOrder: number; maxUses: number | null; usedCount: number; expiresAt: string | null; isActive: boolean; createdAt: string; _count: { usages: number }; }
const INPUT = "w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all";
const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = { active: { label: "Active", color: "#059669", bg: "#d1fae5" }, inactive: { label: "Inactive", color: "#9ca3af", bg: "#f3f4f6" } };
export default function AdminPromoPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [codes, setCodes] = useState<PromoCode[]>([]); const [loading, setLoading] = useState(true); const [showForm, setShowForm] = useState(false); const [creating, setCreating] = useState(false);
  const [code, setCode] = useState(""); const [type, setType] = useState<"PERCENT"|"FLAT">("PERCENT"); const [value, setValue] = useState(""); const [minOrder, setMinOrder] = useState(""); const [maxUses, setMaxUses] = useState(""); const [expiresAt, setExpiresAt] = useState("");
  useEffect(() => { if (status === "loading") return; if (!session || session.user.role !== "ADMIN") router.push("/login"); }, [session, status, router]);
  const fetchCodes = useCallback(async () => { setLoading(true); try { const res = await fetch("/api/admin/promo"); const data = await res.json(); if (res.ok) setCodes(Array.isArray(data) ? data : []); } finally { setLoading(false); } }, []);
  useEffect(() => { fetchCodes(); }, [fetchCodes]);
  if (!session || session.user.role !== "ADMIN") return null;
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) { toast.error("Code is required"); return; }
    if (!value) { toast.error("Value is required"); return; }
    setCreating(true);
    try { const res = await fetch("/api/admin/promo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, type, value: parseFloat(value), minOrder: minOrder ? parseFloat(minOrder) : 0, maxUses: maxUses ? parseInt(maxUses) : null, expiresAt: expiresAt || null }) }); const data = await res.json(); if (!res.ok) { toast.error(data.error); return; } toast.success(`Promo code "${data.code}" created!`); setCodes(prev => [data, ...prev]); setCode(""); setValue(""); setMinOrder(""); setMaxUses(""); setExpiresAt(""); setShowForm(false); } finally { setCreating(false); }
  }
  async function toggleActive(id: string, current: boolean) {
    const res = await fetch(`/api/admin/promo/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !current }) });
    const data = await res.json(); if (!res.ok) { toast.error(data.error); return; }
    setCodes(prev => prev.map(c => c.id === id ? { ...c, isActive: data.isActive } : c)); toast.success(data.isActive ? "Code activated" : "Code deactivated");
  }
  async function deleteCode(id: string, code: string) {
    if (!confirm(`Delete promo code "${code}"?`)) return;
    const res = await fetch(`/api/admin/promo/${id}`, { method: "DELETE" }); if (!res.ok) { toast.error("Failed to delete"); return; }
    setCodes(prev => prev.filter(c => c.id !== id)); toast.success("Code deleted");
  }
  function copyCode(code: string) { navigator.clipboard.writeText(code); toast.success(`Copied: ${code}`); }
  const totalActive = codes.filter(c => c.isActive).length; const totalUsages = codes.reduce((s, c) => s + c._count.usages, 0);
  const expiringSoon = codes.filter(c => { if (!c.expiresAt) return false; const diff = new Date(c.expiresAt).getTime() - Date.now(); return diff > 0 && diff < 7 * 86400_000; }).length;
  function generateCode() { const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; const prefix = ["FLAMINGO","SAVE","DEAL","KIGALI","RWANDAN"][Math.floor(Math.random()*5)]; const suffix = Array.from({ length: 4 }, () => chars[Math.floor(Math.random()*chars.length)]).join(""); setCode(`${prefix}${suffix}`); }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[1100px] mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <div><div className="flex items-center gap-2 mb-1"><Link href="/admin" className="text-[13px] text-gray-400 hover:text-pink transition-colors font-medium">Admin</Link><ChevronRight className="w-3.5 h-3.5 text-gray-300" /><span className="text-[13px] font-bold text-gray-700">Promo Codes</span></div><h1 className="text-[1.6rem] font-extrabold text-gray-800 tracking-tight">Promo Codes</h1><p className="text-gray-400 text-sm mt-0.5">{codes.length} codes · {totalUsages} total uses</p></div>
          <div className="flex gap-2"><button onClick={fetchCodes} className="flex items-center gap-2 text-[13px] font-semibold text-gray-500 border border-gray-200 px-4 py-2 rounded-full hover:border-pink hover:text-pink transition-all"><RefreshCw className="w-3.5 h-3.5" /></button><button onClick={() => setShowForm(f => !f)} className="flex items-center gap-2 bg-gradient-pink text-white text-[13px] font-bold px-5 py-2.5 rounded-full shadow-pink hover:opacity-90 transition-all"><Plus className="w-4 h-4" /> New Code</button></div>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[{ icon: CheckCircle, label: "Active Codes", value: totalActive, color: "text-green-600", bg: "bg-green-50" }, { icon: Users, label: "Total Usages", value: totalUsages, color: "text-cyan", bg: "bg-cyan-light" }, { icon: Calendar, label: "Expiring in 7d", value: expiringSoon, color: "text-amber-500", bg: "bg-amber-50" }].map(({ icon: Icon, label, value, color, bg }) => (<div key={label} className={`${bg} border border-gray-100 rounded-2xl p-5 flex items-center gap-4`}><div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm shrink-0"><Icon className={`w-5 h-5 ${color}`} /></div><div><div className={`text-[1.4rem] font-extrabold ${color}`}>{value}</div><div className="text-[11.5px] text-gray-400 font-medium">{label}</div></div></div>))}
        </div>
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white border-[1.5px] border-pink-pale2 rounded-2xl p-6 mb-5 shadow-[0_4px_20px_rgba(232,38,122,0.08)]">
            <div className="font-extrabold text-[15px] text-gray-800 mb-5 flex items-center gap-2"><Tag className="w-4 h-4 text-pink" /> Create Promo Code</div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Code *</label><div className="flex gap-2"><input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. SAVE20" maxLength={20} className={cn(INPUT, "font-mono flex-1")} /><button type="button" onClick={generateCode} className="text-[12px] font-bold text-pink border border-pink-pale2 bg-pink-pale px-3 rounded-xl hover:bg-pink hover:text-white transition-all shrink-0">Auto</button></div></div>
              <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Discount Type *</label><div className="grid grid-cols-2 gap-2">{([{ v: "PERCENT", icon: Percent, label: "Percentage (%)" }, { v: "FLAT", icon: DollarSign, label: "Flat (RWF)" }] as const).map(({ v, icon: Icon, label }) => (<button key={v} type="button" onClick={() => setType(v)} className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl border-[1.5px] transition-all text-left", type === v ? "border-pink bg-pink-pale text-pink" : "border-gray-200 text-gray-600 hover:border-gray-300")}><Icon className="w-4 h-4 shrink-0" /><span className="text-[12.5px] font-semibold">{label}</span></button>))}</div></div>
              <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">{type === "PERCENT" ? "Discount % *" : "Discount Amount (RWF) *"}</label><div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-[13px] font-bold">{type === "PERCENT" ? "%" : "RWF"}</span><input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder={type === "PERCENT" ? "e.g. 20" : "e.g. 5000"} min={1} max={type === "PERCENT" ? 100 : undefined} className={cn(INPUT, "pl-12")} /></div></div>
              <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Minimum Order (RWF) <span className="text-gray-400 font-normal">optional</span></label><input type="number" value={minOrder} onChange={e => setMinOrder(e.target.value)} placeholder="e.g. 20000" min={0} className={INPUT} /></div>
              <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Max Uses <span className="text-gray-400 font-normal">optional</span></label><input type="number" value={maxUses} onChange={e => setMaxUses(e.target.value)} placeholder="e.g. 100" min={1} className={INPUT} /></div>
              <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Expiry Date <span className="text-gray-400 font-normal">optional</span></label><input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} min={new Date().toISOString().slice(0,16)} className={INPUT} /></div>
            </div>
            <div className="flex gap-3"><button type="submit" disabled={creating} className="flex items-center gap-2 bg-gradient-pink text-white font-bold text-[13.5px] px-6 py-2.5 rounded-full shadow-pink hover:opacity-90 transition-all disabled:opacity-60">{creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><Plus className="w-4 h-4" /> Create Code</>}</button><button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 border-[1.5px] border-gray-200 text-gray-600 font-semibold text-sm rounded-full hover:border-pink hover:text-pink transition-all">Cancel</button></div>
          </form>
        )}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-pink animate-spin" /></div> : codes.length === 0 ? (
            <div className="text-center py-16"><Tag className="w-10 h-10 text-gray-200 mx-auto mb-3" strokeWidth={1} /><div className="font-bold text-gray-500 text-[15px] mb-1">No promo codes yet</div><button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-gradient-pink text-white font-bold text-[13px] px-5 py-2.5 rounded-full shadow-pink hover:opacity-90 mt-3"><Plus className="w-4 h-4" /> Create First Code</button></div>
          ) : (
            <div className="overflow-x-auto"><table className="w-full">
              <thead><tr className="border-b border-gray-100">{["Code","Discount","Min Order","Uses","Expires","Status","Actions"].map(h => <th key={h} className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>
                {codes.map(c => { const expired = c.expiresAt && new Date(c.expiresAt) < new Date(); const exhausted = c.maxUses !== null && c._count.usages >= c.maxUses; const usagePct = c.maxUses ? Math.round((c._count.usages / c.maxUses) * 100) : null;
                  return (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4"><div className="flex items-center gap-2"><span className="font-mono font-extrabold text-[14px] text-gray-800">{c.code}</span><button onClick={() => copyCode(c.code)} className="text-gray-300 hover:text-pink transition-colors"><Copy className="w-3.5 h-3.5" /></button></div><div className="text-[10.5px] text-gray-400 mt-0.5">{formatDate(c.createdAt)}</div></td>
                      <td className="px-5 py-4"><div className="flex items-center gap-1.5">{c.type === "PERCENT" ? <><Percent className="w-3.5 h-3.5 text-pink" /><span className="font-extrabold text-[14px] text-pink">{c.value}%</span></> : <><DollarSign className="w-3.5 h-3.5 text-pink" /><span className="font-extrabold text-[13px] text-pink">{formatPrice(c.value)}</span></>}</div></td>
                      <td className="px-5 py-4 text-[13px] text-gray-500">{c.minOrder > 0 ? formatPrice(c.minOrder) : <span className="text-gray-300">None</span>}</td>
                      <td className="px-5 py-4"><div className="text-[13px] font-semibold text-gray-700">{c._count.usages}{c.maxUses ? ` / ${c.maxUses}` : ""}</div>{usagePct !== null && <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden"><div className={cn("h-full rounded-full", usagePct >= 100 ? "bg-red-400" : "bg-gradient-pink")} style={{ width:`${Math.min(usagePct,100)}%` }} /></div>}</td>
                      <td className="px-5 py-4 text-[12.5px]">{c.expiresAt ? <span className={expired ? "text-red-400 font-semibold" : "text-gray-500"}>{expired ? "Expired · " : ""}{formatDate(c.expiresAt)}</span> : <span className="text-gray-300">Never</span>}</td>
                      <td className="px-5 py-4">{exhausted ? <span className="text-[11px] font-bold px-2.5 py-1 rounded-full text-gray-400 bg-gray-100">Exhausted</span> : expired ? <span className="text-[11px] font-bold px-2.5 py-1 rounded-full text-red-400 bg-red-50">Expired</span> : c.isActive ? <span className="text-[11px] font-bold px-2.5 py-1 rounded-full text-green-600 bg-green-50">Active</span> : <span className="text-[11px] font-bold px-2.5 py-1 rounded-full text-gray-400 bg-gray-100">Inactive</span>}</td>
                      <td className="px-5 py-4"><div className="flex items-center gap-2"><button onClick={() => toggleActive(c.id, c.isActive)} className={cn("flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-lg border transition-all", c.isActive ? "border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-500" : "border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600")}>{c.isActive ? <><ToggleRight className="w-3.5 h-3.5" /> Deactivate</> : <><ToggleLeft className="w-3.5 h-3.5" /> Activate</>}</button><button onClick={() => deleteCode(c.id, c.code)} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:border-red-300 hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table></div>
          )}
        </div>
      </div>
    </div>
  );
}
