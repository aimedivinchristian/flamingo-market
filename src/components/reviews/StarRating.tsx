"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
interface Props { value: number; onChange?: (v: number) => void; size?: "sm" | "md" | "lg"; readonly?: boolean; }
const sizes = { sm: "w-3.5 h-3.5", md: "w-5 h-5", lg: "w-7 h-7" };
export function StarRating({ value, onChange, size = "md", readonly = false }: Props) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  return (
    <div className={cn("flex gap-0.5", !readonly && "cursor-pointer")} onMouseLeave={() => !readonly && setHovered(0)}>
      {[1,2,3,4,5].map(star => (
        <Star key={star} className={cn(sizes[size], "transition-all duration-100", star <= active ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-100", !readonly && "hover:scale-110")}
          onMouseEnter={() => !readonly && setHovered(star)} onClick={() => !readonly && onChange?.(star)} />
      ))}
    </div>
  );
}
export function RatingBadge({ avg, count, size = "sm" }: { avg: number; count: number; size?: "sm" | "md" }) {
  return (
    <div className="flex items-center gap-1.5">
      <StarRating value={Math.round(avg)} size={size} readonly />
      <span className={cn("font-bold text-gray-700", size === "sm" ? "text-[13px]" : "text-[15px]")}>{avg.toFixed(1)}</span>
      <span className={cn("text-gray-400", size === "sm" ? "text-[12px]" : "text-[13px]")}>({count} review{count !== 1 ? "s" : ""})</span>
    </div>
  );
}
