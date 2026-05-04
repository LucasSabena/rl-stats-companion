import { memo } from "react";
import { cn } from "@/lib/utils";
import { formatBoost, formatSpeed } from "@/lib/utils";
import type { Player } from "@/lib/types";

interface PlayerCardProps {
  player: Player;
  isCurrentUser?: boolean;
}

export const PlayerCard = memo(function PlayerCard({ player, isCurrentUser }: PlayerCardProps) {
  const isBlue = player.team === 0;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all duration-200",
        isCurrentUser
          ? "border-accent-primary/30 bg-accent-primary-muted glow-blue"
          : "border-border-subtle bg-bg-secondary hover:border-border-default"
      )}
    >
      {/* Header: name + score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold",
              isBlue
                ? "bg-team-blue-bg text-team-blue"
                : "bg-team-orange-bg text-team-orange"
            )}
          >
            {player.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-sm font-semibold text-text-primary">{player.name}</span>
            {isCurrentUser && (
              <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-accent-primary">
                Tu
              </span>
            )}
          </div>
        </div>
        <span className="font-mono text-lg font-bold text-text-primary">{player.score}</span>
      </div>

      {/* Stats grid */}
      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        <Stat label="Goles" value={player.goals} />
        <Stat label="Asist." value={player.assists} />
        <Stat label="Tiros" value={player.shots} />
        <Stat label="Paradas" value={player.saves} />
      </div>

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
      <div className="mt-3">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-bg-tertiary"
          role="progressbar"
          aria-valuenow={Math.round(player.boostAmount)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Boost de ${player.name}`}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              player.boostAmount > 60
                ? "bg-accent-success shadow-[0_0_8px_var(--color-accent-success)]"
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
      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-bold text-text-primary">
        {displayValue ?? value}
      </p>
    </div>
  );
}
