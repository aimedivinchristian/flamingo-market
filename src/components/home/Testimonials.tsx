"use client";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
interface Review { id: string; rating: number; body: string; buyer: { name: string }; product: { name: string }; }
export function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { fetch("/api/reviews/recent").then(r => r.json()).then(data => setReviews(Array.isArray(data) ? data.slice(0, 3) : [])).catch(() => {}).finally(() => setLoading(false)); }, []);
  /* No fabricated quotes — if there are no real reviews yet, don't show this section */
  if (loading || reviews.length === 0) return null;
  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="mb-8"><span className="section-label">Customer Reviews</span><h2 className="section-title">What Our Customers Say</h2></div>
        <div className="grid md:grid-cols-3 gap-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-white border-[1.5px] border-gray-200 rounded-2xl p-6 transition-all hover:border-pink-pale2 hover:shadow-card">
              <div className="flex gap-0.5 mb-3">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-4 h-4 ${i < r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />)}</div>
              <p className="text-[13.5px] text-gray-600 leading-relaxed mb-5 line-clamp-4">&ldquo;{r.body}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-pink flex items-center justify-center text-white font-extrabold shrink-0">{r.buyer.name[0]}</div>
                <div><div className="text-[13px] font-bold text-gray-800">{r.buyer.name}</div><div className="text-[11.5px] text-gray-400 truncate max-w-[180px]">on {r.product.name}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
