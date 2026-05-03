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
        <span className="rounded-full bg-accent-warning/20 px-2 py-0.5 text-xs font-bold text-accent-warning">
          PRÓRROGA
        </span>
      )}
      <div
        className={cn(
          "rounded-lg border px-4 py-2 font-mono text-2xl font-bold tracking-wider",
          isOvertime
            ? "border-accent-warning/30 bg-accent-warning/10 text-accent-warning"
            : "border-border-subtle bg-bg-secondary text-text-primary"
        )}
      >
        {isOvertime ? `+${formatDuration(timeRemaining)}` : formatDuration(timeRemaining)}
      </div>
    </div>
  );
});
