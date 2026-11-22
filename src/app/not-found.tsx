import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-[6rem] font-extrabold text-gray-100 leading-none mb-2">404</div>
        <div className="w-16 h-16 bg-pink-pale rounded-2xl flex items-center justify-center mx-auto mb-6 -mt-8">
          <svg className="w-8 h-8 text-pink" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Page Not Found</h1>
        <p className="text-gray-400 text-sm mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="bg-gradient-pink text-white font-bold text-sm px-6 py-3 rounded-full shadow-pink hover:opacity-90 transition-all">
            Back to Home
          </Link>
          <Link href="/marketplace" className="border-[1.5px] border-gray-200 text-gray-600 font-semibold text-sm px-6 py-3 rounded-full hover:border-pink hover:text-pink transition-all">
            Browse Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
