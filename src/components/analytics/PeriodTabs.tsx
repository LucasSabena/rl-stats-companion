import { cn } from "@/lib/utils";
import type { AnalyticsPeriod } from "@/lib/types";

const periods: { value: AnalyticsPeriod; label: string }[] = [
  { value: "day", label: "Dia" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "session", label: "Sesion" },
];

interface PeriodTabsProps {
  active: AnalyticsPeriod;
  onChange: (period: AnalyticsPeriod) => void;
}

export function PeriodTabs({ active, onChange }: PeriodTabsProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border-subtle bg-bg-tertiary p-0.5">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onChange(period.value)}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-200",
            active === period.value
              ? "bg-accent-primary text-white shadow-sm"
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
