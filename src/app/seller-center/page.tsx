"use client";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { Store, Package, TrendingUp, ShoppingBag, ArrowRight } from "lucide-react";

export default function SellerCenterPage() {
  const { data: session } = useSession();
  const isSeller = session && ["SELLER","ADMIN"].includes(session.user.role);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div style={{ background: "linear-gradient(135deg,#fff5f9 0%,#f0f8ff 100%)" }}>
        <div className="max-w-[900px] mx-auto px-5 py-16 text-center">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-card"><Store className="w-6 h-6 text-pink" /></div>
          <h1 className="text-[2rem] font-extrabold text-gray-800 tracking-tight mb-3">Seller Center</h1>
          <p className="text-gray-500 text-[14px] max-w-[480px] mx-auto mb-7">Everything you need to run your store — list products, manage orders, and track your earnings.</p>
          {isSeller ? (
            <Link href="/seller" className="inline-flex items-center gap-2 bg-gradient-pink text-white font-bold text-[14px] px-7 py-3 rounded-full shadow-pink hover:opacity-90 transition-all">Go to My Dashboard <ArrowRight className="w-4 h-4" /></Link>
          ) : (
            <Link href="/register?role=SELLER" className="inline-flex items-center gap-2 bg-gradient-pink text-white font-bold text-[14px] px-7 py-3 rounded-full shadow-pink hover:opacity-90 transition-all">Become a Seller <ArrowRight className="w-4 h-4" /></Link>
          )}
        </div>
      </div>
      <div className="max-w-[900px] mx-auto px-5 py-14">
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[{ icon: Package, title: "List Products", body: "Upload photos, set prices, and publish in minutes." }, { icon: ShoppingBag, title: "Manage Orders", body: "Track and update order status from your dashboard." }, { icon: TrendingUp, title: "Track Earnings", body: "See real-time revenue and request withdrawals." }].map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center"><div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm"><Icon className="w-5 h-5 text-pink" /></div><h3 className="text-[14px] font-bold text-gray-800 mb-1.5">{title}</h3><p className="text-[12.5px] text-gray-500">{body}</p></div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-[13px] text-gray-400 mb-2">New to selling? Read our step-by-step guide.</p>
          <Link href="/seller-guide" className="text-[13px] font-bold text-pink hover:underline inline-flex items-center gap-1">View Seller Guide <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
