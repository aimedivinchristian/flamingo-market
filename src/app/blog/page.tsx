import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BookOpen } from "lucide-react";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-[720px] mx-auto px-5 py-20 text-center">
        <div className="w-14 h-14 bg-pink-pale rounded-2xl flex items-center justify-center mx-auto mb-5"><BookOpen className="w-6 h-6 text-pink" /></div>
        <h1 className="text-[1.9rem] font-extrabold text-gray-800 tracking-tight mb-3">Flamingo Market Blog</h1>
        <p className="text-gray-500 text-[14px] leading-relaxed max-w-[480px] mx-auto">We&apos;re working on our first posts — seller success stories, shopping guides, and product spotlights. Check back soon.</p>
      </div>
      <Footer />
    </div>
  );
}
