"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import toast from "react-hot-toast";
import { Loader2, Store, Clock, CheckCircle, XCircle } from "lucide-react";

const INPUT = "w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink bg-white";
interface Info { role: string; sellerStatus: string | null; sellerApplication: string | null; sellerNote: string | null; phone: string | null }

export default function BecomeSellerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [info, setInfo] = useState<Info | null>(null);
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);
  async function load() {
    try { const r = await fetch("/api/seller/apply"); const d = await r.json(); if (r.ok) { setInfo(d); setApplication(d.sellerApplication ?? ""); setPhone(d.phone ?? ""); } } finally { setLoading(false); }
  }
  useEffect(() => { if (status === "authenticated") load(); }, [status]);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      const r = await fetch("/api/seller/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ application, phone }) });
      const d = await r.json(); if (!r.ok) { toast.error(d.error || "Failed"); return; }
      toast.success("Application sent"); setEditing(false); load();
    } finally { setBusy(false); }
  }
  if (!session) return null;
  const isSeller = info?.role === "SELLER" || info?.role === "ADMIN";
  const showForm = info && !isSeller && (!info.sellerStatus || info.sellerStatus === "REJECTED" || editing || (info.sellerStatus === "PENDING" && !info.sellerApplication));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[560px] mx-auto px-4 sm:px-5 py-8">
        {loading ? <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-pink" /></div> : !info ? <div className="text-center text-gray-400">Could not load.</div> : (
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8">
            <div className="w-12 h-12 rounded-2xl bg-pink-pale flex items-center justify-center mb-4"><Store className="w-6 h-6 text-pink" /></div>
            <h1 className="text-[1.4rem] font-extrabold text-gray-800 mb-1">Become a seller</h1>

            {isSeller && (<><p className="text-gray-500 text-[14px] mb-5 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> You&apos;re approved.</p><Link href="/seller" className="inline-block bg-gradient-pink text-white font-bold text-[14px] px-7 py-3 rounded-full shadow-pink">Open seller dashboard</Link></>)}

            {!isSeller && info.sellerStatus === "PENDING" && !showForm && (
              <>
                <p className="text-amber-600 bg-amber-50 rounded-xl px-4 py-3 text-[13.5px] font-semibold flex items-start gap-2 mb-4"><Clock className="w-4 h-4 mt-0.5 shrink-0" /> Your application is waiting for admin approval. We&apos;ll email you as soon as it&apos;s reviewed.</p>
                <p className="text-[12.5px] text-gray-400 whitespace-pre-wrap mb-4">{info.sellerApplication}</p>
                <button onClick={() => setEditing(true)} className="text-[13px] font-bold text-pink">Edit my application</button>
                <p className="text-[12px] text-gray-400 mt-4">Until then you can keep shopping as a buyer. After approval, sign out and in again.</p>
              </>
            )}

            {!isSeller && info.sellerStatus === "REJECTED" && !editing && (
              <p className="text-red-600 bg-red-50 rounded-xl px-4 py-3 text-[13.5px] font-semibold flex items-start gap-2 mb-4"><XCircle className="w-4 h-4 mt-0.5 shrink-0" /> Not approved{info.sellerNote ? `: ${info.sellerNote}` : "."} You can update your details and apply again below.</p>
            )}

            {showForm && (
              <form onSubmit={submit} className="space-y-3 mt-3">
                <p className="text-gray-500 text-[13.5px]">An admin reviews every seller before they can sell on Flamingo Market.</p>
                <textarea className={INPUT} rows={5} maxLength={1500} placeholder="Your business / store name and what you sell…" value={application} onChange={e => setApplication(e.target.value)} />
                <input className={INPUT} placeholder="Phone (MoMo) number" value={phone} onChange={e => setPhone(e.target.value)} />
                <button disabled={busy} className="w-full bg-gradient-pink text-white font-bold text-[14px] py-3 rounded-full shadow-pink disabled:opacity-60">{busy ? "Sending…" : info.sellerStatus ? "Submit application" : "Apply to sell"}</button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
