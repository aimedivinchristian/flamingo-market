"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { Tag, Percent, Loader2, ArrowRight } from "lucide-react";
interface PromoCode { code: string; type: "PERCENT" | "FLAT"; value: number; minOrder: number; }
export default function PromotionsPage() {
  const [codes, setCodes] = useState<PromoCode[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => {
    /* Only surface codes that are genuinely live — the public marketplace should
       never show promos that are expired, inactive, or exhausted. */
    fetch("/api/promo/public").then(r => r.json()).then(data => setCodes(Array.isArray(data) ? data : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[900px] mx-auto px-5 py-14">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-pink-pale rounded-2xl flex items-center justify-center mx-auto mb-4"><Tag className="w-6 h-6 text-pink" /></div>
          <h1 className="text-[2rem] font-extrabold text-gray-800 tracking-tight mb-2">Current Promotions</h1>
          <p className="text-gray-400 text-[14px]">Active discount codes you can apply at checkout.</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-7 h-7 text-pink animate-spin" /></div>
        ) : codes.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
            <Percent className="w-10 h-10 text-gray-200 mx-auto mb-4" strokeWidth={1} />
            <h3 className="font-bold text-gray-600 text-[15px] mb-2">No active promotions right now</h3>
            <p className="text-[13px] text-gray-400 mb-5">Check back soon, or browse the marketplace for everyday low prices.</p>
            <Link href="/marketplace" className="inline-flex items-center gap-2 text-[13px] font-bold text-pink hover:underline">Browse Marketplace <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {codes.map(c => (
              <div key={c.code} className="bg-white border-[1.5px] border-pink-pale2 rounded-2xl p-6 flex items-center justify-between">
                <div><div className="font-mono font-extrabold text-[18px] text-gray-800 mb-1">{c.code}</div><div className="text-[13px] text-pink font-semibold">{c.type === "PERCENT" ? `${c.value}% off` : `RWF ${c.value.toLocaleString()} off`}</div>{c.minOrder > 0 && <div className="text-[11px] text-gray-400 mt-1">Min. order RWF {c.minOrder.toLocaleString()}</div>}</div>
                <Tag className="w-6 h-6 text-pink-pale2" />
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
