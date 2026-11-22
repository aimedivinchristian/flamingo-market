import type { Metadata } from "next";
import prisma from "@/lib/prisma";
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const p = await prisma.product.findUnique({ where: { id: params.id }, select: { name: true, description: true, images: true, price: true } });
    if (!p) return {};
    const desc = p.description.slice(0, 160);
    return { title: `${p.name} — Flamingo Market`, description: desc, openGraph: { title: p.name, description: desc, images: p.images[0] ? [p.images[0]] : undefined, type: "website" }, twitter: { card: "summary_large_image", title: p.name, description: desc } };
  } catch { return {}; }
}
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
