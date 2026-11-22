"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { StarRating, RatingBadge } from "./StarRating";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { Loader2, Trash2, PenLine, ShieldCheck, AlertCircle } from "lucide-react";
interface Review { id: string; rating: number; title: string | null; body: string; createdAt: string; buyer: { id: string; name: string; image: string | null }; }
interface ReviewData { reviews: Review[]; total: number; avg: number; dist: { star: number; count: number; pct: number }[]; }
function WriteReviewForm({ productId, eligibleOrderId, onSubmitted }: { productId: string; eligibleOrderId: string; onSubmitted: () => void }) {
  const [rating, setRating] = useState(0); const [title, setTitle] = useState(""); const [body, setBody] = useState(""); const [submitting, setSubmitting] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) { toast.error("Please select a star rating"); return; }
    if (!body.trim()) { toast.error("Please write a review"); return; }
    setSubmitting(true);
    try { const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, orderId: eligibleOrderId, rating, title: title.trim() || null, body: body.trim() }) }); const data = await res.json(); if (!res.ok) { toast.error(data.error); return; } toast.success("Review published! Thank you."); onSubmitted(); } finally { setSubmitting(false); }
  }
  return (
    <form onSubmit={submit} className="bg-white border-[1.5px] border-pink-pale2 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 text-[13px] font-bold text-pink"><PenLine className="w-4 h-4" />Write a Review</div>
      <div><label className="block text-[12px] font-semibold text-gray-500 mb-2">Your Rating *</label><StarRating value={rating} onChange={setRating} size="lg" />{rating > 0 && <span className="text-[12px] text-gray-400 mt-1 block">{["","Poor","Fair","Good","Very Good","Excellent"][rating]}</span>}</div>
      <div><label className="block text-[12px] font-semibold text-gray-500 mb-1.5">Review Title <span className="text-gray-300">(optional)</span></label><input value={title} onChange={e => setTitle(e.target.value)} maxLength={80} placeholder="Summarise your experience…" className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all" /></div>
      <div><label className="block text-[12px] font-semibold text-gray-500 mb-1.5">Your Review *</label><textarea value={body} onChange={e => setBody(e.target.value)} rows={4} maxLength={1000} placeholder="What did you like or dislike? How was the quality, delivery, packaging?" className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all resize-none" /><div className="text-right text-[10.5px] text-gray-300 mt-0.5">{body.length}/1000</div></div>
      <button type="submit" disabled={submitting || !rating} className="w-full bg-gradient-pink text-white font-bold text-[13.5px] py-2.5 rounded-full shadow-pink hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50">{submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : "Submit Review"}</button>
    </form>
  );
}
function ReviewCard({ review, currentUserId, isAdmin, onDelete }: { review: Review; currentUserId: string | undefined; isAdmin: boolean; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);
  const canDelete = isAdmin || review.buyer.id === currentUserId;
  async function handleDelete() {
    if (!confirm("Delete this review?")) return;
    setDeleting(true);
    try { const res = await fetch(`/api/reviews/${review.id}`, { method: "DELETE" }); if (!res.ok) { toast.error("Failed to delete review"); return; } toast.success("Review deleted"); onDelete(review.id); } finally { setDeleting(false); }
  }
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-pink-pale2 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gradient-pink flex items-center justify-center text-white text-sm font-extrabold shrink-0">{review.buyer.name[0].toUpperCase()}</div><div><div className="text-[13px] font-bold text-gray-800">{review.buyer.name}</div><div className="text-[11px] text-gray-400">{formatDate(review.createdAt)}</div></div></div>
        <div className="flex items-center gap-2"><StarRating value={review.rating} size="sm" readonly />{canDelete && <button onClick={handleDelete} disabled={deleting} className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-300 hover:border-red-300 hover:text-red-400 transition-all ml-1">{deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}</button>}</div>
      </div>
      {review.title && <div className="font-bold text-[13.5px] text-gray-800 mb-1">{review.title}</div>}
      <p className="text-[13px] text-gray-600 leading-relaxed">{review.body}</p>
      <div className="flex items-center gap-1.5 mt-3 text-[11px] font-semibold text-green-600"><ShieldCheck className="w-3.5 h-3.5" />Verified Purchase</div>
    </div>
  );
}
export function ReviewSection({ productId, productName }: { productId: string; productName: string }) {
  const { data: session } = useSession();
  const [data, setData] = useState<ReviewData | null>(null); const [loading, setLoading] = useState(true);
  const [eligibleOrder, setEligibleOrder] = useState<string | null>(null); const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [showForm, setShowForm] = useState(false); const [sortBy, setSortBy] = useState<"newest"|"highest"|"lowest">("newest");
  const isBuyer = session?.user.role === "BUYER"; const isAdmin = session?.user.role === "ADMIN";
  const fetchReviews = useCallback(async () => { setLoading(true); try { const res = await fetch(`/api/reviews?productId=${productId}`); const json = await res.json(); if (res.ok) setData(json); } finally { setLoading(false); } }, [productId]);
  useEffect(() => { fetchReviews(); }, [fetchReviews]);
  useEffect(() => {
    if (!isBuyer || !session) return;
    fetch("/api/orders").then(r => r.json()).then((orders: any[]) => { const delivered = orders.find(o => o.status === "DELIVERED" && o.items.some((i: any) => i.product.id === productId)); if (delivered) setEligibleOrder(delivered.id); const alreadyDone = data?.reviews.some(r => r.buyer.id === session.user.id); setAlreadyReviewed(!!alreadyDone); }).catch(() => {});
  }, [isBuyer, session, productId, data]);
  const sorted = data ? [...data.reviews].sort((a, b) => { if (sortBy === "highest") return b.rating - a.rating; if (sortBy === "lowest") return a.rating - b.rating; return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); }) : [];
  function handleDelete(id: string) { setData(prev => prev ? { ...prev, reviews: prev.reviews.filter(r => r.id !== id), total: prev.total - 1 } : prev); }
  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>{loading ? <div className="flex items-center gap-2 text-gray-400"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-[13px]">Loading reviews…</span></div> : data ? <RatingBadge avg={data.avg} count={data.total} size="md" /> : null}</div>
        {data && data.total > 0 && <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="text-[12.5px] font-semibold text-gray-600 border-[1.5px] border-gray-200 rounded-full px-4 py-1.5 bg-white outline-none cursor-pointer hover:border-pink transition-colors"><option value="newest">Newest First</option><option value="highest">Highest Rating</option><option value="lowest">Lowest Rating</option></select>}
      </div>
      {data && data.total > 0 && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-6 flex items-center gap-8">
          <div className="text-center shrink-0"><div className="text-[3.5rem] font-extrabold text-gray-800 leading-none">{data.avg.toFixed(1)}</div><StarRating value={Math.round(data.avg)} size="sm" readonly /><div className="text-[11.5px] text-gray-400 mt-1">{data.total} review{data.total !== 1 ? "s" : ""}</div></div>
          <div className="flex-1 space-y-1.5">{data.dist.map(({ star, count, pct }) => (<div key={star} className="flex items-center gap-2"><span className="text-[11px] text-gray-500 w-3 text-right">{star}</span><StarRating value={star} size="sm" readonly /><div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} /></div><span className="text-[11px] text-gray-400 w-7 text-right">{count}</span></div>))}</div>
        </div>
      )}
      {isBuyer && eligibleOrder && !alreadyReviewed && !showForm && <button onClick={() => setShowForm(true)} className="w-full flex items-center justify-center gap-2 border-[1.5px] border-dashed border-pink-pale2 bg-pink-pale text-pink font-bold text-[13.5px] py-3.5 rounded-2xl hover:bg-pink hover:text-white hover:border-pink transition-all mb-5"><PenLine className="w-4 h-4" />Write a Review for {productName}</button>}
      {isBuyer && eligibleOrder && alreadyReviewed && <div className="flex items-center gap-2 text-[13px] text-green-600 font-semibold bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5"><ShieldCheck className="w-4 h-4" />You have already reviewed this product.</div>}
      {isBuyer && !eligibleOrder && session && <div className="flex items-center gap-2 text-[12.5px] text-gray-400 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-5"><AlertCircle className="w-4 h-4 shrink-0" />You can review this product after your order is delivered.</div>}
      {showForm && eligibleOrder && <div className="mb-5"><WriteReviewForm productId={productId} eligibleOrderId={eligibleOrder} onSubmitted={() => { setShowForm(false); setAlreadyReviewed(true); fetchReviews(); }} /></div>}
      {loading && <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 text-pink animate-spin" /></div>}
      {!loading && sorted.length === 0 && <div className="text-center py-10 text-gray-400"><PenLine className="w-8 h-8 text-gray-200 mx-auto mb-3" strokeWidth={1} /><div className="font-semibold text-gray-500 text-[14px] mb-1">No reviews yet</div><p className="text-[12.5px]">{eligibleOrder ? "Be the first to review this product!" : "Reviews from verified buyers will appear here."}</p></div>}
      {!loading && sorted.length > 0 && <div className="space-y-4">{sorted.map(review => <ReviewCard key={review.id} review={review} currentUserId={session?.user.id} isAdmin={isAdmin} onDelete={handleDelete} />)}</div>}
    </div>
  );
}
