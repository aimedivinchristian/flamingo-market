import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Flamingo Market ...");

  await Promise.all([
    prisma.category.upsert({ where: { slug: "fashion" },     update: {}, create: { name: "Fashion",       slug: "fashion",     emoji: "👗" } }),
    prisma.category.upsert({ where: { slug: "beauty" },      update: {}, create: { name: "Beauty",        slug: "beauty",      emoji: "💄" } }),
    prisma.category.upsert({ where: { slug: "electronics" }, update: {}, create: { name: "Electronics",   slug: "electronics", emoji: "📱" } }),
    prisma.category.upsert({ where: { slug: "home" },        update: {}, create: { name: "Home & Living", slug: "home",        emoji: "🏠" } }),
    prisma.category.upsert({ where: { slug: "supermarket" }, update: {}, create: { name: "Supermarket",   slug: "supermarket", emoji: "🛒" } }),
    prisma.category.upsert({ where: { slug: "accessories" }, update: {}, create: { name: "Accessories",   slug: "accessories", emoji: "👜" } }),
    prisma.category.upsert({ where: { slug: "detergents" },  update: {}, create: { name: "Detergents",    slug: "detergents",  emoji: "🧴" } }),
    prisma.category.upsert({ where: { slug: "local" },       update: {}, create: { name: "Local Crafts",  slug: "local",       emoji: "🌍" } }),
  ]);

  // Admin account: set ADMIN_EMAIL + ADMIN_PASSWORD before running the seed.
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  if (adminEmail && adminPassword.length >= 8) {
    await prisma.user.upsert({
      where: { email: adminEmail }, update: { role: "ADMIN", emailVerified: new Date() },
      create: { name: "Flamingo Admin", email: adminEmail, password: await bcrypt.hash(adminPassword, 12), role: "ADMIN", emailVerified: new Date() },
    });
    console.log(`✅ Admin account ready: ${adminEmail}`);
  } else {
    console.log("⚠️  ADMIN_EMAIL / ADMIN_PASSWORD (min 8 chars) not set — no admin created.");
  }

  // Demo accounts only when explicitly requested (local development): SEED_DEMO=true
  if (process.env.SEED_DEMO === "true") {
    const mk = async (name: string, email: string, pw: string, role: "SELLER" | "BUYER") =>
      prisma.user.upsert({ where: { email }, update: {}, create: { name, email, password: await bcrypt.hash(pw, 12), role, emailVerified: new Date() } });
    await mk("Demo Seller", "seller@flamingo.rw", "seller123", "SELLER");
    await mk("Demo Buyer", "buyer@flamingo.rw", "buyer123", "BUYER");
    console.log("Demo accounts: seller@flamingo.rw / seller123, buyer@flamingo.rw / buyer123 (DO NOT use in production)");
  }
  console.log("✅ Seed complete — 8 categories.");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
