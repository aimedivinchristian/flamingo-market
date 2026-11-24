import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider      from "next-auth/providers/google";
import { PrismaAdapter }   from "@next-auth/prisma-adapter";
import bcrypt              from "bcryptjs";
import prisma              from "./prisma";
import { rateLimit }       from "./rate-limit";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email:    { label: "Email",    type: "email"    },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials, req) {
      if (!credentials?.email || !credentials?.password) return null;
      const email = credentials.email.trim().toLowerCase();
      const ip = String((req?.headers as any)?.["x-forwarded-for"] || "unknown").split(",")[0].trim();

      // Brute-force protection: per-account and per-IP
      const [byEmail, byIp] = await Promise.all([rateLimit(`login:email:${email}`, 8, 15 * 60), rateLimit(`login:ip:${ip}`, 40, 15 * 60)]);
      if (!byEmail.ok || !byIp.ok) throw new Error("TOO_MANY_ATTEMPTS");

      const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
      if (!user || !user.password) return null;

      const isValid = await bcrypt.compare(credentials.password, user.password);
      if (!isValid) return null;
      if (!user.emailVerified) throw new Error("EMAIL_NOT_VERIFIED");
      if (user.suspended) throw new Error("ACCOUNT_SUSPENDED");

      return { id: user.id, email: user.email, name: user.name, role: user.role, image: user.image };
    },
  }),
];

// Only register Google if real credentials are configured — otherwise NextAuth
// throws on every request (including credentials login) because the Google
// provider requires a non-empty clientId/clientSecret to initialize.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.role = (user as any).role; token.id = user.id; token.checkedAt = Date.now(); }
      else if (token.id && Date.now() - (token.checkedAt || 0) > 60_000) {
        // pick up role changes (e.g. seller approved by admin) without forcing a new login
        try {
          const u = await prisma.user.findUnique({ where: { id: token.id }, select: { role: true, suspended: true } });
          token.suspended = !u || u.suspended; // deleted or suspended accounts lose access within a minute
          if (u) token.role = u.role;
        } catch { /* keep the old role if the DB is briefly unreachable */ }
        token.checkedAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (token.suspended) return {} as any; // empty session => treated as signed out
      if (session.user) { (session.user as any).role = token.role; (session.user as any).id = token.id; }
      return session;
    },
  },
};
