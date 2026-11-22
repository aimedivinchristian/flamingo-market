import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const staticPaths = ["", "/marketplace", "/about", "/help", "/contact", "/fees", "/terms", "/privacy", "/returns", "/seller-guide", "/promotions"];
  const entries: MetadataRoute.Sitemap = staticPaths.map(p => ({ url: `${base}${p}`, changeFrequency: "weekly", priority: p === "" ? 1 : 0.6 }));
  try {
    const [products, stores] = await Promise.all([
      prisma.product.findMany({ where: { isActive: true }, select: { id: true, updatedAt: true }, take: 5000 }),
      prisma.store.findMany({ select: { id: true }, take: 1000 }),
    ]);
    products.forEach(p => entries.push({ url: `${base}/product/${p.id}`, lastModified: p.updatedAt, changeFrequency: "weekly", priority: 0.8 }));
    stores.forEach(s => entries.push({ url: `${base}/store/${s.id}`, changeFrequency: "weekly", priority: 0.5 }));
  } catch { /* DB unavailable at build time — static entries only */ }
  return entries;
}
