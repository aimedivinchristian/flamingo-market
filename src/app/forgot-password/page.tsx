"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { toast.error("Enter your email address"); return; }
    setSending(true);
    try {
      const res = await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim() }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Something went wrong"); return; }
      setSent(true);
      toast.success("If that email exists, a reset code has been sent.");
    } finally { setSending(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg,#fff5f9 0%,#f0f8ff 100%)" }}>
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
            <img src="/flamingo-logo.png" alt="Flamingo Market" className="w-9 h-9 object-contain" />
            <span className="font-extrabold text-xl text-pink">FLAMINGO MARKET</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-800 mb-1">Reset your password</h1>
          <p className="text-gray-400 text-sm">Enter your email and we&apos;ll send you a reset code</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-card border border-gray-100">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-pink-pale rounded-2xl flex items-center justify-center mx-auto mb-4"><Mail className="w-6 h-6 text-pink" /></div>
              <h2 className="text-[16px] font-extrabold text-gray-800 mb-2">Check your email</h2>
              <p className="text-[13px] text-gray-400 mb-5">If an account exists for <strong>{email}</strong>, a 6-digit code has been sent.</p>
              <Link href={`/reset-password?email=${encodeURIComponent(email)}`} className="inline-flex items-center gap-2 bg-gradient-pink text-white font-bold text-[13.5px] px-6 py-2.5 rounded-full shadow-pink hover:opacity-90 transition-all">Enter Reset Code</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Email Address</label>
                <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-10 pr-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all placeholder:text-gray-300" /></div>
              </div>
              <button type="submit" disabled={sending} className="w-full bg-gradient-pink text-white font-bold text-[14px] py-3 rounded-full shadow-pink hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">{sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : "Send Reset Code"}</button>
            </form>
          )}
        </div>

        <button onClick={() => router.push("/login")} className="flex items-center gap-1.5 text-gray-400 text-[13px] font-semibold hover:text-pink transition-colors mx-auto mt-5"><ArrowLeft className="w-3.5 h-3.5" /> Back to login</button>
      </div>
    </div>
  );
}
