import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "cyan" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
      primary: "bg-gradient-pink text-white shadow-[0_4px_24px_rgba(255,79,160,0.35)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(255,79,160,0.5)]",
      secondary: "bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:-translate-y-0.5",
      cyan: "bg-gradient-cyan text-dark font-bold shadow-[0_4px_24px_rgba(51,214,255,0.3)] hover:-translate-y-0.5",
      ghost: "text-white/70 hover:text-white hover:bg-white/5",
      danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
    };
    const sizes = { sm: "px-4 py-2 text-sm", md: "px-6 py-2.5 text-sm", lg: "px-8 py-3 text-base" };

    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
        {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
