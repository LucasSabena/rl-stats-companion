import { cn } from "@/lib/utils";
import type { AnalyticsPeriod } from "@/lib/types";

const periods: { value: AnalyticsPeriod; label: string }[] = [
  { value: "day", label: "Día" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "session", label: "Sesión" },
];

interface PeriodTabsProps {
  active: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
}

export function PeriodTabs({ active, onChange }: PeriodTabsProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border-subtle bg-bg-secondary p-1">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onChange(period.value)}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition-all",
            active === period.value
              ? "bg-accent-primary text-white shadow-level-1"
              : "text-text-secondary hover:text-text-primary"
          )}
          aria-pressed={active === period.value}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
