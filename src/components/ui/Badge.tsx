import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "pink" | "cyan" | "amber" | "green" | "red" | "gray";
  className?: string;
}

export function Badge({ children, variant = "pink", className }: BadgeProps) {
  const variants = {
    pink: "bg-pink/10 text-pink border-pink/20",
    cyan: "bg-cyan/10 text-cyan border-cyan/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    gray: "bg-white/5 text-white/60 border-white/10",
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border", variants[variant], className)}>
      {children}
    </span>
  );
}
