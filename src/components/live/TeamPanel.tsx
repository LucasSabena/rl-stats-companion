import { memo } from "react";
import { cn } from "@/lib/utils";
import { PlayerCard } from "./PlayerCard";
import type { LiveMmrPlayer, Player } from "@/lib/types";

interface TeamPanelProps {
  team: "blue" | "orange";
  players: Player[];
  mmrByPlayerId?: Record<string, LiveMmrPlayer>;
  mmrLoading?: boolean;
}

export const TeamPanel = memo(function TeamPanel({ team, players, mmrByPlayerId, mmrLoading }: TeamPanelProps) {
  const isBlue = team === "blue";
  const averageMmr = (() => {
    const values = players
      .map((player) => mmrByPlayerId?.[player.id]?.mmr)
      .filter((value): value is number => typeof value === "number");

    if (values.length === 0) return null;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  })();

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all duration-200",
        isBlue
          ? "border-team-blue/20 bg-team-blue-bg"
          : "border-team-orange/20 bg-team-orange-bg"
      )}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <div
          className={cn(
            "h-3 w-3 rounded-full",
            isBlue
              ? "bg-team-blue shadow-[0_0_8px_var(--color-team-blue-glow)]"
              : "bg-team-orange shadow-[0_0_8px_var(--color-team-orange-glow)]"
          )}
        />
        <h3
          className={cn(
            "font-display text-sm font-bold uppercase tracking-wide",
            isBlue ? "text-team-blue" : "text-team-orange"
          )}
        >
          {isBlue ? "Equipo Azul" : "Equipo Naranja"}
        </h3>
        <span className="ml-auto font-mono text-lg font-bold text-text-primary">
          {players.reduce((sum, p) => sum + p.score, 0)}
        </span>
      </div>

      {(averageMmr !== null || mmrLoading) && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-border-subtle/60 bg-bg-surface/50 px-3 py-2 text-xs text-text-tertiary">
          <span>MMR promedio</span>
          <span className="font-mono font-semibold text-text-secondary">
            {averageMmr !== null ? averageMmr : "Buscando..."}
          </span>
        </div>
      )}

      <div className="space-y-2">
        {players.length === 0 ? (
          <p className="py-4 text-center text-xs text-text-muted">Sin jugadores</p>
        ) : (
          players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              mmr={mmrByPlayerId?.[player.id] ?? null}
              mmrLoading={mmrLoading}
            />
          ))
        )}
      </div>
    </div>
  );
});
