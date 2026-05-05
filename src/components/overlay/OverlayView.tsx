import { memo, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { useLiveMatch } from "@/hooks/useLiveMatch";
import { useLiveStore } from "@/stores/liveStore";
import { OverlayDismissButton } from "@/components/overlay/OverlayDismissButton";
import { cn, formatDuration } from "@/lib/utils";
import { getArenaDisplayName } from "@/lib/arenaMap";
import type { Player, OverlayDisplaySettings } from "@/lib/types";

const DEFAULT_DISPLAY: OverlayDisplaySettings = {
  showScore: true,
  showPlayers: true,
  showStats: true,
  showTimer: true,
  fontScale: "medium",
  opacity: 0.75,
  playerScope: "all",
  showNames: true,
  showPlayerScore: true,
  showBoost: false,
};

export function OverlayView() {
  useLiveMatch();

  const currentMatch = useLiveStore((s) => s.currentMatch);
  const connectionStatus = useLiveStore((s) => s.connectionStatus);
  const [display, setDisplay] = useState<OverlayDisplaySettings>(DEFAULT_DISPLAY);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    document.body.classList.add("overlay-body");
    document.documentElement.style.background = "transparent";

    return () => {
      document.body.classList.remove("overlay-body");
      document.documentElement.style.background = "";
    };
  }, []);

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
      className={cn(
        "overlay-mode flex h-screen w-screen flex-col overflow-hidden font-sans text-text-primary",
        interactive && "pointer-events-auto"
      )}
      style={{ opacity: display.opacity }}
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
        <WaitingState connectionStatus={connectionStatus} />
      )}
    </div>
  );
}

function WaitingState({ connectionStatus }: { connectionStatus: string }) {
  const label =
    connectionStatus === "game_not_running"
      ? "Esperando Rocket League..."
      : "Esperando partida...";

  return (
    <div className="flex flex-1 items-center justify-center">
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
  const localTeam = identifyLocalTeam(match.players);
  const allPlayers = match.players;
  const visiblePlayers = display.playerScope === "team" && localTeam !== null
    ? allPlayers.filter((p: Player) => p.team === localTeam)
    : allPlayers;

  const bluePlayers = visiblePlayers.filter((p: Player) => p.team === 0);
  const orangePlayers = visiblePlayers.filter((p: Player) => p.team === 1);
  const showBothTeams = bluePlayers.length > 0 && orangePlayers.length > 0;

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
          {bluePlayers.length > 0 && (
            <TeamColumn players={bluePlayers} display={display} />
          )}
          {showBothTeams && (
            <TeamColumn players={orangePlayers} display={display} />
          )}
          {orangePlayers.length > 0 && !showBothTeams && (
            <TeamColumn players={orangePlayers} display={display} />
          )}
        </div>
      )}
    </div>
  );
}

function identifyLocalTeam(players: Player[]): number | null {
  if (players.length >= 4) return null;
  if (players.length === 0) return null;

  // If only players from one team exist, that's our team
  const teams = new Set(players.map((p) => p.team));
  if (teams.size === 1) return players[0]?.team ?? null;

  // In solo queue (3v3), the team with 1 player vs 3+ is the local team
  // In 2v2, if we have 2 players on blue and 2 on orange, can't determine
  return null;
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
        {arena && <span className="uppercase tracking-wider">{getArenaDisplayName(arena)}</span>}
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
  players,
  display,
}: {
  players: Player[];
  display: OverlayDisplaySettings;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden">
      {players.length === 0 ? (
        <p className="text-[10px] text-text-muted px-1">-</p>
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
  const isBlue = player.team === 0;

  return (
    <div className="flex flex-col gap-0.5">
      <div
        className={cn(
          "flex items-center gap-1 rounded px-1 py-0.5",
          isBlue ? "bg-team-blue/15" : "bg-team-orange/15"
        )}
      >
        {display.showNames && (
          <span className="truncate font-medium text-text-secondary max-w-[60px]">
            {player.name}
          </span>
        )}
        {display.showPlayerScore && (
          <span className={cn("font-mono font-semibold text-text-primary tabular-nums", !display.showNames && "ml-0")}>
            {player.score}
          </span>
        )}
        {display.showStats && (
          <span className={cn("flex items-center gap-0.5 text-[9px] text-text-tertiary", display.showNames || display.showPlayerScore ? "ml-auto" : "ml-0")}>
            <span className="tabular-nums">{player.goals}</span>
            <span className="text-text-muted">G</span>
            <span className="tabular-nums">{player.assists}</span>
            <span className="text-text-muted">A</span>
            <span className="tabular-nums">{player.saves}</span>
            <span className="text-text-muted">S</span>
          </span>
        )}
      </div>
      {display.showBoost && (
        <BoostBar boost={player.boostAmount} />
      )}
    </div>
  );
});

function BoostBar({ boost }: { boost: number }) {
  const pct = Math.min(100, Math.max(0, boost));
  const colorClass =
    pct > 60 ? "bg-boost-full" :
    pct > 25 ? "bg-boost-mid" : "bg-boost-low";

  return (
    <div className="h-1 w-full rounded-full bg-text-muted/20">
      <div
        className={cn("h-full rounded-full transition-all duration-300", colorClass)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
