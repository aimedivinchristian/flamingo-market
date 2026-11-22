"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import toast from "react-hot-toast";
import { Package, Search, ArrowRight } from "lucide-react";

export default function TrackOrderPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orderId, setOrderId] = useState("");

  function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    const id = orderId.trim();
    if (!id) { toast.error("Enter your order ID"); return; }
    router.push(`/order/${id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[560px] mx-auto px-5 py-16">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-pink-pale rounded-2xl flex items-center justify-center mx-auto mb-4"><Package className="w-6 h-6 text-pink" /></div>
          <h1 className="text-[1.8rem] font-extrabold text-gray-800 tracking-tight mb-2">Track Your Order</h1>
          <p className="text-gray-400 text-[13.5px]">Enter your order ID to see live delivery status.</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <form onSubmit={handleTrack} className="flex gap-2 mb-5">
            <div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="Order ID" className="w-full pl-10 pr-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all" /></div>
            <button type="submit" className="bg-gradient-pink text-white font-bold text-[13.5px] px-5 py-2.5 rounded-xl shadow-pink hover:opacity-90 transition-all shrink-0">Track</button>
          </form>

          {session ? (
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-[13px] text-gray-400 mb-2">Signed in — see all your orders at once</p>
              <Link href="/buyer" className="text-[13px] font-bold text-pink hover:underline inline-flex items-center gap-1">Go to My Orders <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
          ) : (
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-[13px] text-gray-400 mb-2">Sign in to see your full order history</p>
              <Link href="/login" className="text-[13px] font-bold text-pink hover:underline">Sign In</Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
