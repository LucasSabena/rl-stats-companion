import { memo } from "react";
import { cn } from "@/lib/utils";

interface ScoreDisplayProps {
  blueScore: number;
  orangeScore: number;
  arena?: string;
}

export const ScoreDisplay = memo(function ScoreDisplay({ blueScore, orangeScore, arena }: ScoreDisplayProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border-subtle bg-bg-secondary">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-team-blue-bg)] via-transparent to-[var(--color-team-orange-bg)] opacity-50" />

      <div className="relative flex flex-col items-center justify-center py-8">
        {arena && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
            {arena}
          </p>
        )}
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center gap-1">
            <span
              className={cn(
                "font-mono text-6xl font-bold tracking-tight transition-colors duration-300",
                blueScore > orangeScore
                  ? "text-team-blue drop-shadow-[0_0_12px_var(--color-team-blue-glow)]"
                  : "text-text-primary"
              )}
            >
              {blueScore}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-team-blue/60">
              Azul
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-bold text-text-muted">:</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span
              className={cn(
                "font-mono text-6xl font-bold tracking-tight transition-colors duration-300",
                orangeScore > blueScore
                  ? "text-team-orange drop-shadow-[0_0_12px_var(--color-team-orange-glow)]"
                  : "text-text-primary"
              )}
            >
              {orangeScore}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-team-orange/60">
              Naranja
            </span>
          </div>
        </div>

        {/* Team color dots */}
        <div className="mt-4 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-team-blue shadow-[0_0_6px_var(--color-team-blue-glow)]" />
          </div>
          <div className="h-3 w-px bg-border-subtle" />
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-team-orange shadow-[0_0_6px_var(--color-team-orange-glow)]" />
          </div>
        </div>
      </div>
    </div>
  );
});
