import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "flat";
  trendValue?: string;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, trendValue, className }: StatCardProps) {
  const trendColors = {
    up: "text-accent-secondary",
    down: "text-accent-danger",
    flat: "text-text-tertiary",
  };

  const displayValue = typeof value === "number" ? formatNumber(value) : value;

  return (
    <div
      className={cn(
        "rounded-lg bg-bg-secondary p-4 transition-all duration-150 ease-out hover:shadow-level-2",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-text-tertiary">
            {label}
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-text-primary">{displayValue}</p>
        </div>
        {Icon && <Icon size={20} className="text-text-tertiary" />}
      </div>
      {trend && (
        <div className={cn("mt-2 flex items-center gap-1 text-xs", trendColors[trend])}>
          <span>{trend === "up" ? "↑" : trend === "down" ? "↓" : "—"}</span>
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}
