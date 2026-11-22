import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutCancelledPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 shadow-card border border-gray-100 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Payment Cancelled</h1>
        <p className="text-gray-400 text-sm mb-6">
          Your payment was cancelled. No charge was made. Your cart items are still saved.
        </p>
        <div className="flex gap-3">
          <Link href="/marketplace" className="flex-1 bg-gradient-pink text-white font-bold text-sm py-3 rounded-full shadow-pink hover:opacity-90 text-center">
            Back to Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
