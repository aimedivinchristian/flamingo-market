import Link from "next/link";
import { Instagram, Twitter, Facebook, MessageCircle } from "lucide-react";

const LINKS = {
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Careers",  href: "/careers" },
    { label: "Press",    href: "/press" },
    { label: "Blog",     href: "/blog" },
    { label: "Contact",  href: "/contact" },
  ],
  "Sell on Flamingo": [
    { label: "Become a Seller", href: "/register?role=SELLER" },
    { label: "Seller Center",   href: "/seller-center" },
    { label: "Seller Guide",    href: "/seller-guide" },
    { label: "Fees",            href: "/fees" },
    { label: "Promotions",      href: "/promotions" },
  ],
  Support: [
    { label: "Help Center",       href: "/help" },
    { label: "Returns & Refunds", href: "/returns" },
    { label: "Track Order",       href: "/track-order" },
    { label: "Privacy Policy",    href: "/privacy" },
    { label: "Terms of Service",  href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-white/70">
      <div className="max-w-[1280px] mx-auto px-5 pt-14 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <img src="/flamingo-logo.png" alt="Flamingo Market" className="w-7 h-7 object-contain" />
              <span className="font-extrabold text-[15px] text-white tracking-tight">FLAMINGO MARKET</span>
            </div>
            <p className="text-[13px] text-white/50 leading-relaxed mb-5">Africa&apos;s premier multi-vendor marketplace. Connecting buyers and sellers across Rwanda and beyond.</p>
            <div className="flex gap-2">
              {[Instagram, Twitter, Facebook, MessageCircle].map((Icon, i) => (
                <a key={i} href="/contact" className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:border-pink hover:text-pink transition-all"><Icon className="w-4 h-4" /></a>
              ))}
            </div>
          </div>
          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <h4 className="text-[13px] font-bold text-white mb-4">{heading}</h4>
              <ul className="space-y-2.5">
                {items.map(item => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-[12.5px] text-white/50 hover:text-pink transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[12px] text-white/30">© 2026 Flamingo Market Ltd. All rights reserved. Made with care in Rwanda.</span>
          <div className="flex gap-2 flex-wrap justify-center">
            {["MTN MoMo","Airtel Money","Stripe","PayPal","Visa"].map(p => (<span key={p} className="text-[10.5px] px-2.5 py-1 border border-white/10 rounded-lg text-white/40 font-bold">{p}</span>))}
          </div>
        </div>
      </div>
    </footer>
  );
}
