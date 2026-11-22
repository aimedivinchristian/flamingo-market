import Link from "next/link";
import { ShoppingCart, Store, ShieldCheck, Truck, Headphones, Award } from "lucide-react";

const FLOATING_BADGES = [
  { icon: Truck,      label: "Fast Delivery",   pos: "top-2 left-0 sm:left-2"        },
  { icon: ShieldCheck,label: "Secure Shopping", pos: "top-2 left-[18%] sm:left-[22%]"},
  { icon: Award,      label: "Trusted Sellers", pos: "top-2 right-[18%] sm:right-[22%]"},
  { icon: Headphones, label: "Great Support",   pos: "top-2 right-0 sm:right-2"      },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#eef7ff 0%,#fff0f7 45%,#ffe9f5 100%)" }}>
      {/* Decorative glow blobs */}
      <div className="absolute top-[-100px] right-[-80px] w-[420px] h-[420px] rounded-full opacity-30 pointer-events-none" style={{ background: "radial-gradient(circle,#ffb8d9 0%,transparent 70%)" }} />
      <div className="absolute bottom-[-80px] left-[8%] w-[300px] h-[300px] rounded-full opacity-25 pointer-events-none" style={{ background: "radial-gradient(circle,#a7e8f5 0%,transparent 70%)" }} />

      {/* Top badge row — hidden on very small screens, wraps on tablet */}
      <div className="hidden sm:flex justify-center gap-6 md:gap-16 pt-8 px-4 relative z-10">
        {FLOATING_BADGES.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <div className="w-14 h-14 rounded-full bg-white shadow-[0_8px_24px_rgba(232,38,122,0.15)] flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-pink-pale flex items-center justify-center"><Icon className="w-4.5 h-4.5 text-pink" /></div>
            </div>
            <span className="text-[10px] font-bold text-gray-500 text-center leading-tight uppercase tracking-wide">{label}</span>
          </div>
        ))}
      </div>

      {/* Wordmark */}
      <div className="text-center pt-6 sm:pt-4 pb-2 px-4 relative z-10">
        <div className="inline-flex items-center gap-3">
          <img src="/flamingo-logo.png" alt="" width="34" height="53" className="shrink-0" />
          <div className="text-left">
            <div className="font-extrabold tracking-tight leading-none" style={{ fontSize: "clamp(1.5rem,4vw,2.4rem)" }}><span className="text-pink">FLAMINGO</span></div>
            <div className="font-extrabold tracking-[0.15em] leading-none -mt-1" style={{ fontSize: "clamp(1.2rem,3.2vw,1.9rem)", color: "#0db8d4" }}>MARKET</div>
          </div>
        </div>
        <div className="text-[11px] sm:text-[12px] font-semibold tracking-[0.25em] text-gray-400 uppercase mt-2">Shop Easy. Shop Smart.</div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-5 pb-14 sm:pb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">

          {/* LEFT — copy */}
          <div className="max-w-[520px] mx-auto lg:mx-0 text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-white border border-pink-pale2 text-pink text-[11.5px] font-bold px-4 py-1.5 rounded-full mb-5 shadow-[0_2px_8px_rgba(232,38,122,0.1)]">
              <span className="w-1.5 h-1.5 bg-pink rounded-full" />Rwanda&apos;s Premier Online Marketplace
            </div>
            <h1 className="font-extrabold leading-[1.12] tracking-tight mb-4 text-flamingo-dark" style={{ fontSize: "clamp(1.9rem,4.2vw,3.1rem)" }}>
              Shop from<br /><span style={{ color: "var(--pink)" }}>Different Stores</span><br />All in One Place
            </h1>
            <p className="text-gray-500 text-[14.5px] sm:text-[15px] leading-relaxed max-w-[440px] mx-auto lg:mx-0 mb-7">
              Discover thousands of products from verified local sellers across Rwanda. Fashion, beauty, electronics, groceries — delivered to your door.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <Link href="/marketplace" className="btn-primary px-7 py-3 text-[14px] font-bold"><ShoppingCart className="w-4 h-4" />Shop Now</Link>
              <Link href="/register?role=SELLER" className="btn-secondary px-7 py-3 text-[14px]"><Store className="w-4 h-4" />Open Your Store</Link>
            </div>
          </div>

          {/* RIGHT — laptop + phone mockup */}
          <div className="relative order-1 lg:order-2 mx-auto w-full max-w-[520px]">
            {/* Laptop frame */}
            <div className="relative">
              <div className="bg-[#1a1a2e] rounded-[18px] p-2 sm:p-2.5 shadow-[0_30px_70px_rgba(0,0,0,0.25)]">
                <div className="bg-white rounded-xl overflow-hidden">
                  {/* mini browser chrome */}
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <span className="w-2 h-2 rounded-full bg-red-300" /><span className="w-2 h-2 rounded-full bg-amber-300" /><span className="w-2 h-2 rounded-full bg-green-300" />
                    <div className="flex-1 bg-white border border-gray-200 rounded-full px-3 py-1 ml-2 flex items-center gap-1.5">
                      <svg className="w-2.5 h-2.5 text-gray-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      <span className="text-[9px] text-gray-400 truncate">Search for products, stores...</span>
                    </div>
                  </div>
                  {/* mock hero content inside browser */}
                  <div className="p-4 sm:p-5" style={{ background: "linear-gradient(135deg,#f0f8ff,#fff0f7)" }}>
                    <div className="text-[13px] sm:text-[15px] font-extrabold text-flamingo-dark leading-tight mb-1">Shop From<br />Different Stores</div>
                    <div className="text-[9px] sm:text-[10px] text-gray-400 mb-3">Quality. Variety. Convenience.</div>
                    <span className="inline-block bg-pink text-white text-[9px] sm:text-[10px] font-bold px-3 py-1.5 rounded-full shadow-pink">Shop Now</span>
                  </div>
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                    <div className="text-[10px] font-bold text-gray-700 mb-2">Featured Products</div>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ bg: "from-pink-pale to-pink-pale2", stroke: "#e8267a" }, { bg: "from-cyan-light to-blue-100", stroke: "#0db8d4" }, { bg: "from-green-50 to-emerald-100", stroke: "#059669" }].map((c, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-1.5">
                          <div className={`w-full aspect-square rounded-md mb-1 flex items-center justify-center bg-gradient-to-br ${c.bg}`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* laptop base */}
              <div className="mx-auto h-3 sm:h-4 rounded-b-xl" style={{ width: "92%", background: "linear-gradient(180deg,#2a2a42,#1a1a2e)" }} />
            </div>

            {/* Phone mockup — overlapping bottom-right, hidden on very small screens */}
            <div className="hidden sm:block absolute -bottom-6 -right-2 sm:-right-6 w-[92px] sm:w-[120px]">
              <div className="bg-[#1a1a2e] rounded-[16px] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
                <div className="bg-white rounded-[10px] overflow-hidden aspect-[9/18]">
                  <div className="px-2 py-1.5 flex items-center gap-1 border-b border-gray-100">
                    <span className="text-[6px] font-extrabold text-pink">FLAMINGO</span>
                  </div>
                  <div className="p-2" style={{ background: "linear-gradient(135deg,#fff0f7,#f0f8ff)" }}>
                    <div className="text-[7px] font-extrabold text-flamingo-dark leading-tight">Trusted<br />Marketplace</div>
                    <span className="inline-block bg-pink text-white text-[5px] font-bold px-1.5 py-0.5 rounded-full mt-1">Shop Now</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating stat card — top-left */}
            <div className="absolute -top-3 -left-3 sm:-left-6 bg-white rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-card animate-float hidden sm:block">
              <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-pink-pale flex items-center justify-center shrink-0"><ShieldCheck className="w-3.5 h-3.5 text-pink" /></div><div><div className="text-[10px] font-bold text-gray-800 leading-none">100% Secure</div><div className="text-[8.5px] text-gray-400 leading-none mt-0.5">Protected Payments</div></div></div>
            </div>
          </div>
        </div>

        {/* Bottom trust strip — matches reference image bottom bar */}
        <div className="mt-10 sm:mt-14 rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg,#e8267a,#f04d96)" }}>
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/20">
            {[{ icon: ShieldCheck, label: "Secure Payment" }, { icon: Truck, label: "Fast Delivery" }, { icon: Headphones, label: "24/7 Support" }].map(({ icon: Icon, label }) => (
              <div key={label} className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4">
                <Icon className="w-4 h-4 text-white shrink-0" />
                <span className="text-white text-[12.5px] sm:text-[13px] font-bold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
