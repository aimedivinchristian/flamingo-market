"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, Heart, ChevronDown, LogOut, LayoutDashboard, Menu, X, MessageCircle, Store, User, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { useCart } from "@/lib/cart-store";
import { useWishlist } from "@/lib/wishlist-store";
import { useUnread } from "@/lib/hooks/useUnread";
import { useT, useI18n, LOCALES } from "@/lib/i18n";
import { ThemeToggle } from "./ThemeToggle";

const CATS = ["Home","Fashion","Beauty","Home & Living","Detergents","Electronics","Supermarket","Accessories","More"];

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [userMenu, setUserMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, toggleCart } = useCart();
  const { count: wishCount } = useWishlist();
  const cartCount = totalItems();
  const unread = useUnread();
  const t = useT();
  const { locale, setLocale } = useI18n();
  const [langOpen, setLangOpen] = useState(false);

  const dashHref = session?.user.role === "ADMIN" ? "/admin" : session?.user.role === "SELLER" ? "/seller" : "/buyer";

  function doSearch() {
    if (!search.trim()) return;
    router.push(`/search?q=${encodeURIComponent(search.trim())}`);
  }

  useEffect(() => {
    function handler(e: MouseEvent) { if (!(e.target as Element).closest(".user-menu-wrap")) setUserMenu(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <div className="bg-gradient-to-r from-pink to-pink-light text-white text-center py-1.5 text-xs font-semibold tracking-wide">
        Free delivery on orders over RWF 30,000 in Kigali &nbsp;·&nbsp; Rwanda&apos;s #1 Marketplace &nbsp;
        <Link href="/marketplace" className="underline font-bold opacity-90 hover:opacity-100">Shop Now</Link>
      </div>

      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
        <div className="max-w-[1280px] mx-auto px-3 sm:px-5 flex flex-wrap sm:flex-nowrap items-center gap-x-3 gap-y-2 py-2.5 sm:py-0 sm:gap-4 sm:h-[68px]">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img src="/flamingo-logo.png" alt="Flamingo Market" className="w-8 h-8 object-contain" />
            <div className="hidden min-[380px]:block">
              <div className="font-extrabold text-[15px] text-pink leading-none tracking-tight">FLAMINGO MARKET</div>
              <div className="text-[9px] text-gray-400 font-medium tracking-widest uppercase leading-none mt-0.5">Shop Easy. Shop Smart.</div>
            </div>
          </Link>

          <div className="order-last basis-full sm:basis-auto sm:order-none sm:flex-1 sm:max-w-[500px] relative">
            <div className="relative">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") doSearch(); }}
                placeholder={t("nav.search")}
                className="w-full pl-4 pr-12 py-2.5 border-[1.5px] border-gray-200 rounded-full text-sm bg-gray-50 outline-none transition-all focus:border-pink focus:bg-white focus:shadow-[0_0_0_3px_rgba(232,38,122,0.08)] placeholder:text-gray-400"
              />
              <button onClick={doSearch} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-pink rounded-full flex items-center justify-center shadow-pink hover:opacity-90 transition-opacity">
                <Search className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Link href="/marketplace" className="hidden lg:block text-sm font-semibold text-gray-600 hover:text-pink transition-colors px-3 py-2 rounded-xl hover:bg-pink-pale">{t("nav.marketplace")}</Link>

            <Link href="/wishlist" className="hidden sm:flex w-9 h-9 rounded-xl border-[1.5px] border-gray-200 items-center justify-center text-gray-500 hover:border-pink hover:text-pink transition-all relative">
              <Heart className="w-4 h-4" />
              {wishCount() > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-pink text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">{wishCount()}</span>}
            </Link>

            {session && (
              <Link href="/messages" className="hidden md:flex w-9 h-9 rounded-xl border-[1.5px] border-gray-200 items-center justify-center text-gray-500 hover:border-pink hover:text-pink transition-all relative" aria-label="Messages">
                <MessageCircle className="w-4 h-4" />
                {unread > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-pink text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">{unread > 9 ? "9+" : unread}</span>}
              </Link>
            )}
            <div className="relative hidden sm:block">
              <button onClick={() => setLangOpen(!langOpen)} aria-label="Language" className="h-9 px-2.5 rounded-xl border-[1.5px] border-gray-200 flex items-center gap-1 text-gray-500 hover:border-pink hover:text-pink transition-all text-[11px] font-black uppercase"><Languages className="w-4 h-4" />{locale}</button>
              {langOpen && <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-2xl shadow-card overflow-hidden z-50 p-1.5">{LOCALES.map(l => <button key={l.code} onClick={() => { setLocale(l.code); setLangOpen(false); }} className={cn("w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-pink-pale", locale === l.code ? "text-pink font-bold" : "text-gray-700")}>{l.flag} {l.label}</button>)}</div>}
            </div>
            <ThemeToggle className="hidden sm:flex w-9 h-9 rounded-xl border-[1.5px] border-gray-200 items-center justify-center text-gray-500 hover:border-pink hover:text-pink transition-all" />
            <NotificationBell />

            <button onClick={toggleCart} className="hidden md:flex w-9 h-9 rounded-xl border-[1.5px] border-gray-200 items-center justify-center text-gray-500 hover:border-pink hover:text-pink transition-all relative">
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-pink text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">{cartCount > 9 ? "9+" : cartCount}</span>}
            </button>

            {session ? (
              <div className="relative user-menu-wrap">
                <button onClick={() => setUserMenu(!userMenu)} className="flex items-center gap-2 border-[1.5px] border-gray-200 rounded-full pl-1 pr-3 py-1 hover:border-pink transition-all">
                  <div className="w-7 h-7 rounded-full bg-gradient-pink flex items-center justify-center text-white text-xs font-black">{session.user.name?.[0]?.toUpperCase()}</div>
                  <span className="text-sm font-semibold hidden sm:block max-w-[90px] truncate text-gray-700">{session.user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>
                {userMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-2xl shadow-card overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100"><div className="text-sm font-bold text-gray-800 truncate">{session.user.name}</div><div className="text-xs text-gray-400 capitalize mt-0.5">{session.user.role?.toLowerCase()}</div></div>
                    <div className="p-1.5">
                      <Link href="/account" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-pink-pale text-sm text-gray-700 transition-colors" onClick={() => setUserMenu(false)}><User className="w-4 h-4 text-pink" /> {t("nav.myAccount")}</Link>
                      <Link href={dashHref} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-pink-pale text-sm text-gray-700 transition-colors" onClick={() => setUserMenu(false)}><LayoutDashboard className="w-4 h-4 text-pink" /> {t("nav.dashboard")}</Link>
                      {session.user.role === "BUYER" && <Link href="/become-seller" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-pink-pale text-sm text-gray-700 transition-colors" onClick={() => setUserMenu(false)}><Store className="w-4 h-4 text-pink" /> {t("nav.becomeSeller")}</Link>}
                      <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-50 text-sm text-red-500 transition-colors"><LogOut className="w-4 h-4" /> {t("nav.signOut")}</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="hidden sm:block text-sm font-semibold text-gray-600 border-[1.5px] border-gray-200 px-4 py-2 rounded-full hover:border-pink hover:text-pink transition-all">{t("nav.signIn")}</Link>
                <Link href="/register" className="text-sm font-bold text-white px-4 py-2 rounded-full bg-gradient-pink shadow-pink hover:opacity-90 transition-all hover:-translate-y-0.5">{t("nav.getStarted")}</Link>
              </div>
            )}

            <button className="lg:hidden w-9 h-9 flex items-center justify-center text-gray-600" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
          </div>
        </div>

        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-[1280px] mx-auto px-5 flex overflow-x-auto scrollbar-hide">
            {CATS.map((c, i) => (
              <Link key={c} href={c === "Home" ? "/" : c === "More" ? "/marketplace" : `/marketplace?category=${c.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
                className={cn("px-4 py-3 text-[13px] font-semibold whitespace-nowrap border-b-[2.5px] transition-all", i === 0 ? "text-pink border-pink" : "text-gray-500 border-transparent hover:text-pink hover:border-pink")}>
                {t(`cat.${c}` as any)}
              </Link>
            ))}
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-5 py-4 space-y-1">
            {CATS.map(c => <Link key={c} href={c === "Home" ? "/" : "/marketplace"} className="block py-2.5 text-sm font-semibold text-gray-600 hover:text-pink border-b border-gray-50 transition-colors" onClick={() => setMobileOpen(false)}>{t(`cat.${c}` as any)}</Link>)}
            <Link href="/wishlist" className="block py-2.5 text-sm font-semibold text-gray-600 hover:text-pink transition-colors" onClick={() => setMobileOpen(false)}>Wishlist ({wishCount()})</Link>
          </div>
        )}
      </nav>
    </>
  );
}
