"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { PushToggle } from "@/components/layout/PushToggle";
import { LOCALES, useI18n } from "@/lib/i18n";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const INPUT = "w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink bg-white";

export default function AccountPage() {
  const { status, update } = useSession();
  const router = useRouter();
  const { t, locale, setLocale } = useI18n();
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<{ email: string; role: string; hasPassword: boolean } | null>(null);
  const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  const [cur, setCur] = useState(""); const [next, setNext] = useState("");
  const [busy, setBusy] = useState<"" | "profile" | "pw">("");

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/account").then(r => r.json()).then(d => { if (!d.error) { setName(d.name); setPhone(d.phone ?? ""); setInfo({ email: d.email, role: d.role, hasPassword: d.hasPassword }); } }).finally(() => setLoading(false));
  }, [status]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault(); setBusy("profile");
    try { const r = await fetch("/api/account", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone }) }); const d = await r.json(); if (!r.ok) toast.error(d.error || "Failed"); else { toast.success("Saved"); update?.(); } } finally { setBusy(""); }
  }
  async function changePw(e: React.FormEvent) {
    e.preventDefault(); setBusy("pw");
    try { const r = await fetch("/api/account/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: cur, newPassword: next }) }); const d = await r.json(); if (!r.ok) toast.error(d.error || "Failed"); else { toast.success("Password changed"); setCur(""); setNext(""); } } finally { setBusy(""); }
  }
  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4"><h2 className="font-extrabold text-[15px] text-gray-800 mb-4">{title}</h2>{children}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[620px] mx-auto px-4 sm:px-5 py-6">
        <h1 className="text-[1.5rem] font-extrabold text-gray-800 mb-5">{t("acct.title")}</h1>
        {loading || !info ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-pink" /></div> : (
          <>
            <Card title={t("acct.profile")}>
              <form onSubmit={saveProfile} className="space-y-3">
                <div><label className="block text-[12.5px] font-bold text-gray-500 mb-1.5">{t("auth.email")}</label><input className={cn(INPUT, "bg-gray-50 text-gray-400")} value={info.email} disabled /></div>
                <div><label className="block text-[12.5px] font-bold text-gray-500 mb-1.5">{t("acct.name")}</label><input className={INPUT} value={name} onChange={e => setName(e.target.value)} maxLength={80} /></div>
                <div><label className="block text-[12.5px] font-bold text-gray-500 mb-1.5">{t("acct.phone")}</label><input className={INPUT} value={phone} onChange={e => setPhone(e.target.value)} maxLength={20} /></div>
                <button disabled={busy === "profile"} className="bg-gradient-pink text-white font-bold text-[13.5px] px-6 py-2.5 rounded-full shadow-pink disabled:opacity-60">{busy === "profile" ? "…" : t("acct.save")}</button>
              </form>
            </Card>
            <Card title={t("acct.appearance")}>
              <div className="flex items-center justify-between mb-4"><span className="text-[14px] text-gray-600">{t("acct.dark")}</span><ThemeToggle /></div>
              <div className="text-[12.5px] font-bold text-gray-500 mb-2">{t("acct.language")}</div>
              <div className="flex flex-wrap gap-2">{LOCALES.map(l => <button key={l.code} onClick={() => setLocale(l.code)} className={cn("px-4 py-2 rounded-full border-[1.5px] text-[13px] font-bold", locale === l.code ? "border-pink bg-pink-pale text-pink" : "border-gray-200 text-gray-500")}>{l.flag} {l.label}</button>)}</div>
            </Card>
            <Card title={t("acct.notifications")}><PushToggle /></Card>
            {info.hasPassword && (
              <Card title={t("acct.security")}>
                <form onSubmit={changePw} className="space-y-3">
                  <input type="password" autoComplete="current-password" className={INPUT} placeholder={t("acct.currentPw")} value={cur} onChange={e => setCur(e.target.value)} />
                  <input type="password" autoComplete="new-password" className={INPUT} placeholder={`${t("acct.newPw")} (8+, letters & numbers)`} value={next} onChange={e => setNext(e.target.value)} />
                  <button disabled={busy === "pw" || !cur || !next} className="border-[1.5px] border-gray-200 hover:border-pink hover:text-pink text-gray-600 font-bold text-[13.5px] px-6 py-2.5 rounded-full disabled:opacity-50">{busy === "pw" ? "…" : t("acct.changePw")}</button>
                </form>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
