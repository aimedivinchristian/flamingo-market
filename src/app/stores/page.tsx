import Link from "next/link";
import { BadgeCheck, Store as StoreIcon } from "lucide-react";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const revalidate = 60;
export const metadata = { title: "Stores — Flamingo Market", description: "Browse every store on Flamingo Market." };

export default async function StoresPage() {
  let stores: { id: string; name: string; description: string | null; logo: string | null; isVerified: boolean; _count: { products: number } }[] = [];
  try { stores = await prisma.store.findMany({ orderBy: [{ isVerified: "desc" }, { createdAt: "desc" }], take: 200, select: { id: true, name: true, description: true, logo: true, isVerified: true, _count: { select: { products: true } } } }); } catch { /* DB not ready at build */ }
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-[1280px] mx-auto px-3 sm:px-5 py-8">
        <h1 className="text-[1.8rem] font-extrabold text-gray-800 mb-1">All Stores</h1>
        <p className="text-gray-400 text-sm mb-6">Verified stores are listed first.</p>
        {stores.length === 0 ? <div className="text-center py-20 text-gray-400 text-sm">No stores yet.</div> : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{stores.map(s => (
            <Link key={s.id} href={`/store/${s.id}`} className="group bg-white border-[1.5px] border-gray-200 rounded-2xl p-5 text-center hover:border-pink transition-all">
              <div className="w-16 h-16 rounded-[18px] mx-auto mb-3 overflow-hidden bg-gradient-pink flex items-center justify-center text-white font-black text-xl">{s.logo ? <img src={s.logo} alt={s.name} className="w-full h-full object-cover" loading="lazy" /> : <StoreIcon className="w-6 h-6" />}</div>
              {s.isVerified && <div className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan bg-cyan-light px-2.5 py-0.5 rounded-full mb-2"><BadgeCheck className="w-3 h-3" /> Verified</div>}
              <div className="font-extrabold text-[14px] text-gray-800 group-hover:text-pink">{s.name}</div>
              {s.description && <p className="text-[12px] text-gray-400 mt-1 line-clamp-2">{s.description}</p>}
              <div className="text-[11.5px] text-gray-400 mt-2">{s._count.products} product{s._count.products === 1 ? "" : "s"}</div>
            </Link>))}</div>
        )}
      </div>
      <Footer />
    </div>
  );
}
