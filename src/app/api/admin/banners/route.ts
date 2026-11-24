import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
async function admin() { const s = await getServerSession(authOptions); return s && s.user.role === "ADMIN" ? s : null; }
export async function GET() {
  if (!(await admin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.banner.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }));
}
export async function POST(req: NextRequest) {
  if (!(await admin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json();
  const title = String(b.title || "").trim().slice(0, 120);
  const image = String(b.image || "");
  if (!title || !image.startsWith("https://")) return NextResponse.json({ error: "Title and an uploaded image are required" }, { status: 400 });
  const link = b.link ? String(b.link).trim() : null;
  if (link && !(link.startsWith("/") || link.startsWith("https://"))) return NextResponse.json({ error: "Link must start with / or https://" }, { status: 400 });
  const banner = await prisma.banner.create({ data: { title, subtitle: b.subtitle ? String(b.subtitle).slice(0, 200) : null, image, link, sortOrder: Number(b.sortOrder) || 0 } });
  return NextResponse.json(banner);
}
