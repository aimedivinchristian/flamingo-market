"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";
import toast from "react-hot-toast";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, Truck, CheckCircle, Loader2, XCircle } from "lucide-react";
interface PromoResult { promoId: string; code: string; type: "PERCENT" | "FLAT"; value: number; discount: number; finalTotal: number; message: string; }
export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, clearCart, totalItems, totalPrice } = useCart();
  const [showCheckout, setShowCheckout] = useState(false); const [promoInput, setPromoInput] = useState(""); const [promoResult, setPromoResult] = useState<PromoResult | null>(null); const [promoLoading, setPromoLoading] = useState(false); const [promoError, setPromoError] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const subtotal = totalPrice(); const itemCount = totalItems(); const shipping = subtotal >= 30000 ? 0 : 2000; const discount = promoResult?.discount ?? 0; const grand = Math.max(0, subtotal + shipping - discount);
  useEffect(() => { document.body.style.overflow = isOpen ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [isOpen]);
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === "Escape") closeCart(); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [closeCart]);
  useEffect(() => { if (items.length === 0) { setPromoResult(null); setPromoInput(""); setPromoError(""); } }, [items.length]);
  async function applyPromo() {
    if (!promoInput.trim()) return;
    setPromoLoading(true); setPromoError(""); setPromoResult(null);
    try { const res = await fetch("/api/promo/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: promoInput.trim(), orderTotal: subtotal }) }); const data = await res.json(); if (!res.ok) { setPromoError(data.error); return; } setPromoResult(data); toast.success(data.message); } finally { setPromoLoading(false); }
  }
  function removePromo() { setPromoResult(null); setPromoInput(""); setPromoError(""); }
  const checkoutItems = items.map(i => ({ productId: i.id, name: i.name, price: i.price, quantity: i.quantity }));
  return (
    <>
      <div ref={overlayRef} onClick={closeCart} className={`fixed inset-0 z-[60] transition-all duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(3px)" }} />
      <div className="fixed top-0 right-0 bottom-0 z-[61] w-[420px] max-w-full bg-white flex flex-col" style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)", boxShadow: "-8px 0 40px rgba(0,0,0,0.12)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5"><ShoppingBag className="w-5 h-5 text-pink" /><span className="font-extrabold text-[16px] text-gray-800">Your Cart</span>{itemCount > 0 && <span className="text-[11px] font-extrabold text-pink bg-pink-pale border border-pink-pale2 px-2.5 py-0.5 rounded-full">{itemCount} item{itemCount !== 1 ? "s" : ""}</span>}</div>
          <div className="flex items-center gap-2">{items.length > 0 && <button onClick={() => { if (confirm("Clear entire cart?")) { clearCart(); removePromo(); } }} className="text-[11.5px] font-semibold text-gray-400 hover:text-red-400 transition-colors">Clear all</button>}<button onClick={closeCart} className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:border-pink hover:text-pink transition-all"><X className="w-4 h-4" /></button></div>
        </div>
        {subtotal > 0 && subtotal < 30000 && (<div className="px-5 py-3 bg-amber-50 border-b border-amber-100 shrink-0"><div className="flex items-center justify-between text-[11.5px] font-semibold text-amber-700 mb-1.5"><div className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" />Add {formatPrice(30000 - subtotal)} more for free delivery</div><span>{Math.round((subtotal / 30000) * 100)}%</span></div><div className="h-1.5 bg-amber-200 rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${Math.min((subtotal / 30000) * 100, 100)}%` }} /></div></div>)}
        {subtotal >= 30000 && <div className="px-5 py-2.5 bg-green-50 border-b border-green-100 shrink-0 flex items-center gap-2 text-[11.5px] font-bold text-green-700"><Truck className="w-3.5 h-3.5" /> You qualify for free delivery!</div>}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16"><div className="w-20 h-20 bg-pink-pale border-2 border-pink-pale2 rounded-3xl flex items-center justify-center mx-auto mb-5"><ShoppingBag className="w-9 h-9 text-pink" strokeWidth={1.5} /></div><h3 className="text-[16px] font-extrabold text-gray-800 mb-2">Your cart is empty</h3><p className="text-[13px] text-gray-400 mb-6 leading-relaxed">Start browsing to find something you love.</p><Link href="/marketplace" onClick={closeCart} className="inline-flex items-center gap-2 bg-gradient-pink text-white text-[13px] font-bold px-6 py-3 rounded-full shadow-pink hover:opacity-90 transition-all">Browse Marketplace <ArrowRight className="w-4 h-4" /></Link></div>
          ) : (
            <div className="px-5 py-3 space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 p-3 bg-white border border-gray-100 rounded-2xl hover:border-pink-pale2 transition-all group">
                  <div className="w-[68px] h-[68px] rounded-xl bg-gradient-to-br from-pink-pale to-blue-50 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100">{item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <ShoppingBag className="w-7 h-7 text-gray-200" strokeWidth={1} />}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-gray-800 leading-tight truncate mb-0.5">{item.name}</div><div className="text-[11px] text-gray-400 mb-1 truncate">{item.seller}</div>
                    {(item.size || item.color) && <div className="flex gap-1.5 mb-1.5">{item.size && <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">{item.size}</span>}{item.color && <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">{item.color}</span>}</div>}
                    <div className="flex items-center justify-between"><span className="text-[14px] font-extrabold text-pink">{formatPrice(item.price * item.quantity)}</span><div className="flex items-center gap-1.5"><button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-pink hover:text-pink transition-all"><Minus className="w-3 h-3" /></button><span className="text-[13px] font-bold w-5 text-center text-gray-800">{item.quantity}</span><button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-pink hover:text-pink transition-all"><Plus className="w-3 h-3" /></button></div></div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-100 self-start mt-0.5 w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-300 hover:border-red-300 hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 shrink-0 bg-white">
            <div className="mb-4">
              {promoResult ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3"><div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600 shrink-0" /><div><div className="text-[12px] font-bold text-green-700"><span className="font-mono">{promoResult.code}</span> applied</div><div className="text-[11px] text-green-600">{promoResult.message}</div></div></div><button onClick={removePromo} className="text-green-500 hover:text-red-400 transition-colors ml-2"><XCircle className="w-4 h-4" /></button></div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2"><div className="relative flex-1"><Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" /><input type="text" value={promoInput} onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(""); }} onKeyDown={e => { if (e.key === "Enter") applyPromo(); }} placeholder="Promo code" className="w-full pl-8 pr-3 py-2 text-[12.5px] border-[1.5px] border-gray-200 rounded-xl outline-none focus:border-pink transition-colors placeholder:text-gray-300 font-mono" /></div><button onClick={applyPromo} disabled={promoLoading || !promoInput.trim()} className="text-[12px] font-bold text-pink border-[1.5px] border-pink-pale2 bg-pink-pale px-4 py-2 rounded-xl hover:bg-pink hover:text-white transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0">{promoLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}Apply</button></div>
                  {promoError && <div className="flex items-center gap-1.5 text-[11.5px] text-red-500 font-medium"><XCircle className="w-3.5 h-3.5 shrink-0" />{promoError}</div>}
                </div>
              )}
            </div>
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-[13px] text-gray-500"><span>Subtotal ({itemCount} items)</span><span className="font-semibold text-gray-700">{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-[13px] text-gray-500"><span>Shipping</span><span className={shipping === 0 ? "font-bold text-green-600" : "font-semibold text-gray-700"}>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
              {promoResult && <div className="flex justify-between text-[13px] text-green-600 font-semibold"><span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Promo ({promoResult.code})</span><span>− {formatPrice(discount)}</span></div>}
              <div className="flex justify-between text-[15px] font-extrabold text-gray-800 border-t border-gray-100 pt-2 mt-1"><span>Total</span><div className="text-right">{promoResult && <div className="text-[11.5px] text-gray-300 line-through font-normal">{formatPrice(subtotal + shipping)}</div>}<span className="text-pink">{formatPrice(grand)}</span></div></div>
            </div>
            <button onClick={() => setShowCheckout(true)} className="w-full bg-gradient-pink text-white font-bold text-[14px] py-3.5 rounded-full shadow-pink hover:opacity-90 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 mb-2">Checkout · {formatPrice(grand)} <ArrowRight className="w-4 h-4" /></button>
            <Link href="/marketplace" onClick={closeCart} className="w-full flex items-center justify-center text-[13px] font-semibold text-gray-500 border border-gray-200 py-3 rounded-full hover:border-pink hover:text-pink transition-all">Continue Shopping</Link>
          </div>
        )}
      </div>
      {showCheckout && <CheckoutModal items={checkoutItems} total={grand} promoId={promoResult?.promoId} discount={discount} promoCode={promoResult?.code} onClose={() => setShowCheckout(false)} />}
    </>
  );
}
