"use client";
import { useState } from "react";
import { StarRating } from "./StarRating";
import toast from "react-hot-toast";
import { X, Loader2, PenLine } from "lucide-react";
interface Props { productId: string; orderId: string; productName: string; onClose: () => void; onSubmitted: () => void; }
export function ReviewModal({ productId, orderId, productName, onClose, onSubmitted }: Props) {
  const [rating, setRating] = useState(0); const [title, setTitle] = useState(""); const [body, setBody] = useState(""); const [submitting, setSubmitting] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) { toast.error("Please choose a star rating"); return; }
    if (!body.trim()) { toast.error("Please write a review"); return; }
    setSubmitting(true);
    try { const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, orderId, rating, title: title.trim() || null, body: body.trim() }) }); const data = await res.json(); if (!res.ok) { toast.error(data.error); return; } onSubmitted(); } finally { setSubmitting(false); }
  }
  const LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent!"];
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-[0_24px_80px_rgba(0,0,0,0.15)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"><div className="flex items-center gap-2 text-pink font-extrabold text-[15px]"><PenLine className="w-4 h-4" />Review Product</div><button onClick={onClose} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-pink hover:text-pink transition-all"><X className="w-4 h-4" /></button></div>
        <form onSubmit={submit} className="p-6 space-y-5">
          <div className="bg-pink-pale border border-pink-pale2 rounded-xl px-4 py-2.5"><div className="text-[10.5px] text-pink font-bold uppercase tracking-wider mb-0.5">Reviewing</div><div className="text-[13px] font-bold text-gray-800 line-clamp-1">{productName}</div></div>
          <div><label className="block text-[12.5px] font-bold text-gray-600 mb-2">Your Rating *</label><div className="flex items-center gap-3"><StarRating value={rating} onChange={setRating} size="lg" />{rating > 0 && <span className="text-[13px] font-bold text-amber-500">{LABELS[rating]}</span>}</div></div>
          <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Title <span className="text-gray-400 font-normal">(optional)</span></label><input value={title} onChange={e => setTitle(e.target.value)} maxLength={80} placeholder="Sum up your experience…" className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all" /></div>
          <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Your Review *</label><textarea value={body} onChange={e => setBody(e.target.value)} rows={4} maxLength={1000} placeholder="Quality, delivery speed, packaging, would you recommend it?" className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all resize-none" /><div className="text-right text-[10.5px] text-gray-300 mt-0.5">{body.length}/1000</div></div>
          <div className="flex gap-3"><button type="submit" disabled={submitting || !rating} className="flex-1 bg-gradient-pink text-white font-bold text-[14px] py-3 rounded-full shadow-pink hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50">{submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : "Publish Review"}</button><button type="button" onClick={onClose} className="px-5 py-3 border-[1.5px] border-gray-200 text-gray-600 font-semibold text-sm rounded-full hover:border-pink hover:text-pink transition-all">Cancel</button></div>
        </form>
      </div>
    </div>
  );
}
