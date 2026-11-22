import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { RefreshCw, Clock, XCircle, CheckCircle, Mail } from "lucide-react";

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-[820px] mx-auto px-5 py-14">
        <div className="mb-10">
          <div className="w-12 h-12 bg-pink-pale rounded-2xl flex items-center justify-center mb-4"><RefreshCw className="w-5 h-5 text-pink" /></div>
          <h1 className="text-[2rem] font-extrabold text-gray-800 tracking-tight mb-2">Returns &amp; Refunds</h1>
          <p className="text-gray-400 text-[14px]">How returns, cancellations, and refunds work on Flamingo Market.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[{ icon: Clock, label: "7-Day Window", sub: "From delivery date" }, { icon: CheckCircle, label: "Original Condition", sub: "Unused, with packaging" }, { icon: RefreshCw, label: "3–5 Day Refunds", sub: "Once approved" }].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-center"><Icon className="w-5 h-5 text-pink mx-auto mb-2" /><div className="text-[13px] font-bold text-gray-800">{label}</div><div className="text-[11px] text-gray-400 mt-0.5">{sub}</div></div>
          ))}
        </div>

        <div className="space-y-8 text-[14px] text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">Cancelling an order</h2>
            <p>You can cancel an order yourself from your Buyer Dashboard as long as it's still in <strong>Pending</strong> status — before the seller confirms it. Once confirmed, the order enters fulfillment and cancellation requires contacting support directly.</p>
          </section>
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">Returning a delivered item</h2>
            <p>If an item arrives damaged, defective, or significantly different from its listing, you can request a return within 7 days of delivery. Items must be unused and in their original packaging. Contact us with your order number, photos of the issue, and a description of the problem.</p>
          </section>
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">What's not eligible</h2>
            <p>Perishable goods, personal care items that have been opened, and items marked "Final Sale" at the time of purchase are not eligible for return unless defective on arrival.</p>
          </section>
          <section>
            <h2 className="text-[16px] font-extrabold text-gray-800 mb-3">Refund timing</h2>
            <p>Once a return is approved, refunds are issued to your original payment method within 3–5 business days. Mobile Money refunds are typically faster than card refunds. Cash on Delivery orders are refunded via Mobile Money to the number on file.</p>
          </section>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mt-10 text-center">
          <p className="text-[13px] text-gray-500 mb-3">Need to start a return?</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/buyer" className="text-[13px] font-bold text-white bg-gradient-pink px-6 py-2.5 rounded-full shadow-pink hover:opacity-90 transition-all">Go to My Orders</Link>
            <Link href="/contact" className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-600 border border-gray-200 px-6 py-2.5 rounded-full hover:border-pink hover:text-pink transition-all"><Mail className="w-3.5 h-3.5" /> Contact Support</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
