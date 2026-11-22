import { cn } from "@/lib/utils";

interface CardProps { children: React.ReactNode; className?: string; hover?: boolean; }

export function Card({ children, className, hover }: CardProps) {
  return (
    <div className={cn(
      "bg-[#1a1a1a] border border-white/7 rounded-2xl",
      hover && "transition-all duration-300 hover:-translate-y-1.5 hover:border-pink/25 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)]",
      className
    )}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon, trend, color = "pink" }: { label: string; value: string | number; icon: string; trend?: string; color?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color === "cyan" ? "bg-cyan/10" : color === "green" ? "bg-green-500/10" : color === "amber" ? "bg-amber-500/10" : "bg-pink/10"}`}>
          {icon}
        </div>
        {trend && <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">{trend}</span>}
      </div>
      <div className="text-2xl font-bold font-display mb-0.5">{value}</div>
      <div className="text-xs text-white/40 font-medium">{label}</div>
    </Card>
  );
}
