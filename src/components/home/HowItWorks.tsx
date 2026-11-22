import { Search, ShoppingCart, CreditCard, Truck } from "lucide-react";

const STEPS = [
  { num: "01", Icon: Search,       color: "pink", title: "Browse & Search",  desc: "Explore thousands of products from verified sellers across all categories with smart search and filters." },
  { num: "02", Icon: ShoppingCart, color: "cyan", title: "Add to Cart",      desc: "Add your favourite items, compare prices across sellers, and choose the best deals for your budget." },
  { num: "03", Icon: CreditCard,   color: "pink", title: "Pay Securely",     desc: "Pay with MTN Mobile Money, Airtel Money, credit card, or PayPal. 100% secure transactions." },
  { num: "04", Icon: Truck,        color: "cyan", title: "Fast Delivery",    desc: "Track your order in real-time. Same-day delivery in Kigali and next-day delivery nationwide." },
];

export function HowItWorks() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="mb-8">
          <span className="section-label">How It Works</span>
          <h2 className="section-title">Simple. Fast. Reliable.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map(({ num, Icon, color, title, desc }) => (
            <div key={num} className="relative bg-white border-[1.5px] border-gray-200 rounded-2xl p-7 transition-all duration-250 hover:border-pink-pale2 hover:shadow-card hover:-translate-y-1 overflow-hidden">
              <div className="absolute right-4 top-3 text-[52px] font-black text-gray-100 leading-none select-none pointer-events-none">
                {num}
              </div>
              <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${color === "cyan" ? "bg-cyan-light" : "bg-pink-pale"}`}>
                <Icon className={`w-5 h-5 ${color === "cyan" ? "text-cyan" : "text-pink"}`} />
              </div>
              <div className="font-extrabold text-[14px] text-gray-800 mb-1.5">{title}</div>
              <div className="text-[12.5px] text-gray-500 leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
