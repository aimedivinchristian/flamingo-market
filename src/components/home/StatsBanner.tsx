"use client";
import { useEffect, useState } from "react";
interface Stats { sellerCount: number; productCount: number; buyerCount: number; deliveredOrders: number; }
export function StatsBanner() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => { fetch("/api/stats").then(r => r.json()).then(data => { if (!data.error) setStats(data); }).catch(() => {}); }, []);
  if (!stats) return null;
  const items = [
    { num: stats.sellerCount.toLocaleString(),      label: "Verified Sellers"   },
    { num: stats.productCount.toLocaleString(),     label: "Products Available" },
    { num: stats.buyerCount.toLocaleString(),       label: "Registered Buyers"  },
    { num: stats.deliveredOrders.toLocaleString(),  label: "Orders Delivered"   },
  ];
  /* Don't show a hollow stats bar before the platform has real activity */
  const hasActivity = stats.sellerCount > 0 || stats.productCount > 0;
  if (!hasActivity) return null;
  return (
    <div className="py-14" style={{ background: "linear-gradient(135deg,#e8267a 0%,#c4166a 100%)", position: "relative", overflow: "hidden" }}>
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div className="max-w-[1280px] mx-auto px-5 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
          {items.map(({ num, label }, i) => (
            <div key={label} className={`text-center py-4 ${i < items.length - 1 ? "border-r border-white/20" : ""}`}>
              <div className="text-white font-extrabold text-[2rem] tracking-tight mb-1">{num}</div>
              <div className="text-white/70 text-[12.5px] font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
