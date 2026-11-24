"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle } from "lucide-react";

function ResetInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [email] = useState(params.get("email") || "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { toast.error("Missing email — go back and request a new code"); return; }
    if (code.trim().length < 6) { toast.error("Enter the 6-digit code from your email"); return; }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) { toast.error("Password needs 8+ characters with letters and numbers"); return; }
    if (password !== confirmPw) { toast.error("Passwords don't match"); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code: code.trim(), newPassword: password }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setDone(true);
      toast.success("Password reset! You can now sign in.");
    } finally { setSubmitting(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg,#fff5f9 0%,#f0f8ff 100%)" }}>
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
            <img src="/flamingo-logo.png" alt="Flamingo Market" className="w-9 h-9 object-contain" />
            <span className="font-extrabold text-xl text-pink">FLAMINGO MARKET</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-800 mb-1">Set a new password</h1>
          <p className="text-gray-400 text-sm">Enter the code sent to {email || "your email"}</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-card border border-gray-100">
          {done ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-7 h-7 text-green-500" /></div>
              <h2 className="text-[16px] font-extrabold text-gray-800 mb-2">Password Reset!</h2>
              <Link href="/login" className="inline-flex items-center gap-2 bg-gradient-pink text-white font-bold text-[13.5px] px-6 py-2.5 rounded-full shadow-pink hover:opacity-90 transition-all mt-2">Sign In Now</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Reset Code</label><input value={code} onChange={e => setCode(e.target.value)} maxLength={6} placeholder="6-digit code" className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all font-mono tracking-widest text-center" /></div>
              <div>
                <label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">New Password</label>
                <div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full pl-10 pr-10 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all" /><button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
              </div>
              <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Confirm Password</label><input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat password" className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all" /></div>
              <button type="submit" disabled={submitting} className="w-full bg-gradient-pink text-white font-bold text-[14px] py-3 rounded-full shadow-pink hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">{submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting…</> : "Reset Password"}</button>
            </form>
          )}
        </div>
        <Link href="/forgot-password" className="flex items-center gap-1.5 text-gray-400 text-[13px] font-semibold hover:text-pink transition-colors justify-center mt-5"><ArrowLeft className="w-3.5 h-3.5" /> Request a new code</Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() { return <Suspense><ResetInner /></Suspense>; }
