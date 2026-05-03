import { memo } from "react";
import { cn } from "@/lib/utils";
import { formatBoost, formatSpeed } from "@/lib/utils";
import type { Player } from "@/lib/types";

interface PlayerCardProps {
  player: Player;
  isCurrentUser?: boolean;
}

export const PlayerCard = memo(function PlayerCard({ player, isCurrentUser }: PlayerCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-all duration-150",
        isCurrentUser
          ? "border-accent-primary/30 bg-accent-primary/5"
          : "border-border-subtle bg-bg-secondary"
      )}
    >
      {/* Header: name + score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
              player.team === 0 ? "bg-team-blue/20 text-team-blue" : "bg-team-orange/20 text-team-orange"
            )}
          >
            {player.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-semibold text-text-primary">{player.name}</span>
        </div>
        <span className="font-mono text-sm font-bold text-text-primary">{player.score}</span>
      </div>

      {/* Row 1: Goles | Asistencias | Tiros | Salvadas */}
      <div className="mt-2 grid grid-cols-4 gap-2 text-center">
        <Stat label="Goles" value={player.goals} />
        <Stat label="Asist." value={player.assists} />
        <Stat label="Tiros" value={player.shots} />
        <Stat label="Paradas" value={player.saves} />
      </div>

      {/* Row 2: Toques | Demos | Velocidad | Boost */}
      <div className="mt-2 grid grid-cols-4 gap-2 text-center">
        <Stat label="Toques" value={player.touches} />
        <Stat label="Demos" value={player.demos} />
        <Stat
          label="Veloc."
          value={player.speed}
          displayValue={formatSpeed(player.speed)}
        />
        <Stat
          label="Boost"
          value={player.boostAmount}
          displayValue={formatBoost(player.boostAmount)}
        />
      </div>

      {/* Boost bar */}
      <div className="mt-2">
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-bg-tertiary"
          role="progressbar"
          aria-valuenow={Math.round(player.boostAmount)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Boost de ${player.name}`}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              player.boostAmount > 60
                ? "bg-accent-secondary"
                : player.boostAmount > 30
                  ? "bg-accent-warning"
                  : "bg-accent-danger"
            )}
            style={{ width: `${player.boostAmount}%` }}
          />
        </div>
      </div>
    </div>
  );
});

function Stat({
  label,
  value,
  displayValue,
}: {
  label: string;
  value: number;
  displayValue?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-text-tertiary">{label}</p>
      <p className="font-mono text-sm font-semibold text-text-primary">
        {displayValue ?? value}
      </p>
    </div>
  );
}
