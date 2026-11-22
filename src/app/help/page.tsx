"use client";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { ChevronDown, HelpCircle, Mail, Package, CreditCard, Store, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_SECTIONS = [
  {
    icon: Package, title: "Orders",
    items: [
      { q: "How do I track my order?", a: "Go to your Buyer Dashboard and click 'Track Order' on any order to see its live status and delivery timeline." },
      { q: "Can I cancel an order?", a: "You can cancel an order while it's still in 'Pending' status from your dashboard. Once a seller confirms it, cancellation must go through support." },
      { q: "What if my order never arrives?", a: "Contact us via the Contact page with your order number and we'll investigate with the seller and delivery partner." },
    ],
  },
  {
    icon: CreditCard, title: "Payments",
    items: [
      { q: "What payment methods are accepted?", a: "MTN Mobile Money, Airtel Money, card payments via Stripe (Visa/Mastercard), and Cash on Delivery in supported areas." },
      { q: "Is my payment information safe?", a: "Yes. We never store your full card details — payments are processed directly by Stripe and mobile money providers using bank-grade encryption." },
    ],
  },
  {
    icon: Store, title: "Selling",
    items: [
      { q: "How do I become a seller?", a: "Register with the 'I want to sell' option, verify your email, and you can start listing products immediately from your Seller Dashboard." },
      { q: "What's the commission rate?", a: "Flamingo Market takes a 10% commission on completed, delivered orders. See our Fees page for full details." },
      { q: "When do I get paid?", a: "Once an order is marked Delivered, funds become available in your Earnings dashboard. You can request a withdrawal any time above RWF 5,000." },
    ],
  },
  {
    icon: Truck, title: "Delivery",
    items: [
      { q: "How fast is delivery?", a: "Same-day delivery is available in Kigali for orders placed before 12PM. Other areas typically take 1–3 business days." },
      { q: "Is delivery free?", a: "Orders over RWF 30,000 qualify for free delivery. Below that, a flat delivery fee of RWF 2,000 applies." },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between py-4 text-left">
        <span className="text-[13.5px] font-semibold text-gray-800 pr-4">{q}</span>
        <ChevronDown className={cn("w-4 h-4 text-gray-400 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && <p className="text-[13px] text-gray-500 leading-relaxed pb-4 pr-8">{a}</p>}
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[820px] mx-auto px-5 py-14">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-pink-pale rounded-2xl flex items-center justify-center mx-auto mb-4"><HelpCircle className="w-6 h-6 text-pink" /></div>
          <h1 className="text-[2rem] font-extrabold text-gray-800 tracking-tight mb-2">Help Center</h1>
          <p className="text-gray-400 text-[14px]">Answers to common questions about orders, payments, and selling.</p>
        </div>

        <div className="space-y-4">
          {FAQ_SECTIONS.map(({ icon: Icon, title, items }) => (
            <div key={title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2.5 mb-1"><div className="w-8 h-8 bg-pink-pale rounded-xl flex items-center justify-center"><Icon className="w-4 h-4 text-pink" /></div><h2 className="text-[15px] font-extrabold text-gray-800">{title}</h2></div>
              <div>{items.map(item => <FAQItem key={item.q} q={item.q} a={item.a} />)}</div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 mt-4 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <p className="text-[13px] text-gray-500 mb-3">Still need help?</p>
          <Link href="/contact" className="inline-flex items-center gap-2 text-[13px] font-bold text-white bg-gradient-pink px-6 py-2.5 rounded-full shadow-pink hover:opacity-90 transition-all"><Mail className="w-4 h-4" /> Contact Support</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
