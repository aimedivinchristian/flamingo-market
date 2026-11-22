"use client";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Mail, Phone, MapPin, MessageCircle, CheckCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [message, setMessage] = useState(""); const [sending, setSending] = useState(false); const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) { toast.error("Please fill in all fields"); return; }
    setSending(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, message }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Could not send message"); return; }
      setSent(true);
    } catch { toast.error("Network error. Please try again."); }
    finally { setSending(false); }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[1000px] mx-auto px-5 py-14">
        <div className="text-center mb-10">
          <h1 className="text-[2rem] font-extrabold text-gray-800 tracking-tight mb-2">Get in Touch</h1>
          <p className="text-gray-400 text-[14px]">We&apos;re here to help with orders, seller questions, or anything else.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Mail, label: "Email", value: "support@flamingo.rw", href: "mailto:support@flamingo.rw" },
            { icon: Phone, label: "Phone", value: "+250 788 000 000", href: "tel:+250788000000" },
            { icon: MapPin, label: "Office", value: "Kigali, Rwanda", href: null },
          ].map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <div className="w-11 h-11 bg-pink-pale rounded-2xl flex items-center justify-center mx-auto mb-3"><Icon className="w-5 h-5 text-pink" /></div>
              <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">{label}</div>
              {href ? <a href={href} className="text-[13.5px] font-bold text-gray-800 hover:text-pink transition-colors">{value}</a> : <div className="text-[13.5px] font-bold text-gray-800">{value}</div>}
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)] max-w-[560px] mx-auto">
          {sent ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-7 h-7 text-green-500" /></div>
              <h3 className="text-[17px] font-extrabold text-gray-800 mb-2">Message Sent!</h3>
              <p className="text-[13px] text-gray-400">We&apos;ll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 text-pink font-extrabold text-[15px] mb-2"><MessageCircle className="w-4 h-4" />Send us a message</div>
              <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Your Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Alice Uwimana" className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all" /></div>
              <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Email Address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all" /></div>
              <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Message</label><textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="How can we help?" className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all resize-none" /></div>
              <button type="submit" disabled={sending} className="w-full bg-gradient-pink text-white font-bold text-[14px] py-3 rounded-full shadow-pink hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60">{sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : "Send Message"}</button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
