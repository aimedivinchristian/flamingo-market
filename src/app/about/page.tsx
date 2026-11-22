import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { Heart, Users, Store, Truck, ArrowRight } from "lucide-react";

export const metadata = { title: "About Us — Flamingo Market" };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div style={{ background: "linear-gradient(135deg,#fff5f9 0%,#f0f8ff 100%)" }}>
        <div className="max-w-[900px] mx-auto px-5 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-pink-pale2 text-pink text-[11.5px] font-bold px-4 py-1.5 rounded-full mb-5 shadow-[0_2px_8px_rgba(232,38,122,0.1)]">
            <span className="w-1.5 h-1.5 bg-pink rounded-full" />Our Story
          </div>
          <h1 className="font-extrabold leading-[1.15] tracking-tight mb-4 text-flamingo-dark" style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)" }}>Building Rwanda&apos;s home for online shopping</h1>
          <p className="text-gray-500 text-[15px] leading-relaxed max-w-[560px] mx-auto">Flamingo Market connects local sellers with buyers across Rwanda — fashion, beauty, electronics, groceries, and everything in between — in one trusted marketplace.</p>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-5 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
          <div>
            <h2 className="text-[1.5rem] font-extrabold text-gray-800 mb-4">Why we started</h2>
            <p className="text-[14px] text-gray-600 leading-relaxed mb-4">Small businesses across Rwanda make incredible products — from hand-tailored Ankara fashion to locally roasted coffee — but often lack an easy way to reach buyers beyond their immediate neighborhood.</p>
            <p className="text-[14px] text-gray-600 leading-relaxed">Flamingo Market gives every seller, whether a solo tailor or a growing electronics shop, the same tools: a storefront, secure payments, and delivery logistics — so they can focus on what they do best.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[{ icon: Store, label: "Real local sellers" }, { icon: Truck, label: "Fast delivery" }, { icon: Users, label: "Trusted by buyers" }, { icon: Heart, label: "Made in Rwanda" }].map(({ icon: Icon, label }) => (
              <div key={label} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center"><Icon className="w-6 h-6 text-pink mx-auto mb-2" /><div className="text-[12.5px] font-semibold text-gray-700">{label}</div></div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-10 text-center mb-16">
          <h2 className="text-[1.4rem] font-extrabold text-gray-800 mb-3">Our mission</h2>
          <p className="text-[14px] text-gray-600 leading-relaxed max-w-[600px] mx-auto">To make it simple for anyone in Rwanda to start selling online, and for every buyer to shop with confidence — knowing their order will arrive as promised, from a real, verified seller.</p>
        </div>

        <div className="text-center">
          <h2 className="text-[1.4rem] font-extrabold text-gray-800 mb-5">Join the marketplace</h2>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/marketplace" className="bg-gradient-pink text-white font-bold text-[14px] px-7 py-3 rounded-full shadow-pink hover:opacity-90 transition-all inline-flex items-center gap-2">Start Shopping <ArrowRight className="w-4 h-4" /></Link>
            <Link href="/register?role=SELLER" className="border-[1.5px] border-gray-200 text-gray-700 font-semibold text-[14px] px-7 py-3 rounded-full hover:border-pink hover:text-pink transition-all">Become a Seller</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
