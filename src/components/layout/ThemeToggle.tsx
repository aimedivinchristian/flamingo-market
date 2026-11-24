"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function applyTheme(dark: boolean) { document.documentElement.classList.toggle("dark", dark); }

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  function toggle() {
    const next = !dark; setDark(next); applyTheme(next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch { /* ignore */ }
  }
  return (
    <button onClick={toggle} aria-label="Toggle dark mode" className={className || "w-9 h-9 rounded-xl border-[1.5px] border-gray-200 flex items-center justify-center text-gray-500 hover:border-pink hover:text-pink transition-all"}>
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
