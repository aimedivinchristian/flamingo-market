"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useT } from "@/lib/i18n";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const schema = z.object({
  email:    z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});
type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const t = useT();
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setLoading(true);
    const res = await signIn("credentials", { ...data, redirect: false });
    setLoading(false);
    if (res?.error) {
      const msg: Record<string, string> = { EMAIL_NOT_VERIFIED: "Please verify your email first. Register again to get a new code.", ACCOUNT_SUSPENDED: "This account is suspended. Contact support.", TOO_MANY_ATTEMPTS: "Too many attempts. Please wait a few minutes and try again." };
      toast.error(msg[res.error] || "Invalid email or password"); return;
    }
    toast.success("Welcome back!");
    router.push("/"); router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg,#fff5f9 0%,#f0f8ff 100%)" }}>
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <img src="/flamingo-logo.png" alt="Flamingo Market" className="w-9 h-9 object-contain" />
            <span className="font-extrabold text-xl text-pink">FLAMINGO MARKET</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-flamingo-dark mb-1">{t("auth.welcomeBack")}</h1>
          <p className="text-gray-400 text-sm">{t("auth.signInSub")}</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-card border border-gray-100">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 border-[1.5px] border-gray-200 rounded-2xl py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[11px] text-gray-400 font-semibold">OR</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="email" placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all placeholder:text-gray-300"
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type={showPw ? "text" : "password"} placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all placeholder:text-gray-300"
                  {...register("password")}
                />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-red-400 mt-1">{errors.password.message}</p>}
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-[12px] text-pink font-semibold hover:underline">{t("auth.forgot")}</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-pink text-white font-bold text-sm py-3 rounded-full shadow-pink hover:opacity-90 transition-all hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Sign In
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-pink font-bold hover:underline">{t("auth.createOne")}</Link>
        </p>
      </div>
    </div>
  );
}
