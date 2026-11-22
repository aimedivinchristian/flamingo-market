"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { formatPrice, formatDate } from "@/lib/utils";
import { useOrders, ORDER_STATUS } from "@/lib/hooks/useOrders";
import { useWishlist } from "@/lib/wishlist-store";
import { useCart } from "@/lib/cart-store";
import { ReviewModal } from "@/components/reviews/ReviewModal";
import toast from "react-hot-toast";
import { ShoppingBag, Heart, MapPin, Package, CreditCard, ChevronRight, Star, Loader2, RefreshCw, XCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = ["Orders", "Wishlist", "Addresses", "Profile"] as const;
type Tab = typeof TABS[number];

export default function BuyerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Orders");
  const [reviewTarget, setReviewTarget] = useState<{ productId: string; orderId: string; productName: string } | null>(null);
  const { orders, loading, error, refetch } = useOrders();
  const { items: wishItems, removeItem: removeWish, count: wishCount } = useWishlist();
  const { addItem } = useCart();

  useEffect(() => { if (status === "loading") return; if (!session) router.push("/login"); }, [session, status, router]);
  if (!session) return null;

  const totalSpent = orders.reduce((s, o) => s + o.total, 0);

  async function cancelOrder(orderId: string) {
    if (!confirm("Cancel this order?")) return;
    const res = await fetch(`/api/orders/${orderId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "CANCELLED" }) });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); return; }
    toast.success("Order cancelled"); refetch();
  }
  function moveToCart(item: typeof wishItems[0]) {
    addItem({ id: item.id, name: item.name, price: item.price, oldPrice: item.oldPrice, seller: item.seller, category: item.category, image: item.image });
    removeWish(item.id); toast.success(`${item.name} moved to cart`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-[900px] mx-auto px-5 py-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 flex items-center gap-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex-wrap">
          <div className="w-16 h-16 rounded-2xl bg-gradient-pink flex items-center justify-center text-white text-2xl font-extrabold shadow-pink shrink-0">{session.user.name?.[0]?.toUpperCase()}</div>
          <div className="flex-1 min-w-0"><div className="text-[18px] font-extrabold text-gray-800 truncate">{session.user.name}</div><div className="text-[13px] text-gray-400 truncate">{session.user.email}</div><div className="flex items-center gap-3 mt-1.5 flex-wrap"><span className="text-[11px] font-bold text-cyan bg-cyan-light px-2.5 py-0.5 rounded-full">Buyer</span><span className="text-[11px] text-gray-400">{orders.length} orders placed</span></div></div>
          <Link href="/marketplace" className="flex items-center gap-2 bg-gradient-pink text-white text-[13px] font-bold px-5 py-2.5 rounded-full shadow-pink hover:opacity-90 transition-all shrink-0"><ShoppingBag className="w-4 h-4" /> Shop Now</Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[{ icon: Package, label: "Total Orders", value: orders.length, color: "text-pink", bg: "bg-pink-pale" }, { icon: CreditCard, label: "Total Spent", value: formatPrice(totalSpent), color: "text-cyan", bg: "bg-cyan-light" }, { icon: Heart, label: "Wishlist", value: `${wishCount()} items`, color: "text-pink", bg: "bg-pink-pale" }].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className={`${bg} border border-gray-100 rounded-2xl p-5 text-center`}><Icon className={`w-5 h-5 ${color} mx-auto mb-2`} /><div className={`text-[18px] font-extrabold ${color} mb-0.5`}>{value}</div><div className="text-[11.5px] text-gray-500 font-medium">{label}</div></div>
          ))}
        </div>

        <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl p-1 mb-6 w-fit shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          {TABS.map(t => <button key={t} onClick={() => setTab(t)} className={cn("px-5 py-2 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap", tab === t ? "bg-gradient-pink text-white shadow-pink" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50")}>{t}{t === "Wishlist" && wishCount() > 0 && <span className="ml-1.5 text-[10px] bg-pink text-white px-1.5 py-0.5 rounded-full">{wishCount()}</span>}</button>)}
        </div>

        {tab === "Orders" && (
          <div className="space-y-4">
            {loading && <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-pink animate-spin" /></div>}
            {error && !loading && <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center"><div className="text-gray-400 text-sm mb-3">{error}</div><button onClick={refetch} className="flex items-center gap-1.5 text-[13px] font-bold text-pink mx-auto hover:underline"><RefreshCw className="w-3.5 h-3.5" /> Try again</button></div>}
            {!loading && !error && orders.length === 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
                <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" strokeWidth={1} /><h3 className="font-extrabold text-gray-600 text-[16px] mb-2">No orders yet</h3><p className="text-[13px] text-gray-400 mb-6">Start shopping to see your orders here.</p>
                <Link href="/marketplace" className="inline-flex items-center gap-2 bg-gradient-pink text-white text-[13px] font-bold px-6 py-2.5 rounded-full shadow-pink hover:opacity-90"><ShoppingBag className="w-4 h-4" /> Start Shopping</Link>
              </div>
            )}
            {!loading && orders.map(order => {
              const s = ORDER_STATUS[order.status]; const shortId = order.id.slice(-8).toUpperCase();
              return (
                <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-pink-pale2 transition-all">
                  <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                    <div><div className="flex items-center gap-2 mb-0.5 flex-wrap"><span className="font-mono text-[13px] font-bold text-pink">#{shortId}</span><span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full" style={{ color: s.color, background: s.bg }}>{s.label}</span></div><div className="text-[11.5px] text-gray-400">{formatDate(order.createdAt)}</div></div>
                    <div className="text-right"><div className="text-[17px] font-extrabold text-gray-800">{formatPrice(order.total)}</div><div className="text-[11px] text-gray-400">{order.items.length} item(s)</div></div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {order.items.slice(0, 2).map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3">
                        <div className="w-10 h-10 rounded-xl bg-pink-pale border border-pink-pale2 flex items-center justify-center shrink-0">{item.product.images?.[0] ? <img src={item.product.images[0]} alt="" className="w-full h-full object-cover rounded-xl" /> : <Package className="w-4 h-4 text-pink" />}</div>
                        <div className="flex-1 min-w-0"><div className="text-[13px] font-semibold text-gray-800 truncate">{item.product.name}</div><div className="text-[11px] text-gray-400">Qty: {item.quantity} · {formatPrice(item.price)}</div></div>
                        {order.status === "DELIVERED" && <button onClick={() => setReviewTarget({ productId: item.product.id, orderId: order.id, productName: item.product.name })} className="text-[11px] font-bold text-amber-500 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-1 shrink-0"><Star className="w-3 h-3" /> Review</button>}
                      </div>
                    ))}
                    {order.items.length > 2 && <div className="text-[11.5px] text-gray-400 text-center">+{order.items.length - 2} more item{order.items.length - 2 !== 1 ? "s" : ""}</div>}
                  </div>
                  {order.status === "SHIPPED" && <div className="flex items-center gap-2 text-[12px] font-semibold text-cyan bg-cyan-light border border-cyan/20 rounded-xl px-4 py-2.5 mb-3">🚚 Your order is on its way! Estimated delivery: 1–2 days.</div>}
                  <div className="flex gap-2 flex-wrap">
                    <Link href={`/order/${order.id}`} className="text-[12px] font-bold text-white bg-gradient-pink px-4 py-2 rounded-full shadow-pink hover:opacity-90 transition-opacity flex items-center gap-1.5">Track Order <ChevronRight className="w-3.5 h-3.5" /></Link>
                    {order.status === "PENDING" && <button onClick={() => cancelOrder(order.id)} className="text-[12px] font-semibold text-red-400 border border-red-200 px-4 py-2 rounded-full hover:bg-red-50 transition-colors flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> Cancel</button>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "Wishlist" && (
          <div className="space-y-3">
            {wishItems.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center"><Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" strokeWidth={1} /><h3 className="font-extrabold text-gray-600 text-[15px] mb-2">Wishlist is empty</h3><Link href="/marketplace" className="inline-flex items-center gap-2 text-[13px] font-bold text-pink hover:underline mt-2">Browse products <ArrowRight className="w-3.5 h-3.5" /></Link></div>
            ) : wishItems.map(item => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:border-pink-pale2 transition-all">
                <div className="w-14 h-14 rounded-xl bg-pink-pale border border-pink-pale2 flex items-center justify-center shrink-0">{item.image ? <img src={item.image} alt="" className="w-full h-full object-cover rounded-xl" /> : <Package className="w-6 h-6 text-pink" />}</div>
                <div className="flex-1 min-w-0"><Link href={`/product/${item.id}`} className="text-[14px] font-bold text-gray-800 hover:text-pink transition-colors truncate block">{item.name}</Link><div className="text-[15px] font-extrabold text-pink mt-0.5">{formatPrice(item.price)}</div></div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => moveToCart(item)} className="text-[12px] font-bold text-white bg-gradient-pink px-4 py-2 rounded-full shadow-pink hover:opacity-90 transition-opacity">Add to Cart</button>
                  <button onClick={() => { removeWish(item.id); toast.success("Removed"); }} className="w-9 h-9 border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-400 transition-all"><Heart className="w-4 h-4 fill-current" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Addresses" && (
          <div className="space-y-3">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-pink-pale flex items-center justify-center shrink-0"><MapPin className="w-4 h-4 text-pink" /></div><div><div className="text-[13px] font-bold text-gray-800 mb-0.5">Delivery Address</div><div className="text-[12.5px] text-gray-500">Your saved address appears here after your first order.</div></div></div>
              </div>
            </div>
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-5 text-center text-[12.5px] text-gray-400">
              Addresses are captured at checkout. A dedicated saved-addresses book isn&apos;t built yet — each order lets you enter delivery details fresh.
            </div>
          </div>
        )}

        {tab === "Profile" && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] space-y-4">
            <div className="text-[16px] font-extrabold text-gray-800 mb-2">My Profile</div>
            {[{ label: "Full Name", value: session.user.name ?? "" }, { label: "Email Address", value: session.user.email ?? "" }].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl p-4"><div className="text-[11px] text-gray-400 font-semibold mb-0.5">{label}</div><div className="text-[13px] font-semibold text-gray-700">{value}</div></div>
            ))}
            <p className="text-[11.5px] text-gray-400 pt-2">Profile editing isn&apos;t wired up yet — this is display-only for now.</p>
          </div>
        )}
      </div>
      {reviewTarget && <ReviewModal productId={reviewTarget.productId} orderId={reviewTarget.orderId} productName={reviewTarget.productName} onClose={() => setReviewTarget(null)} onSubmitted={() => { setReviewTarget(null); toast.success("Review published!"); }} />}
    </div>
  );
}
