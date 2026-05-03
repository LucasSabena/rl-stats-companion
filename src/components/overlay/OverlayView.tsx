import { memo } from "react";
import { useLiveMatch } from "@/hooks/useLiveMatch";
import { useLiveStore } from "@/stores/liveStore";
import { OverlayDismissButton } from "@/components/overlay/OverlayDismissButton";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils";
import type { Player } from "@/lib/types";

export function OverlayView() {
  useLiveMatch();

  const currentMatch = useLiveStore((s) => s.currentMatch);
  const connectionStatus = useLiveStore((s) => s.connectionStatus);

  return (
    <div className="overlay-mode group relative flex h-screen w-screen flex-col overflow-hidden font-sans text-text-primary">
      <OverlayDismissButton />

      {currentMatch ? (
        <MatchContent match={currentMatch} connectionStatus={connectionStatus} />
      ) : (
        <WaitingState connectionStatus={connectionStatus} />
      )}
    </div>
  );
}

function WaitingState({ connectionStatus }: { connectionStatus: string }) {
  const label = connectionStatus === "game_not_running"
    ? "Esperando Rocket League..."
    : "Esperando partida...";

  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="animate-pulse text-xs text-text-tertiary">{label}</p>
    </div>
  );
}

interface MatchContentProps {
  match: NonNullable<ReturnType<typeof useLiveStore.getState>['currentMatch']>;
  connectionStatus: string;
}

function MatchContent({ match, connectionStatus }: MatchContentProps) {
  const bluePlayers = match.players.filter((p: Player) => p.team === 0);
  const orangePlayers = match.players.filter((p: Player) => p.team === 1);

  return (
    <div className="flex flex-1 flex-col gap-2 p-3 pt-4">
      {/* Top bar: connection dot + arena + timer */}
      <OverlayTopBar
        arena={match.gameState.arena ?? undefined}
        timeRemaining={match.gameState.timeRemaining}
        isOvertime={match.gameState.isOvertime}
        connectionStatus={connectionStatus}
      />

      {/* Score */}
      <ScoreRow blueScore={match.teamBlueScore} orangeScore={match.teamOrangeScore} />

      {/* Teams side by side */}
      <div className="flex flex-1 gap-2 overflow-hidden">
        <TeamColumn team="blue" players={bluePlayers} />
        <TeamColumn team="orange" players={orangePlayers} />
      </div>
    </div>
  );
}

function OverlayTopBar({
  arena,
  timeRemaining,
  isOvertime,
  connectionStatus,
}: {
  arena?: string;
  timeRemaining: number;
  isOvertime: boolean;
  connectionStatus: string;
}) {
  const isConnected = connectionStatus === "connected";

  return (
    <div className="flex items-center justify-between text-[10px] text-text-tertiary">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            isConnected ? "bg-accent-secondary" : "bg-accent-warning"
          )}
        />
        {arena && <span className="uppercase tracking-wider">{arena}</span>}
      </div>
      <div
        className={cn(
          "font-mono text-xs font-bold",
          isOvertime ? "text-accent-warning" : "text-text-secondary"
        )}
      >
        {isOvertime ? `+${formatDuration(timeRemaining)}` : formatDuration(timeRemaining)}
      </div>
    </div>
  );
}

const ScoreRow = memo(function ScoreRow({
  blueScore,
  orangeScore,
}: {
  blueScore: number;
  orangeScore: number;
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      <span
        className={cn(
          "font-mono text-3xl font-bold",
          blueScore > orangeScore ? "text-team-blue" : "text-text-primary"
        )}
      >
        {blueScore}
      </span>
      <span className="text-lg font-bold text-text-tertiary">-</span>
      <span
        className={cn(
          "font-mono text-3xl font-bold",
          orangeScore > blueScore ? "text-team-orange" : "text-text-primary"
        )}
      >
        {orangeScore}
      </span>
    </div>
  );
});

const TeamColumn = memo(function TeamColumn({
  team,
  players,
}: {
  team: "blue" | "orange";
  players: Player[];
}) {
  const isBlue = team === "blue";

  return (
    <div className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden">
      <div className="flex items-center gap-1.5 pb-1">
        <div className={cn("h-2 w-2 rounded-full", isBlue ? "bg-team-blue" : "bg-team-orange")} />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
          {isBlue ? "Azul" : "Nar"}
        </span>
      </div>
      {players.length === 0 ? (
        <p className="text-[10px] text-text-muted">Sin jugadores</p>
      ) : (
        players.map((p) => (
          <OverlayPlayerRow key={p.id} player={p} />
        ))
      )}
    </div>
  );
});

const OverlayPlayerRow = memo(function OverlayPlayerRow({
  player,
}: {
  player: Player;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded px-1 py-0.5 text-[11px]",
        player.team === 0
          ? "bg-team-blue/10"
          : "bg-team-orange/10"
      )}
    >
      <span className="w-[56px] truncate font-medium text-text-secondary">
        {player.name}
      </span>
      <span className="ml-auto font-mono text-[11px] font-semibold text-text-primary tabular-nums">
        {player.score}
      </span>
      <span className="ml-0.5 flex items-center gap-0.5 text-[9px] text-text-tertiary">
        <span className="tabular-nums">{player.goals}</span>
        <span className="text-text-muted">G</span>
        <span className="tabular-nums">{player.assists}</span>
        <span className="text-text-muted">A</span>
        <span className="tabular-nums">{player.saves}</span>
        <span className="text-text-muted">S</span>
      </span>
    </div>
  );
});
