"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface BannerItem { id: string; title: string; subtitle: string | null; image: string; link: string | null }

export function BannerCarousel({ banners }: { banners: BannerItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => {
      const el = ref.current; if (!el || document.hidden) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % banners.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, 5000);
    return () => clearInterval(t);
  }, [banners.length]);
  function onScroll() { const el = ref.current; if (el) setIdx(Math.round(el.scrollLeft / el.clientWidth)); }
  return (
    <section className="max-w-[1280px] mx-auto px-3 sm:px-5 pt-3 sm:pt-5">
      <div className="relative">
        <div ref={ref} onScroll={onScroll} className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide rounded-2xl sm:rounded-3xl">
          {banners.map(b => {
            const inner = (
              <div className="relative w-full aspect-[16/7] sm:aspect-[16/5] bg-pink-pale">
                <img src={b.image} alt={b.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent" />
                <div className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 max-w-[70%] text-white">
                  <div className="font-extrabold leading-tight text-[1.05rem] sm:text-[2rem]">{b.title}</div>
                  {b.subtitle && <div className="text-[12px] sm:text-[15px] opacity-90 mt-1 line-clamp-2">{b.subtitle}</div>}
                </div>
              </div>
            );
            return <div key={b.id} className="snap-center shrink-0 w-full">{b.link ? <Link href={b.link} className="block">{inner}</Link> : inner}</div>;
          })}
        </div>
        {banners.length > 1 && <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">{banners.map((b, i) => <span key={b.id} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-white" : "w-1.5 bg-white/60"}`} />)}</div>}
      </div>
    </section>
  );
}
