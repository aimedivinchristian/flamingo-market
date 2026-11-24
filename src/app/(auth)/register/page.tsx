"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { User, Mail, Lock, Store, ShoppingBag, Eye, EyeOff, ArrowLeft, RefreshCw, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
const detailsSchema = z.object({ name: z.string().min(2, "Name must be at least 2 characters"), email: z.string().email("Please enter a valid email address"), password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Za-z]/, "Add at least one letter").regex(/\d/, "Add at least one number"), confirmPassword: z.string(), role: z.enum(["BUYER","SELLER"]) }).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });
type DetailsForm = z.infer<typeof detailsSchema>;
function OtpInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) { if (e.key === "Backspace") { if (value[i]) { const next = [...value]; next[i] = ""; onChange(next); } else if (i > 0) (document.getElementById(`otp-${i-1}`) as HTMLInputElement)?.focus(); } }
  function handleChange(i: number, raw: string) { const char = raw.replace(/\D/g, "").slice(-1); const next = [...value]; next[i] = char; onChange(next); if (char && i < 5) (document.getElementById(`otp-${i+1}`) as HTMLInputElement)?.focus(); }
  function handlePaste(e: React.ClipboardEvent) { e.preventDefault(); const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6); if (!pasted) return; const next = Array(6).fill(""); pasted.split("").forEach((c, i) => { next[i] = c; }); onChange(next); (document.getElementById(`otp-${Math.min(pasted.length,5)}`) as HTMLInputElement)?.focus(); }
  return (
    <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
      {value.map((digit, i) => (<input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKey(i, e)} className={cn("w-12 h-14 text-center text-[1.4rem] font-extrabold border-[2px] rounded-xl outline-none transition-all", digit ? "border-pink bg-pink-pale text-pink shadow-[0_0_0_3px_rgba(232,38,122,0.1)]" : "border-gray-200 bg-white text-gray-800 focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)]")} />))}
    </div>
  );
}
export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"details"|"otp"|"done">("details"); const [showPw, setShowPw] = useState(false); const [sending, setSending] = useState(false); const [verifying, setVerifying] = useState(false); const [resending, setResending] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill("")); const [countdown, setCountdown] = useState(0); const [savedEmail, setSavedEmail] = useState(""); const [savedRole, setSavedRole] = useState<"BUYER"|"SELLER">("BUYER");
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<DetailsForm>({ resolver: zodResolver(detailsSchema), defaultValues: { role: "BUYER" } });
  const role = watch("role");
  async function onDetails(data: DetailsForm) {
    setSending(true);
    try { const res = await fetch("/api/auth/send-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); const json = await res.json(); if (!res.ok) { toast.error(json.error); return; } setSavedEmail(data.email); setSavedRole(data.role); toast.success("Verification code sent to your email!"); setStep("otp"); startCountdown(); } finally { setSending(false); }
  }
  function startCountdown() { setCountdown(60); const t = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000); }
  async function onVerify() {
    const code = otp.join(""); if (code.length < 6) { toast.error("Please enter all 6 digits"); return; }
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: savedEmail, code }) });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error); setOtp(Array(6).fill("")); document.getElementById("otp-0")?.focus(); return; }
      const pw = (document.getElementById("hidden-pw") as HTMLInputElement)?.value;
      setStep("done"); await new Promise(r => setTimeout(r, 1200));
      const signInRes = await signIn("credentials", { email: savedEmail, password: pw, redirect: false });
      if (signInRes?.ok) { router.push(savedRole === "SELLER" ? "/become-seller" : "/marketplace"); router.refresh(); } else { router.push("/login"); }
    } finally { setVerifying(false); }
  }
  async function onResend() {
    setResending(true);
    try { const res = await fetch("/api/auth/send-otp/resend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: savedEmail }) }); const json = await res.json(); if (!res.ok) { toast.error(json.error); return; } toast.success("New code sent to your email!"); setOtp(Array(6).fill("")); startCountdown(); document.getElementById("otp-0")?.focus(); } finally { setResending(false); }
  }
  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12" style={{ background: "linear-gradient(135deg,#fff5f9 0%,#f0f8ff 100%)" }}>
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-7"><Link href="/" className="inline-flex items-center gap-2.5 mb-5"><img src="/flamingo-logo.png" alt="Flamingo Market" className="w-9 h-9 object-contain" /><span className="font-extrabold text-xl text-pink">FLAMINGO MARKET</span></Link></div>
        {step === "details" && (
          <>
            <div className="text-center mb-6"><h1 className="text-2xl font-extrabold text-gray-800 mb-1">Create your account</h1><p className="text-gray-400 text-sm">Join thousands of buyers and sellers in Rwanda</p></div>
            <div className="bg-white rounded-3xl p-7 shadow-card border border-gray-100">
              <div className="grid grid-cols-2 gap-3 mb-5">
                {([{ v:"BUYER", Icon: ShoppingBag, label:"I want to buy", sub:"Browse & order" }, { v:"SELLER", Icon: Store, label:"I want to sell", sub:"Needs admin approval" }] as { v:"BUYER"|"SELLER"; Icon: any; label: string; sub: string }[]).map(({ v, Icon, label, sub }) => (
                  <button key={v} type="button" onClick={() => setValue("role", v)} className={cn("flex flex-col items-center gap-1 p-4 rounded-2xl border-[1.5px] transition-all", role === v ? "border-pink bg-pink-pale" : "border-gray-200 hover:border-gray-300")}><Icon className={cn("w-5 h-5", role === v ? "text-pink" : "text-gray-400")} /><span className={cn("text-[13px] font-bold", role === v ? "text-pink" : "text-gray-700")}>{label}</span><span className="text-[10.5px] text-gray-400">{sub}</span></button>
                ))}
              </div>
              <form onSubmit={handleSubmit(onDetails)} className="space-y-4">
                <input type="hidden" id="hidden-pw" {...register("password")} />
                <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Full Name</label><div className="relative"><User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input placeholder="e.g. Alice Uwimana" className="w-full pl-10 pr-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all placeholder:text-gray-300" {...register("name")} /></div>{errors.name && <p className="text-[11px] text-red-400 mt-1">{errors.name.message}</p>}</div>
                <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Email Address</label><div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input type="email" placeholder="you@example.com" className="w-full pl-10 pr-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all placeholder:text-gray-300" {...register("email")} /></div>{errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email.message}</p>}</div>
                <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Password</label><div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input id="pw-field" type={showPw ? "text" : "password"} placeholder="At least 6 characters" className="w-full pl-10 pr-10 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all placeholder:text-gray-300" {...register("password")} onChange={e => { register("password").onChange(e); const hidden = document.getElementById("hidden-pw") as HTMLInputElement; if (hidden) hidden.value = e.target.value; }} /><button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>{errors.password && <p className="text-[11px] text-red-400 mt-1">{errors.password.message}</p>}</div>
                <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Confirm Password</label><div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input type="password" placeholder="Repeat your password" className="w-full pl-10 pr-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all placeholder:text-gray-300" {...register("confirmPassword")} /></div>{errors.confirmPassword && <p className="text-[11px] text-red-400 mt-1">{errors.confirmPassword.message}</p>}</div>
                <button type="submit" disabled={sending} className="w-full bg-gradient-pink text-white font-bold text-[14px] py-3 rounded-full shadow-pink hover:opacity-90 transition-all hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2 mt-1">{sending ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending code…</> : <>Continue — Verify Email<Mail className="w-4 h-4" /></>}</button>
                <p className="text-center text-[11.5px] text-gray-400 leading-relaxed">By signing up you agree to our <Link href="/terms" className="text-pink hover:underline font-semibold">Terms</Link> and <Link href="/privacy" className="text-pink hover:underline font-semibold">Privacy Policy</Link>.</p>
              </form>
            </div>
            <p className="text-center text-sm text-gray-400 mt-5">Already have an account? <Link href="/login" className="text-pink font-bold hover:underline">Sign in</Link></p>
          </>
        )}
        {step === "otp" && (
          <>
            <div className="text-center mb-6"><div className="w-14 h-14 bg-pink-pale border-2 border-pink-pale2 rounded-2xl flex items-center justify-center mx-auto mb-4"><Mail className="w-6 h-6 text-pink" /></div><h1 className="text-[1.5rem] font-extrabold text-gray-800 mb-1">Check your email</h1><p className="text-gray-400 text-sm">We sent a 6-digit code to</p><p className="font-bold text-gray-700 text-[13.5px] mt-0.5">{savedEmail}</p></div>
            <div className="bg-white rounded-3xl p-7 shadow-card border border-gray-100">
              <div className="mb-6"><p className="text-center text-[12px] font-semibold text-gray-400 mb-4 uppercase tracking-wider">Enter 6-digit code</p><OtpInput value={otp} onChange={setOtp} /></div>
              <button onClick={onVerify} disabled={verifying || otp.join("").length < 6} className="w-full bg-gradient-pink text-white font-bold text-[14px] py-3 rounded-full shadow-pink hover:opacity-90 transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2 mb-5">{verifying ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying…</> : "Verify Email"}</button>
              <div className="text-center"><p className="text-[12.5px] text-gray-400 mb-2">Didn&apos;t receive the code?</p>{countdown > 0 ? <p className="text-[12.5px] text-gray-400">Resend in <span className="font-bold text-pink">{countdown}s</span></p> : <button onClick={onResend} disabled={resending} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-pink hover:underline disabled:opacity-60 transition-colors"><RefreshCw className={cn("w-3.5 h-3.5", resending && "animate-spin")} />{resending ? "Sending…" : "Resend Code"}</button>}</div>
              <div className="mt-5 h-1 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-pink rounded-full transition-all duration-1000" style={{ width: `${(otp.filter(Boolean).length / 6) * 100}%` }} /></div>
            </div>
            <button onClick={() => setStep("details")} className="flex items-center gap-1.5 text-gray-400 text-[13px] font-semibold hover:text-pink transition-colors mx-auto mt-5"><ArrowLeft className="w-3.5 h-3.5" /> Back to details</button>
          </>
        )}
        {step === "done" && (
          <div className="bg-white rounded-3xl p-10 shadow-card border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5"><CheckCircle className="w-9 h-9 text-green-500" /></div>
            <h2 className="text-[1.5rem] font-extrabold text-gray-800 mb-2">Email Verified!</h2><p className="text-gray-400 text-sm mb-1">Your account has been created successfully.</p><p className="text-gray-400 text-sm">Signing you in automatically…</p>
            <div className="mt-6 flex justify-center gap-1.5">{[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-pink rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
