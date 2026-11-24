import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";
import { MobileNav } from "@/components/layout/MobileNav";
import { PwaRegister } from "@/components/layout/PwaRegister";

const plus = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  manifest: "/site.webmanifest",
  openGraph: { siteName: "Flamingo Market", type: "website", images: ["/flamingo-logo.png"] },
  title: "Flamingo Market — Shop Easy. Shop Smart.",
  description: "Africa's premier multi-vendor marketplace. Starting in Rwanda.",
};

export const viewport: Viewport = { themeColor: "#e8267a", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plus.variable} font-plus bg-white text-gray-800 antialiased`}>
        <Providers>
          {children}
          <Suspense fallback={null}><MobileNav /></Suspense>
          <PwaRegister />
          <Toaster
            position="bottom-center"
            containerStyle={{ bottom: 80 }}
            toastOptions={{
              style: {
                background: "#e8267a",
                color: "#fff",
                borderRadius: "99px",
                fontWeight: "700",
                fontSize: "13.5px",
                padding: "10px 22px",
                boxShadow: "0 8px 32px rgba(232,38,122,0.3)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
