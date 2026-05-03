import { memo } from "react";
import { cn } from "@/lib/utils";
import { PlayerCard } from "./PlayerCard";
import type { Player } from "@/lib/types";

interface TeamPanelProps {
  team: "blue" | "orange";
  players: Player[];
}

export const TeamPanel = memo(function TeamPanel({ team, players }: TeamPanelProps) {
  const isBlue = team === "blue";

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        isBlue
          ? "border-team-blue/30 bg-team-blue/5"
          : "border-team-orange/30 bg-team-orange/5"
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className={cn("h-3 w-3 rounded-full", isBlue ? "bg-team-blue" : "bg-team-orange")} />
        <h3 className={cn("text-sm font-bold uppercase tracking-wide", isBlue ? "text-team-blue" : "text-team-orange")}>
          {isBlue ? "Equipo Azul" : "Equipo Naranja"}
        </h3>
        <span className="ml-auto font-mono text-lg font-bold text-text-primary">
          {players.reduce((sum, p) => sum + p.score, 0)}
        </span>
      </div>

      <div className="space-y-2">
        {players.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </div>
  );
});
