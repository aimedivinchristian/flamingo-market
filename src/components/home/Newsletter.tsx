"use client";
import { useState } from "react";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim() }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Something went wrong"); return; }
      setSubscribed(true);
      toast.success(data.alreadySubscribed ? "You're already subscribed!" : "Subscribed! Thanks for joining.");
    } finally { setSubmitting(false); }
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-[640px] mx-auto px-5 text-center">
        <div className="w-14 h-14 bg-pink-pale rounded-2xl flex items-center justify-center mx-auto mb-5"><Mail className="w-6 h-6 text-pink" /></div>
        <h2 className="section-title mb-2">Stay in the Loop</h2>
        <p className="text-gray-500 text-[13.5px] mb-6">Get exclusive deals, new arrivals, and marketplace updates straight to your inbox.</p>
        {subscribed ? (
          <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-[14px]"><CheckCircle className="w-5 h-5" />Thanks for subscribing!</div>
        ) : (
          <form onSubmit={subscribe} className="flex gap-2 max-w-[420px] mx-auto">
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="your@email.com" required
              className="flex-1 px-4 py-3 border-[1.5px] border-gray-200 rounded-full text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all bg-white" />
            <button type="submit" disabled={submitting} className="bg-gradient-pink text-white font-bold text-[13.5px] px-6 py-3 rounded-full shadow-pink hover:opacity-90 transition-all whitespace-nowrap disabled:opacity-60 flex items-center gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
