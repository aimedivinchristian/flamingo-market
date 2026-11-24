"use client";
import { useEffect } from "react";
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6 text-center">
      <div>
        <div className="text-5xl mb-3">🦩</div>
        <h1 className="text-[1.4rem] font-extrabold text-gray-800 mb-2">Something went wrong</h1>
        <p className="text-gray-400 text-[14px] mb-6 max-w-xs mx-auto">An unexpected error occurred. Please try again — if it keeps happening, contact support.</p>
        <button onClick={reset} className="bg-gradient-pink text-white font-bold text-[14px] px-7 py-3 rounded-full shadow-pink">Try again</button>
      </div>
    </main>
  );
}
