import prisma from "@/lib/prisma";
import { BannerCarousel } from "./BannerCarousel";
export async function BannerStrip() {
  try {
    const banners = await prisma.banner.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], take: 8, select: { id: true, title: true, subtitle: true, image: true, link: true } });
    if (banners.length === 0) return null;
    return <BannerCarousel banners={banners} />;
  } catch { return null; }
}
