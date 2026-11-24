"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Store, MessageCircle, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useUnread } from "@/lib/hooks/useUnread";
import { cn } from "@/lib/utils";

/** Bottom tab bar — phones only (hidden from md up). */
export function MobileNav() {
  const path = usePathname() || "/";
  const sp = useSearchParams();
  const { data: session } = useSession();
  const { totalItems, toggleCart } = useCart();
  const unread = useUnread();
  if (path.startsWith("/messages") && sp.get("c")) return null; // open chat needs the full screen
  if (["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"].some(p => path.startsWith(p))) return null;
  const cart = totalItems();
  const account = session ? (session.user.role === "ADMIN" ? "/admin" : session.user.role === "SELLER" ? "/seller" : "/buyer") : "/login";
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  const Item = ({ href, icon: Icon, label, badge }: { href: string; icon: any; label: string; badge?: number }) => (
    <Link href={href} className={cn("flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative", active(href) ? "text-pink" : "text-gray-400")}>
      <Icon className="w-[22px] h-[22px]" />
      <span className="text-[10px] font-bold">{label}</span>
      {!!badge && badge > 0 && <span className="absolute top-1 left-1/2 ml-2 min-w-[16px] h-4 px-1 bg-pink text-white text-[9px] font-black rounded-full flex items-center justify-center">{badge > 9 ? "9+" : badge}</span>}
    </Link>
  );
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-gray-100 flex shadow-[0_-4px_20px_rgba(0,0,0,0.06)]" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <Item href="/" icon={Home} label="Home" />
      <Item href="/marketplace" icon={Store} label="Shop" />
      <Item href={session ? "/messages" : "/login"} icon={MessageCircle} label="Chat" badge={unread} />
      <button onClick={toggleCart} className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-gray-400 relative">
        <ShoppingCart className="w-[22px] h-[22px]" /><span className="text-[10px] font-bold">Cart</span>
        {cart > 0 && <span className="absolute top-1 left-1/2 ml-2 min-w-[16px] h-4 px-1 bg-pink text-white text-[9px] font-black rounded-full flex items-center justify-center">{cart > 9 ? "9+" : cart}</span>}
      </button>
      <Item href={account} icon={User} label={session ? "Account" : "Sign in"} />
    </nav>
  );
}
