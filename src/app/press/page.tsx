import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Newspaper, Mail } from "lucide-react";

export default function PressPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-[720px] mx-auto px-5 py-20 text-center">
        <div className="w-14 h-14 bg-pink-pale rounded-2xl flex items-center justify-center mx-auto mb-5"><Newspaper className="w-6 h-6 text-pink" /></div>
        <h1 className="text-[1.9rem] font-extrabold text-gray-800 tracking-tight mb-3">Press &amp; Media</h1>
        <p className="text-gray-500 text-[14px] leading-relaxed max-w-[480px] mx-auto mb-8">For press inquiries, interview requests, or media assets, reach out to our team directly.</p>
        <a href="mailto:press@flamingo.rw" className="inline-flex items-center gap-2 bg-gradient-pink text-white font-bold text-[14px] px-7 py-3 rounded-full shadow-pink hover:opacity-90 transition-all"><Mail className="w-4 h-4" /> press@flamingo.rw</a>
      </div>
      <Footer />
    </div>
  );
}
