import Link from "next/link";
export const metadata = { title: "Offline — Flamingo Market" };
export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6 text-center">
      <div>
        <img src="/flamingo-logo.png" alt="" className="w-14 mx-auto mb-4" />
        <h1 className="text-[1.4rem] font-extrabold text-gray-800 mb-2">You&apos;re offline</h1>
        <p className="text-gray-400 text-[14px] mb-6 max-w-xs mx-auto">Check your internet connection and try again. Your cart is saved on this device.</p>
        <Link href="/" className="inline-block bg-gradient-pink text-white font-bold text-[14px] px-7 py-3 rounded-full shadow-pink">Try again</Link>
      </div>
    </main>
  );
}
