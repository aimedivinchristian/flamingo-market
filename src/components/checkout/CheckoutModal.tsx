"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import { X, CreditCard, Smartphone, MapPin, Phone, Lock, CheckCircle, Loader2, Tag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface CartItem { productId: string; name: string; price: number; quantity: number; }
interface Props { items: CartItem[]; total: number; promoId?: string; discount?: number; promoCode?: string; onClose: () => void; }
type PayMethod = "momo" | "stripe" | "cod";
type Step = "details" | "payment" | "processing" | "success";

export function CheckoutModal({ items, total, promoId, discount = 0, promoCode, onClose }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const { clearCart } = useCart();

  const [step, setStep] = useState<Step>("details");
  const [method, setMethod] = useState<PayMethod>("momo");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [orderId, setOrderId] = useState("");
  const [polling, setPolling] = useState(false);

  const shipping = total >= 30000 ? 0 : 2000;
  const grandTotal = total + shipping;

  function handleDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!session) { toast.error("Please sign in to checkout"); router.push("/login"); return; }
    if (!address.trim() || !phone.trim()) { toast.error("Please fill in all fields"); return; }
    setStep("payment");
  }

  async function payWithCOD() {
    setStep("processing");
    try {
      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, address, phone, notes, paymentMethod: "cod", promoId: promoId || null, discount: discount || 0 }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Order failed"); setStep("payment"); return; }
      setOrderId(data.id); clearCart(); setStep("success");
    } catch { toast.error("Order failed. Please try again."); setStep("payment"); }
  }

  async function payWithStripe() {
    setStep("processing");
    try {
      const res = await fetch("/api/payments/stripe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, address, phone, notes, promoId, discount }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Stripe checkout unavailable — check STRIPE_SECRET_KEY is set"); setStep("payment"); return; }
      window.location.href = data.url;
    } catch { toast.error("Payment setup failed."); setStep("payment"); }
  }

  async function payWithMomo() {
    setStep("processing");
    try {
      const res = await fetch("/api/payments/momo", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, address, phone, notes, promoId, discount }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Payment initiation failed"); setStep("payment"); return; }
      setOrderId(data.orderId);
      toast.success(data.simulated ? "Simulating MoMo payment (sandbox mode)…" : "Check your phone and approve the MoMo prompt!");
      setPolling(true);
      pollMomo(data.referenceId, data.orderId);
    } catch { toast.error("Payment initiation failed."); setStep("payment"); }
  }

  async function pollMomo(ref: string, oId: string, attempts = 0) {
    if (attempts > 20) { toast.error("Payment timeout. Check your orders."); setStep("payment"); setPolling(false); return; }
    await new Promise(r => setTimeout(r, 2000));
    try {
      const res = await fetch(`/api/payments/momo?ref=${ref}&orderId=${oId}`);
      const data = await res.json();
      if (data.status === "SUCCESSFUL") { setPolling(false); clearCart(); setStep("success"); return; }
      if (data.status === "FAILED") { setPolling(false); toast.error("Payment declined."); setStep("payment"); return; }
      pollMomo(ref, oId, attempts + 1);
    } catch { pollMomo(ref, oId, attempts + 1); }
  }

  const PAY_METHODS: { id: PayMethod; label: string; sub: string; icon: any }[] = [
    { id: "momo", label: "MTN Mobile Money", sub: "Instant · Prompt on your phone", icon: Smartphone },
    { id: "stripe", label: "Card / PayPal", sub: "Visa, Mastercard, PayPal", icon: CreditCard },
    { id: "cod", label: "Cash on Delivery", sub: "Pay when your order arrives", icon: Lock },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-3xl w-full max-w-[480px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.15)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <div className="font-extrabold text-[16px] text-gray-800">
              {step === "details" && "Delivery Details"}{step === "payment" && "Choose Payment"}{step === "processing" && "Processing…"}{step === "success" && "Order Placed!"}
            </div>
            <div className="text-[12px] text-gray-400 mt-0.5">
              {step !== "success" && `Total: ${formatPrice(grandTotal)}`}
              {promoCode && step !== "success" && <span className="ml-2 text-green-600 font-semibold">· {promoCode} applied</span>}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-pink hover:text-pink transition-all"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6">
          {step === "details" && (
            <form onSubmit={handleDetails} className="space-y-4">
              {session && (
                <div className="flex items-center gap-2.5 bg-pink-pale border border-pink-pale2 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-pink flex items-center justify-center text-white text-xs font-black">{session.user.name?.[0]}</div>
                  <div><div className="text-[13px] font-bold text-gray-800">{session.user.name}</div><div className="text-[11px] text-gray-500">{session.user.email}</div></div>
                </div>
              )}
              <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Delivery Address *</label><div className="relative"><MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input value={address} onChange={e => setAddress(e.target.value)} required placeholder="KG 123 St, Kigali, Rwanda" className="w-full pl-10 pr-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all" /></div></div>
              <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Phone Number *</label><div className="relative"><Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" /><input value={phone} onChange={e => setPhone(e.target.value)} required placeholder="078 000 0000" className="w-full pl-10 pr-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all" /></div></div>
              <div><label className="block text-[12.5px] font-bold text-gray-600 mb-1.5">Order Notes <span className="text-gray-400 font-normal">(optional)</span></label><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any special instructions…" className="w-full px-4 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-pink focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] transition-all resize-none" /></div>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                {items.map(i => (<div key={i.productId} className="flex justify-between text-[12.5px]"><span className="text-gray-600 truncate max-w-[240px]">{i.name} ×{i.quantity}</span><span className="font-semibold text-gray-800 ml-2 shrink-0">{formatPrice(i.price * i.quantity)}</span></div>))}
                {discount > 0 && (<div className="flex justify-between text-[12.5px] text-green-600 font-semibold"><span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {promoCode}</span><span>− {formatPrice(discount)}</span></div>)}
                <div className="flex justify-between text-[12.5px] text-gray-400 border-t border-gray-200 pt-1.5"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
                <div className="flex justify-between font-extrabold text-[14px] border-t border-gray-200 pt-1.5"><span>Total</span><span className="text-pink">{formatPrice(grandTotal)}</span></div>
              </div>
              <button type="submit" className="w-full bg-gradient-pink text-white font-bold text-[14px] py-3 rounded-full shadow-pink hover:opacity-90 transition-all">Continue to Payment →</button>
            </form>
          )}

          {step === "payment" && (
            <div className="space-y-4">
              <div className="space-y-2.5">
                {PAY_METHODS.map(m => (
                  <button key={m.id} type="button" onClick={() => setMethod(m.id)} className={cn("w-full flex items-center gap-3 p-4 rounded-2xl border-[1.5px] transition-all text-left", method === m.id ? "border-pink bg-pink-pale" : "border-gray-200 hover:border-gray-300")}>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", method === m.id ? "bg-pink text-white" : "bg-gray-100 text-gray-400")}><m.icon className="w-5 h-5" /></div>
                    <div><div className={cn("text-[13.5px] font-bold", method === m.id ? "text-pink" : "text-gray-700")}>{m.label}</div><div className="text-[11.5px] text-gray-400">{m.sub}</div></div>
                    {method === m.id && <CheckCircle className="w-4 h-4 text-pink ml-auto shrink-0" />}
                  </button>
                ))}
              </div>
              {method === "momo" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="text-[12.5px] font-semibold text-amber-800 mb-1">How MoMo works:</div>
                  <ol className="text-[12px] text-amber-700 space-y-0.5 list-decimal list-inside"><li>Click Pay below</li><li>Approve the prompt on <strong>{phone}</strong></li><li>Order confirmed automatically</li></ol>
                </div>
              )}
              {method === "cod" && (
                <div className="bg-cyan-light border border-cyan/20 rounded-xl p-4"><p className="text-[12.5px] text-gray-600">You'll pay in cash when your order is delivered. No payment needed now.</p></div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setStep("details")} className="flex-1 border-[1.5px] border-gray-200 text-gray-600 font-semibold text-[13px] py-3 rounded-full hover:border-pink hover:text-pink transition-all">← Back</button>
                <button onClick={() => { if (method === "momo") payWithMomo(); else if (method === "stripe") payWithStripe(); else payWithCOD(); }} className="flex-1 bg-gradient-pink text-white font-bold text-[13px] py-3 rounded-full shadow-pink hover:opacity-90 transition-all">
                  {method === "cod" ? `Place Order · ${formatPrice(grandTotal)}` : `Pay ${formatPrice(grandTotal)}`}
                </button>
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-pink-pale rounded-full flex items-center justify-center mx-auto mb-5"><Loader2 className="w-8 h-8 text-pink animate-spin" /></div>
              <div className="font-extrabold text-[17px] text-gray-800 mb-2">{polling ? "Waiting for MoMo…" : "Processing…"}</div>
              <p className="text-[13px] text-gray-400">{polling ? "Approve the prompt on your phone." : "Please wait, do not close this window."}</p>
              {polling && <div className="mt-5 flex justify-center gap-1.5">{[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-pink rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}</div>}
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5"><CheckCircle className="w-9 h-9 text-green-500" /></div>
              <div className="font-extrabold text-[20px] text-gray-800 mb-2">Order Confirmed!</div>
              <p className="text-[13px] text-gray-500 mb-1">Thank you{session?.user?.name ? `, ${session.user.name}` : ""}! Your order is being processed.</p>
              {discount > 0 && <p className="text-[12.5px] text-green-600 font-semibold mb-4">You saved {formatPrice(discount)} with code {promoCode}!</p>}
              <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-1.5 mb-6">
                <div className="flex justify-between text-[13px]"><span className="text-gray-500">Order Total</span><span className="font-bold text-pink">{formatPrice(grandTotal)}</span></div>
                <div className="flex justify-between text-[13px]"><span className="text-gray-500">Delivery to</span><span className="font-semibold text-gray-700 text-right max-w-[200px] truncate">{address}</span></div>
              </div>
              <div className="flex gap-3">
                {orderId && <button onClick={() => { router.push(`/order/${orderId}`); onClose(); }} className="flex-1 bg-gradient-pink text-white font-bold text-[13px] py-3 rounded-full shadow-pink hover:opacity-90 transition-all">Track Order</button>}
                <button onClick={onClose} className="flex-1 border-[1.5px] border-gray-200 text-gray-600 font-semibold text-[13px] py-3 rounded-full hover:border-pink hover:text-pink transition-all">Continue Shopping</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
