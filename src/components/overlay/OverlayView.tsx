import { memo, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { useLiveMatch } from "@/hooks/useLiveMatch";
import { useLiveStore } from "@/stores/liveStore";
import { OverlayDismissButton } from "@/components/overlay/OverlayDismissButton";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils";
import type { Player, OverlayDisplaySettings } from "@/lib/types";

const DEFAULT_DISPLAY: OverlayDisplaySettings = {
  showScore: true,
  showPlayers: true,
  showStats: true,
  showTimer: true,
  fontScale: "medium",
  opacity: 0.75,
};

export function OverlayView() {
  useLiveMatch();

  const currentMatch = useLiveStore((s) => s.currentMatch);
  const connectionStatus = useLiveStore((s) => s.connectionStatus);
  const [display, setDisplay] = useState<OverlayDisplaySettings>(DEFAULT_DISPLAY);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const unlisteners: Array<() => void> = [];

    listen<OverlayDisplaySettings>("overlay-settings-updated", (event) => {
      setDisplay(event.payload);
    }).then((fn) => unlisteners.push(fn));

    listen<number>("overlay-opacity-changed", (event) => {
      setDisplay((prev) => ({ ...prev, opacity: event.payload }));
    }).then((fn) => unlisteners.push(fn));

    listen<boolean>("overlay-interactive-mode", (event) => {
      setInteractive(event.payload);
    }).then((fn) => unlisteners.push(fn));

    return () => {
      unlisteners.forEach((fn) => fn());
    };
  }, []);

  const fontScaleClass =
    display.fontScale === "large" ? "text-[13px]" :
    display.fontScale === "small" ? "text-[9px]" : "text-[11px]";

  return (
    <div
      className="overlay-mode group relative flex h-screen w-screen flex-col overflow-hidden font-sans text-text-primary"
      style={{
        opacity: display.opacity,
        background: interactive
          ? "rgba(10, 10, 15, 0.7)"
          : "transparent",
        backdropFilter: interactive ? "blur(8px)" : "none",
        WebkitBackdropFilter: interactive ? "blur(8px)" : "none",
        borderRadius: interactive ? "12px" : "0",
        transition: "opacity 0.3s ease, background 0.3s ease",
      }}
    >
      {interactive && <OverlayDismissButton />}

      {currentMatch ? (
        <MatchContent
          match={currentMatch}
          connectionStatus={connectionStatus}
          display={display}
          fontScaleClass={fontScaleClass}
        />
      ) : (
        <WaitingState connectionStatus={connectionStatus} display={display} />
      )}
    </div>
  );
}

function WaitingState({
  connectionStatus,
  display,
}: {
  connectionStatus: string;
  display: OverlayDisplaySettings;
}) {
  const label =
    connectionStatus === "game_not_running"
      ? "Esperando Rocket League..."
      : "Esperando partida...";

  return (
    <div className="flex flex-1 items-center justify-center" style={{ opacity: display.opacity }}>
      <p className="animate-pulse text-xs text-text-tertiary">{label}</p>
    </div>
  );
}

interface MatchContentProps {
  match: NonNullable<ReturnType<typeof useLiveStore.getState>["currentMatch"]>;
  connectionStatus: string;
  display: OverlayDisplaySettings;
  fontScaleClass: string;
}

function MatchContent({ match, connectionStatus, display, fontScaleClass }: MatchContentProps) {
  const bluePlayers = match.players.filter((p: Player) => p.team === 0);
  const orangePlayers = match.players.filter((p: Player) => p.team === 1);

  return (
    <div className="flex flex-1 flex-col gap-2 p-3 pt-4">
      {display.showTimer && (
        <OverlayTopBar
          arena={match.gameState.arena ?? undefined}
          timeRemaining={match.gameState.timeRemaining}
          isOvertime={match.gameState.isOvertime}
          connectionStatus={connectionStatus}
        />
      )}

      {display.showScore && (
        <ScoreRow blueScore={match.teamBlueScore} orangeScore={match.teamOrangeScore} />
      )}

      {display.showPlayers && (
        <div className="flex flex-1 gap-2 overflow-hidden" style={{ fontSize: fontScaleClass }}>
          <TeamColumn team="blue" players={bluePlayers} display={display} />
          <TeamColumn team="orange" players={orangePlayers} display={display} />
        </div>
      )}
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
  display,
}: {
  team: "blue" | "orange";
  players: Player[];
  display: OverlayDisplaySettings;
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
          <OverlayPlayerRow key={p.id} player={p} display={display} />
        ))
      )}
    </div>
  );
});

const OverlayPlayerRow = memo(function OverlayPlayerRow({
  player,
  display,
}: {
  player: Player;
  display: OverlayDisplaySettings;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded px-1 py-0.5",
        player.team === 0 ? "bg-team-blue/10" : "bg-team-orange/10"
      )}
    >
      <span className="w-[56px] truncate font-medium text-text-secondary">
        {player.name}
      </span>
      <span className="ml-auto font-mono font-semibold text-text-primary tabular-nums">
        {player.score}
      </span>
      {display.showStats && (
        <span className="ml-0.5 flex items-center gap-0.5 text-[9px] text-text-tertiary">
          <span className="tabular-nums">{player.goals}</span>
          <span className="text-text-muted">G</span>
          <span className="tabular-nums">{player.assists}</span>
          <span className="text-text-muted">A</span>
          <span className="tabular-nums">{player.saves}</span>
          <span className="text-text-muted">S</span>
        </span>
      )}
    </div>
  );
});
