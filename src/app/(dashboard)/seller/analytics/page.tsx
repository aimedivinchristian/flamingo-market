"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { formatPrice } from "@/lib/utils";
import { Loader2, ChevronRight, Eye, ShoppingBag, TrendingUp, Percent, Download, Rocket } from "lucide-react";

interface Row { id: string; name: string; image: string | null; views: number; orders: number; units: number; revenue: number; conversion: number; stock: number; isActive: boolean; boosted: boolean }
interface Data { totals: { views: number; orders: number; units: number; revenue: number; conversion: number }; daily: { date: string; revenue: number }[]; products: Row[] }

function csvCell(v: string | number) { const s = String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }

export default function SellerAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (status === "loading") return; if (!session || !["SELLER", "ADMIN"].includes(session.user.role)) router.push("/login"); }, [session, status, router]);
  useEffect(() => { fetch("/api/seller/analytics").then(r => r.json()).then(d => { if (d.totals) setData(d); }).finally(() => setLoading(false)); }, []);
  if (!session) return null;

  function exportCsv() {
    if (!data) return;
    const head = ["Product", "Views", "Orders", "Units sold", "Revenue (RWF)", "Conversion %", "Stock", "Active", "Boosted"];
    const lines = data.products.map(r => [r.name, r.views, r.orders, r.units, r.revenue, r.conversion, r.stock, r.isActive ? "yes" : "no", r.boosted ? "yes" : "no"].map(csvCell).join(","));
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `flamingo-analytics-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(a.href);
  }
  const max = Math.max(1, ...(data?.daily.map(d => d.revenue) ?? [1]));
  const Card = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-4"><div className="w-9 h-9 rounded-xl bg-pink-pale flex items-center justify-center mb-2"><Icon className="w-4 h-4 text-pink" /></div><div className="text-[1.25rem] font-extrabold text-gray-800 leading-tight">{value}</div><div className="text-[11.5px] text-gray-400 font-semibold">{label}</div></div>
  );
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-6">
        <div className="flex items-center gap-1.5 text-[12.5px] text-gray-400 mb-3"><Link href="/seller" className="hover:text-pink">Seller</Link><ChevronRight className="w-3 h-3" /><span className="text-gray-700 font-semibold">Analytics</span></div>
        <div className="flex items-center justify-between gap-3 mb-5">
          <h1 className="text-[1.5rem] font-extrabold text-gray-800">Analytics</h1>
          <button onClick={exportCsv} disabled={!data} className="inline-flex items-center gap-1.5 text-[12.5px] font-bold border border-gray-200 hover:border-pink hover:text-pink px-4 py-2 rounded-full disabled:opacity-40"><Download className="w-3.5 h-3.5" /> Export CSV</button>
        </div>
        {loading ? <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-pink" /></div> : !data ? <div className="text-center text-gray-400 py-20">Could not load analytics.</div> : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              <Card icon={Eye} label="Product views" value={data.totals.views.toLocaleString()} />
              <Card icon={ShoppingBag} label="Orders" value={data.totals.orders.toLocaleString()} />
              <Card icon={TrendingUp} label="Revenue" value={formatPrice(data.totals.revenue)} />
              <Card icon={Percent} label="Conversion (orders ÷ views)" value={`${data.totals.conversion}%`} />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-5">
              <div className="font-extrabold text-[14px] text-gray-800 mb-4">Revenue — last 14 days</div>
              <div className="flex items-end gap-1.5 h-36">
                {data.daily.map(d => (
                  <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full gap-1" title={`${d.date}: ${formatPrice(d.revenue)}`}>
                    <div className="w-full rounded-t-md bg-gradient-pink min-h-[3px]" style={{ height: `${Math.max(2, (d.revenue / max) * 100)}%`, opacity: d.revenue ? 1 : 0.25 }} />
                    <span className="text-[9px] text-gray-300 hidden sm:block">{d.date.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between"><span className="font-extrabold text-[14px] text-gray-800">Products</span><Link href="/seller/boost" className="text-[12px] font-bold text-pink inline-flex items-center gap-1"><Rocket className="w-3.5 h-3.5" /> Boost a product</Link></div>
              {data.products.length === 0 ? <div className="text-center text-gray-400 text-sm py-12">Add products to see analytics.</div> : (
                <div className="overflow-x-auto"><table className="w-full min-w-[560px]">
                  <thead><tr className="border-b border-gray-50">{["Product", "Views", "Orders", "Units", "Revenue", "Conv."].map(h => <th key={h} className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>)}</tr></thead>
                  <tbody>{data.products.map(r => (
                    <tr key={r.id} className="border-b border-gray-50">
                      <td className="px-4 py-3 text-[13px] font-bold text-gray-800 max-w-[220px] truncate">{r.name}{r.boosted && <span className="ml-2 text-[10px] font-bold text-pink bg-pink-pale px-2 py-0.5 rounded-full">Boosted</span>}</td>
                      <td className="px-4 py-3 text-[13px] text-gray-600">{r.views}</td><td className="px-4 py-3 text-[13px] text-gray-600">{r.orders}</td><td className="px-4 py-3 text-[13px] text-gray-600">{r.units}</td>
                      <td className="px-4 py-3 text-[13px] font-extrabold text-pink whitespace-nowrap">{formatPrice(r.revenue)}</td><td className="px-4 py-3 text-[13px] text-gray-600">{r.conversion}%</td>
                    </tr>))}</tbody>
                </table></div>
              )}
            </div>
            <p className="text-[11.5px] text-gray-400 mt-3">Views count once per visitor session. Orders exclude cancelled orders.</p>
          </>
        )}
      </div>
    </div>
  );
}
