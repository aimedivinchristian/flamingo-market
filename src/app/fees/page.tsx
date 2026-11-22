import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { Percent, Truck, Wallet, ArrowRight } from "lucide-react";

export default function FeesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-[820px] mx-auto px-5 py-14">
        <div className="mb-10">
          <div className="w-12 h-12 bg-pink-pale rounded-2xl flex items-center justify-center mb-4"><Percent className="w-5 h-5 text-pink" /></div>
          <h1 className="text-[2rem] font-extrabold text-gray-800 tracking-tight mb-2">Seller Fees</h1>
          <p className="text-gray-400 text-[14px]">Simple, transparent pricing. No listing fees, no monthly subscription.</p>
        </div>

        <div className="bg-gradient-to-br from-pink to-pink-light rounded-3xl p-8 text-white mb-10 text-center">
          <div className="text-[13px] font-semibold text-white/70 mb-2">Platform Commission</div>
          <div className="text-[3.5rem] font-extrabold tracking-tight leading-none mb-2">10%</div>
          <p className="text-[13px] text-white/80 max-w-[420px] mx-auto">Deducted only from completed, delivered orders. If an order is cancelled or returned, no commission is charged.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm"><Wallet className="w-5 h-5 text-pink" /></div>
            <h3 className="text-[14px] font-bold text-gray-800 mb-2">What's included</h3>
            <ul className="text-[13px] text-gray-600 space-y-1.5 list-disc list-inside">
              <li>Unlimited product listings</li>
              <li>Store page &amp; branding</li>
              <li>Order &amp; earnings dashboard</li>
              <li>Payment processing (MoMo, card, COD)</li>
              <li>Buyer messaging &amp; reviews</li>
            </ul>
          </div>
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm"><Truck className="w-5 h-5 text-pink" /></div>
            <h3 className="text-[14px] font-bold text-gray-800 mb-2">Withdrawals</h3>
            <p className="text-[13px] text-gray-600 leading-relaxed">Withdraw your earnings any time above RWF 5,000, via MTN Mobile Money (instant) or bank transfer (1–2 business days). No withdrawal fees.</p>
          </div>
        </div>

        <div className="space-y-6 text-[14px] text-gray-600 leading-relaxed mb-10">
          <section><h2 className="text-[15px] font-bold text-gray-800 mb-2">Example calculation</h2><p>On a product sold for RWF 50,000: you receive RWF 45,000 (90%) once the order is marked Delivered. The remaining RWF 5,000 (10%) covers payment processing, platform hosting, and buyer support.</p></section>
        </div>

        <div className="text-center">
          <Link href="/register?role=SELLER" className="inline-flex items-center gap-2 bg-gradient-pink text-white font-bold text-[14px] px-7 py-3 rounded-full shadow-pink hover:opacity-90 transition-all">Start Selling <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
