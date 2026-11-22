import type { Metadata } from "next";
import prisma from "@/lib/prisma";
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const s = await prisma.store.findUnique({ where: { id: params.id }, select: { name: true, description: true, logo: true } });
    if (!s) return {};
    const desc = (s.description || `Shop ${s.name} on Flamingo Market`).slice(0, 160);
    return { title: `${s.name} — Flamingo Market`, description: desc, openGraph: { title: s.name, description: desc, images: s.logo ? [s.logo] : undefined } };
  } catch { return {}; }
}
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
