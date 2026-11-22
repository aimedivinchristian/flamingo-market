"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Suspense } from "react";

function SuccessInner() {
  const params    = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" style={{ background: "linear-gradient(135deg,#f0fdf4,#fff)" }}>
      <div className="bg-white rounded-3xl p-10 shadow-card border border-gray-100 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-400 text-sm mb-2">
          Your order has been confirmed and is being processed.
        </p>
        {sessionId && (
          <p className="text-[11px] text-gray-300 font-mono mb-6">
            Ref: {sessionId.slice(-12)}
          </p>
        )}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-left">
          <div className="text-[13px] font-bold text-green-800 mb-1">What happens next?</div>
          <ul className="text-[12.5px] text-green-700 space-y-1 list-disc list-inside">
            <li>You&apos;ll receive a confirmation email shortly</li>
            <li>The seller will prepare your order</li>
            <li>Track delivery in your dashboard</li>
          </ul>
        </div>
        <div className="flex gap-3">
          <Link href="/buyer" className="flex-1 bg-gradient-pink text-white font-bold text-sm py-3 rounded-full shadow-pink hover:opacity-90 text-center">
            Track Order
          </Link>
          <Link href="/marketplace" className="flex-1 border-[1.5px] border-gray-200 text-gray-600 font-semibold text-sm py-3 rounded-full hover:border-pink hover:text-pink transition-all text-center">
            Keep Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return <Suspense><SuccessInner /></Suspense>;
}
