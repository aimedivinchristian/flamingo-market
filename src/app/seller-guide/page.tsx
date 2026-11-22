import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { UserPlus, Store, Upload, Package, Wallet, ArrowRight } from "lucide-react";

const STEPS = [
  { icon: UserPlus, title: "Create your account", body: "Register with the 'I want to sell' option and verify your email with the code we send you." },
  { icon: Store, title: "Set up your store", body: "Add your store name, logo, and description from your Seller Dashboard. This is what buyers see when they visit your storefront." },
  { icon: Upload, title: "List your first product", body: "Upload up to 4 photos, write a clear description, set your price and stock quantity, then publish. Products go live instantly." },
  { icon: Package, title: "Fulfil orders", body: "When a buyer orders, you'll get notified. Update the order status as you confirm, ship, and deliver — the buyer sees live tracking." },
  { icon: Wallet, title: "Get paid", body: "Once an order is marked Delivered, your earnings (90% after commission) become available. Withdraw via Mobile Money or bank transfer." },
];

export default function SellerGuidePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-[720px] mx-auto px-5 py-14">
        <div className="text-center mb-12">
          <h1 className="text-[2rem] font-extrabold text-gray-800 tracking-tight mb-2">Seller Guide</h1>
          <p className="text-gray-400 text-[14px]">Five steps from signing up to your first payout.</p>
        </div>

        <div className="space-y-6">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="flex gap-5">
              <div className="flex flex-col items-center shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-pink flex items-center justify-center shadow-pink text-white font-extrabold">{i + 1}</div>
                {i < STEPS.length - 1 && <div className="w-px flex-1 bg-gray-200 my-2" />}
              </div>
              <div className="pb-6">
                <div className="flex items-center gap-2 mb-1.5"><Icon className="w-4 h-4 text-pink" /><h3 className="text-[15px] font-bold text-gray-800">{title}</h3></div>
                <p className="text-[13.5px] text-gray-500 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mt-4 text-center">
          <p className="text-[13px] text-gray-500 mb-3">Ready to get started?</p>
          <Link href="/register?role=SELLER" className="inline-flex items-center gap-2 bg-gradient-pink text-white font-bold text-[14px] px-7 py-3 rounded-full shadow-pink hover:opacity-90 transition-all">Create Seller Account <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
