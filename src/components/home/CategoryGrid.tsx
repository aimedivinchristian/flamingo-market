"use client";
import Link from "next/link";
import {
  Shirt, Sparkles, Smartphone, Home, ShoppingCart,
  Watch, Droplets, Globe
} from "lucide-react";

const CATS = [
  { key: "fashion",     label: "Fashion",       Icon: Shirt,         count: "1.2K", color: "pink" },
  { key: "beauty",      label: "Beauty",        Icon: Sparkles,      count: "890",  color: "pink" },
  { key: "electronics", label: "Electronics",   Icon: Smartphone,    count: "654",  color: "cyan" },
  { key: "home",        label: "Home & Living", Icon: Home,          count: "432",  color: "pink" },
  { key: "supermarket", label: "Supermarket",   Icon: ShoppingCart,  count: "1.8K", color: "cyan" },
  { key: "accessories", label: "Accessories",   Icon: Watch,         count: "567",  color: "pink" },
  { key: "detergents",  label: "Detergents",    Icon: Droplets,      count: "234",  color: "cyan" },
  { key: "local",       label: "Local Crafts",  Icon: Globe,         count: "312",  color: "pink" },
];

export function CategoryGrid() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="flex items-end justify-between mb-7">
          <div>
            <span className="section-label">Browse Categories</span>
            <h2 className="section-title">Shop by Category</h2>
          </div>
          <Link href="/marketplace" className="text-sm font-semibold text-pink flex items-center gap-1 hover:gap-2 transition-all">
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATS.map(({ key, label, Icon, count, color }) => (
            <Link
              key={key}
              href={`/marketplace?category=${key}`}
              className="group bg-white border-[1.5px] border-gray-200 rounded-2xl p-4 text-center transition-all duration-250 hover:border-pink hover:shadow-[0_4px_20px_rgba(232,38,122,0.12)] hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl mx-auto mb-2.5 flex items-center justify-center
                ${color === "cyan" ? "bg-cyan-light" : "bg-pink-pale"}`}>
                <Icon className={`w-5 h-5 ${color === "cyan" ? "text-cyan" : "text-pink"}`} />
              </div>
              <div className="text-[12px] font-bold text-gray-800 group-hover:text-pink transition-colors leading-tight">{label}</div>
              <div className="text-[10.5px] text-gray-400 mt-0.5">{count}+ items</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
