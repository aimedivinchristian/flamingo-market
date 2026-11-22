import Link from "next/link";
import { Shirt, Smartphone } from "lucide-react";

export function PromoBanners() {
  return (
    <section className="py-14 bg-white">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Fashion */}
          <Link
            href="/marketplace?category=fashion"
            className="relative overflow-hidden rounded-3xl p-10 block transition-transform duration-300 hover:scale-[1.015]"
            style={{ background: "linear-gradient(135deg,#fff0f7 0%,#ffd6eb 60%,#ffb8d9 100%)", minHeight: 210 }}
          >
            <div className="absolute top-0 right-0 w-52 h-52 rounded-full opacity-40 -translate-y-1/4 translate-x-1/4"
              style={{ background: "radial-gradient(circle,#ff8dc7,transparent)" }} />
            {/* Visual placeholder */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 w-28 h-28 rounded-2xl overflow-hidden shadow-card flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#ffb8d9,#ff8dc7)" }}>
              <Shirt className="w-14 h-14 text-white opacity-80" />
            </div>
            <div className="relative z-10 max-w-[55%]">
              <div className="text-[11px] font-bold uppercase tracking-widest text-pink mb-1.5">Limited Offer</div>
              <h3 className="text-[1.55rem] font-extrabold text-flamingo-dark leading-tight mb-2 tracking-tight">Fashion Week</h3>
              <p className="text-[13px] text-gray-500 mb-5">Up to 40% off on premium African fashion</p>
              <span className="inline-flex items-center gap-2 bg-pink text-white text-[13px] font-bold px-5 py-2.5 rounded-full shadow-pink hover:opacity-90 transition-opacity">
                Shop Now
              </span>
            </div>
          </Link>

          {/* Electronics */}
          <Link
            href="/marketplace?category=electronics"
            className="relative overflow-hidden rounded-3xl p-10 block transition-transform duration-300 hover:scale-[1.015]"
            style={{ background: "linear-gradient(135deg,#f0faff 0%,#c8eeff 60%,#a0e0ff 100%)", minHeight: 210 }}
          >
            <div className="absolute top-0 right-0 w-52 h-52 rounded-full opacity-40 -translate-y-1/4 translate-x-1/4"
              style={{ background: "radial-gradient(circle,#33d6ff,transparent)" }} />
            <div className="absolute right-8 top-1/2 -translate-y-1/2 w-28 h-28 rounded-2xl overflow-hidden shadow-card flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#a0e0ff,#33d6ff)" }}>
              <Smartphone className="w-14 h-14 text-white opacity-80" />
            </div>
            <div className="relative z-10 max-w-[55%]">
              <div className="text-[11px] font-bold uppercase tracking-widest text-cyan mb-1.5">New Arrivals</div>
              <h3 className="text-[1.55rem] font-extrabold text-flamingo-dark leading-tight mb-2 tracking-tight">Tech Zone</h3>
              <p className="text-[13px] text-gray-500 mb-5">Latest gadgets from verified tech sellers</p>
              <span className="inline-flex items-center gap-2 bg-cyan text-white text-[13px] font-bold px-5 py-2.5 rounded-full shadow-[0_6px_20px_rgba(13,184,212,0.25)] hover:opacity-90 transition-opacity">
                Explore Now
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
