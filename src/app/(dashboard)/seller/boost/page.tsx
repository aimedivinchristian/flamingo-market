"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { formatPrice, formatDate } from "@/lib/utils";
import { BOOST_OPTIONS, BOOST_PRICE_PER_DAY } from "@/lib/boost";
import toast from "react-hot-toast";
import { Loader2, ChevronRight, Rocket } from "lucide-react";

interface P { id: string; name: string }
interface B { id: string; days: number; amount: number; status: string; note: string | null; createdAt: string; product: { name: string; boostUntil: string | null } }
const COLOR: Record<string, string> = { PENDING: "#d97706", APPROVED: "#059669", REJECTED: "#dc2626" };
const INPUT = "w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink bg-white";

export default function SellerBoostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<P[]>([]);
  const [reqs, setReqs] = useState<B[]>([]);
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState("");
  const [days, setDays] = useState(7);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (status === "loading") return; if (!session || !["SELLER", "ADMIN"].includes(session.user.role)) router.push("/login"); }, [session, status, router]);
  const load = useCallback(async () => {
    if (!session) return;
    try {
      const [p, b] = await Promise.all([fetch(`/api/products?sellerId=${session.user.id}&limit=100`).then(r => r.json()), fetch("/api/seller/boost").then(r => r.json())]);
      setProducts((p.products ?? []).map((x: any) => ({ id: x.id, name: x.name }))); if (Array.isArray(b)) setReqs(b);
    } finally { setLoading(false); }
  }, [session]);
  useEffect(() => { load(); }, [load]);
  if (!session) return null;
  const payTo = process.env.NEXT_PUBLIC_PAYMENT_MOMO_NUMBER;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) { toast.error("Choose a product"); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/seller/boost", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, days }) });
      const d = await r.json();
      if (!r.ok) { toast.error(d.error || "Failed"); return; }
      toast.success("Request sent — pay with the reference shown below"); load();
    } finally { setBusy(false); }
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[720px] mx-auto px-4 sm:px-5 py-6">
        <div className="flex items-center gap-1.5 text-[12.5px] text-gray-400 mb-3"><Link href="/seller" className="hover:text-pink">Seller</Link><ChevronRight className="w-3 h-3" /><span className="text-gray-700 font-semibold">Boost</span></div>
        <h1 className="text-[1.5rem] font-extrabold text-gray-800 mb-1 flex items-center gap-2"><Rocket className="w-5 h-5 text-pink" /> Boost a product</h1>
        <p className="text-gray-400 text-[13px] mb-5">Boosted products appear first in the marketplace for the chosen period. {formatPrice(BOOST_PRICE_PER_DAY)} per day.</p>
        {loading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-pink" /></div> : (
          <>
            <form onSubmit={submit} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 mb-6">
              <select className={INPUT} value={productId} onChange={e => setProductId(e.target.value)}><option value="">Select a product…</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
              <div className="grid grid-cols-4 gap-2">{BOOST_OPTIONS.map(d => <button type="button" key={d} onClick={() => setDays(d)} className={`py-2.5 rounded-xl border-[1.5px] text-[13px] font-bold ${days === d ? "border-pink bg-pink-pale text-pink" : "border-gray-200 text-gray-500"}`}>{d} days</button>)}</div>
              <div className="flex items-center justify-between text-[14px]"><span className="text-gray-500">Total</span><span className="font-extrabold text-pink text-[1.1rem]">{formatPrice(days * BOOST_PRICE_PER_DAY)}</span></div>
              <button disabled={busy} className="w-full bg-gradient-pink text-white font-bold text-[14px] py-3 rounded-full shadow-pink disabled:opacity-60">{busy ? "Sending…" : "Request boost"}</button>
              <p className="text-[12px] text-gray-400">{payTo ? <>After requesting, send the amount by MoMo to <b className="text-gray-600">{payTo}</b> and write your reference code in the payment note.</> : "After requesting, the admin will contact you with payment details."} The boost starts once the admin confirms your payment.</p>
            </form>
            <div className="space-y-3">
              {reqs.map(b => (
                <div key={b.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-wrap justify-between gap-2">
                  <div><div className="font-bold text-[14px] text-gray-800">{b.product.name}</div><div className="text-[12px] text-gray-400">{b.days} days · {formatPrice(b.amount)} · ref <b className="text-gray-600">{b.id.slice(-6).toUpperCase()}</b> · {formatDate(b.createdAt)}</div>{b.note && <div className="text-[12px] text-gray-400">Note: {b.note}</div>}{b.status === "APPROVED" && b.product.boostUntil && <div className="text-[12px] text-green-600">Boosted until {formatDate(b.product.boostUntil)}</div>}</div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full self-start" style={{ color: COLOR[b.status], background: COLOR[b.status] + "18" }}>{b.status}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
