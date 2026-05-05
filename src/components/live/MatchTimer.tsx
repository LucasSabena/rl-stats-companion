import { memo } from "react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils";

interface MatchTimerProps {
  timeRemaining: number;
  isOvertime: boolean;
}

export const MatchTimer = memo(function MatchTimer({ timeRemaining, isOvertime }: MatchTimerProps) {
  return (
    <div className="flex items-center gap-2">
      {isOvertime && (
        <span className="rounded-full bg-accent-warning-subtle border border-accent-warning/20 px-2.5 py-0.5 text-xs font-bold text-accent-warning">
          PRORROGA
        </span>
      )}
      <div
        className={cn(
          "rounded-xl border px-4 py-2 font-mono text-xl font-bold tracking-wider",
          isOvertime
            ? "border-accent-warning/30 bg-accent-warning-subtle text-accent-warning"
            : "border-border-subtle bg-bg-surface text-text-primary"
        )}
      >
        {isOvertime ? `+${formatDuration(timeRemaining)}` : formatDuration(timeRemaining)}
      </div>
    </div>
  );
});
