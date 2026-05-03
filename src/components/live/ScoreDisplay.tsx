import { memo } from "react";
import { cn } from "@/lib/utils";

interface ScoreDisplayProps {
  blueScore: number;
  orangeScore: number;
  arena?: string;
}

export const ScoreDisplay = memo(function ScoreDisplay({ blueScore, orangeScore, arena }: ScoreDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border-subtle bg-bg-secondary py-6">
      {arena && <p className="mb-2 text-xs uppercase tracking-widest text-text-tertiary">{arena}</p>}
      <div className="flex items-center gap-6">
        <span
          className={cn(
            "font-mono text-5xl font-bold",
            blueScore > orangeScore ? "text-team-blue" : "text-text-primary"
          )}
        >
          {blueScore}
        </span>
        <span className="text-2xl font-bold text-text-tertiary">-</span>
        <span
          className={cn(
            "font-mono text-5xl font-bold",
            orangeScore > blueScore ? "text-team-orange" : "text-text-primary"
          )}
        >
          {orangeScore}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-team-blue" />
          <span className="text-xs font-medium text-text-secondary">Azul</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-team-orange" />
          <span className="text-xs font-medium text-text-secondary">Naranja</span>
        </div>
      </div>
    </div>
  );
});
