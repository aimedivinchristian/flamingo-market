import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Briefcase, Mail } from "lucide-react";

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-[720px] mx-auto px-5 py-20 text-center">
        <div className="w-14 h-14 bg-pink-pale rounded-2xl flex items-center justify-center mx-auto mb-5"><Briefcase className="w-6 h-6 text-pink" /></div>
        <h1 className="text-[1.9rem] font-extrabold text-gray-800 tracking-tight mb-3">Careers at Flamingo Market</h1>
        <p className="text-gray-500 text-[14px] leading-relaxed max-w-[480px] mx-auto mb-8">We don&apos;t have any open roles listed right now, but we&apos;re always glad to hear from people who want to help build Rwanda&apos;s marketplace. Send us your CV and what you&apos;d like to work on.</p>
        <a href="mailto:careers@flamingo.rw" className="inline-flex items-center gap-2 bg-gradient-pink text-white font-bold text-[14px] px-7 py-3 rounded-full shadow-pink hover:opacity-90 transition-all"><Mail className="w-4 h-4" /> careers@flamingo.rw</a>
      </div>
      <Footer />
    </div>
  );
}
