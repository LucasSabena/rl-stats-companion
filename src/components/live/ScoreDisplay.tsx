import { memo } from "react";
import { cn } from "@/lib/utils";
import { getArenaDisplayName, getArenaImagePath } from "@/lib/arenaMap";
import { useTranslation } from "react-i18next";

interface ScoreDisplayProps {
  blueScore: number;
  orangeScore: number;
  arena?: string;
}

export const ScoreDisplay = memo(function ScoreDisplay({ blueScore, orangeScore, arena }: ScoreDisplayProps) {
  const { t } = useTranslation(["live", "common"]);
  const displayName = arena ? getArenaDisplayName(arena) : null;
  const imagePath = arena ? getArenaImagePath(arena) : null;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border-subtle bg-bg-surface">
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-team-blue-bg)] via-transparent to-[var(--color-team-orange-bg)] opacity-50" />

      <div className="relative flex items-center justify-center py-3 gap-6">
        {displayName && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {imagePath && (
              <img
                src={imagePath}
                alt={displayName}
                className="h-5 w-5 rounded object-cover border border-border-subtle bg-bg-panel"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary hidden sm:inline">
              {displayName}
            </p>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "font-mono text-4xl font-bold tracking-tight transition-colors duration-300",
                blueScore > orangeScore
                  ? "text-team-blue drop-shadow-[0_0_12px_var(--color-team-blue-glow)]"
                  : "text-text-primary"
              )}
            >
              {blueScore}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-team-blue/60">
              {t("live:teams.blueShort")}
            </span>
          </div>

          <span className="text-xl font-bold text-text-muted pb-2">:</span>

          <div className="flex flex-col items-center">
            <span
              className={cn(
                "font-mono text-4xl font-bold tracking-tight transition-colors duration-300",
                orangeScore > blueScore
                  ? "text-team-orange drop-shadow-[0_0_12px_var(--color-team-orange-glow)]"
                  : "text-text-primary"
              )}
            >
              {orangeScore}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-team-orange/60">
              {t("live:teams.orangeShort")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
