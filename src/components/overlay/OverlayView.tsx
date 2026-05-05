import { memo, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { useLiveMatch } from "@/hooks/useLiveMatch";
import { useLiveMmr } from "@/hooks/useLiveMmr";
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
  showMmr: false,
};

// ─── Font Scale Map ─────────────────────────────────────────────────────────
// Base sizes for overlay — tuned for readability during gameplay
const FONT_SCALE = {
  small: {
    root: "text-[9px]",
    score: "text-[20px]",
    timer: "text-[11px]",
    name: "max-w-[48px]",
    playerScore: "text-[11px]",
    stats: "text-[8px]",
    mmr: "text-[8px]",
    arena: "text-[8px]",
  },
  medium: {
    root: "text-[11px]",
    score: "text-[28px]",
    timer: "text-[14px]",
    name: "max-w-[64px]",
    playerScore: "text-[13px]",
    stats: "text-[9px]",
    mmr: "text-[9px]",
    arena: "text-[10px]",
  },
  large: {
    root: "text-[13px]",
    score: "text-[36px]",
    timer: "text-[16px]",
    name: "max-w-[80px]",
    playerScore: "text-[15px]",
    stats: "text-[10px]",
    mmr: "text-[10px]",
    arena: "text-[11px]",
  },
} as const;

// ─── Font Scale Type ────────────────────────────────────────────────────────
type FontScale = typeof FONT_SCALE[keyof typeof FONT_SCALE];

export function OverlayView() {
  useLiveMatch();
  const mmrData = useLiveMmr();

  const currentMatch = useLiveStore((s) => s.currentMatch);
  const connectionStatus = useLiveStore((s) => s.connectionStatus);
  const [display, setDisplay] = useState<OverlayDisplaySettings>(DEFAULT_DISPLAY);
  const [interactive, setInteractive] = useState(false);

  // Build MMR map from live data
  const mmrMap = mmrData.data?.players.reduce((acc, p) => {
    acc[p.primaryId] = p.mmr;
    return acc;
  }, {} as Record<string, number | null>) ?? {};

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

  const fs = FONT_SCALE[display.fontScale];

  return (
    <div
      className={cn(
        "overlay-mode flex h-screen w-screen flex-col overflow-hidden font-sans text-text-primary",
        fs.root,
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
          fontScale={fs}
          mmrMap={mmrMap}
        />
      ) : (
        <WaitingState connectionStatus={connectionStatus} />
      )}
    </div>
  );
}

// ─── Waiting State ──────────────────────────────────────────────────────────

function WaitingState({ connectionStatus }: { connectionStatus: string }) {
  const label =
    connectionStatus === "game_not_running"
      ? "Esperando Rocket League..."
      : "Esperando partida...";

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="overlay-hud rounded-lg px-4 py-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              connectionStatus === "connected"
                ? "bg-accent-secondary animate-pulse-subtle"
                : "bg-accent-warning animate-pulse"
            )}
          />
          <p className="text-text-tertiary">{label}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Match Content ──────────────────────────────────────────────────────────

interface MatchContentProps {
  match: NonNullable<ReturnType<typeof useLiveStore.getState>["currentMatch"]>;
  connectionStatus: string;
  display: OverlayDisplaySettings;
  fontScale: FontScale;
  mmrMap: Record<string, number | null>;
}

function MatchContent({ match, connectionStatus, display, fontScale, mmrMap }: MatchContentProps) {
  const localTeam = identifyLocalTeam(match.players);
  const allPlayers = match.players;
  const visiblePlayers = display.playerScope === "team" && localTeam !== null
    ? allPlayers.filter((p: Player) => p.team === localTeam)
    : allPlayers;

  const bluePlayers = visiblePlayers.filter((p: Player) => p.team === 0);
  const orangePlayers = visiblePlayers.filter((p: Player) => p.team === 1);
  const showBothTeams = bluePlayers.length > 0 && orangePlayers.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-1.5 p-2 pt-2.5">
      {/* ── HUD Panel ── */}
      <div className="overlay-hud rounded-lg overflow-hidden">
        {/* Top bar: arena + timer */}
        {display.showTimer && (
          <OverlayTopBar
            arena={match.gameState.arena ?? undefined}
            timeRemaining={match.gameState.timeRemaining}
            isOvertime={match.gameState.isOvertime}
            connectionStatus={connectionStatus}
            fontScale={fontScale}
          />
        )}

        {/* Score bar */}
        {display.showScore && (
          <ScoreRow
            blueScore={match.teamBlueScore}
            orangeScore={match.teamOrangeScore}
            fontScale={fontScale}
          />
        )}

        {/* Divider */}
        <div className="mx-3 h-px bg-border-subtle" />

        {/* Players */}
        {display.showPlayers && (
          <div className="flex gap-1.5 p-1.5 pt-2">
            {bluePlayers.length > 0 && (
              <TeamColumn
                players={bluePlayers}
                display={display}
                mmrMap={mmrMap}
                fontScale={fontScale}
                team={0}
              />
            )}
            {showBothTeams && (
              <>
                {/* VS divider */}
                <div className="flex w-px shrink-0 items-center justify-center">
                  <div className="h-full w-px bg-border-subtle" />
                </div>
                <TeamColumn
                  players={orangePlayers}
                  display={display}
                  mmrMap={mmrMap}
                  fontScale={fontScale}
                  team={1}
                />
              </>
            )}
            {orangePlayers.length > 0 && !showBothTeams && (
              <TeamColumn
                players={orangePlayers}
                display={display}
                mmrMap={mmrMap}
                fontScale={fontScale}
                team={1}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Team Identification ────────────────────────────────────────────────────

function identifyLocalTeam(players: Player[]): number | null {
  if (players.length >= 4) return null;
  if (players.length === 0) return null;

  const teams = new Set(players.map((p) => p.team));
  if (teams.size === 1) return players[0]?.team ?? null;

  return null;
}

// ─── Top Bar: Arena + Timer ─────────────────────────────────────────────────

function OverlayTopBar({
  arena,
  timeRemaining,
  isOvertime,
  connectionStatus,
  fontScale,
}: {
  arena?: string;
  timeRemaining: number;
  isOvertime: boolean;
  connectionStatus: string;
  fontScale: FontScale;
}) {
  const isConnected = connectionStatus === "connected";

  return (
    <div className="flex items-center justify-between px-3 py-1">
      <div className="flex items-center gap-1.5">
        {/* Connection dot */}
        <span
          className={cn(
            "h-1 w-1 rounded-full shrink-0",
            isConnected ? "bg-accent-secondary" : "bg-accent-warning"
          )}
        />
        {/* Arena name */}
        {arena && (
          <span className={cn("uppercase tracking-widest text-text-muted", fontScale.arena)}>
            {getArenaDisplayName(arena)}
          </span>
        )}
      </div>

      {/* Timer */}
      <div className="flex items-center gap-1.5">
        {isOvertime && (
          <span className="text-[8px] font-bold uppercase tracking-wider text-accent-warning animate-overtime">
            OT
          </span>
        )}
        <span
          className={cn(
            "font-display font-bold tabular-nums tracking-tight",
            fontScale.timer,
            isOvertime
              ? "text-accent-warning animate-overtime"
              : "text-text-secondary"
          )}
        >
          {isOvertime ? `+${formatDuration(timeRemaining)}` : formatDuration(timeRemaining)}
        </span>
      </div>
    </div>
  );
}

// ─── Score Row ──────────────────────────────────────────────────────────────

const ScoreRow = memo(function ScoreRow({
  blueScore,
  orangeScore,
  fontScale,
}: {
  blueScore: number;
  orangeScore: number;
  fontScale: FontScale;
}) {
  const blueLeading = blueScore > orangeScore;
  const orangeLeading = orangeScore > blueScore;

  return (
    <div className="flex items-center justify-center gap-3 py-1">
      {/* Blue score */}
      <span
        className={cn(
          "font-display font-bold tabular-nums tracking-tight",
          fontScale.score,
          blueLeading ? "text-team-blue score-glow-blue" : "text-text-primary",
        )}
      >
        {blueScore}
      </span>

      {/* Separator */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-lg font-bold text-text-muted/40">–</span>
      </div>

      {/* Orange score */}
      <span
        className={cn(
          "font-display font-bold tabular-nums tracking-tight",
          fontScale.score,
          orangeLeading ? "text-team-orange score-glow-orange" : "text-text-primary",
        )}
      >
        {orangeScore}
      </span>
    </div>
  );
});

// ─── Team Column ────────────────────────────────────────────────────────────

const TeamColumn = memo(function TeamColumn({
  players,
  display,
  mmrMap,
  fontScale,
  team,
}: {
  players: Player[];
  display: OverlayDisplaySettings;
  mmrMap: Record<string, number | null>;
  fontScale: FontScale;
  team: number;
}) {
  const isBlue = team === 0;

  return (
    <div className="flex flex-1 flex-col gap-1">
      {players.length === 0 ? (
        <div className="flex h-6 items-center justify-center">
          <span className="text-text-muted/30">–</span>
        </div>
      ) : (
        players.map((p) => (
          <OverlayPlayerRow
            key={p.id}
            player={p}
            display={display}
            mmr={mmrMap[p.id] ?? null}
            fontScale={fontScale}
            isBlue={isBlue}
          />
        ))
      )}
    </div>
  );
});

// ─── Player Row ─────────────────────────────────────────────────────────────

const OverlayPlayerRow = memo(function OverlayPlayerRow({
  player,
  display,
  mmr,
  fontScale,
  isBlue,
}: {
  player: Player;
  display: OverlayDisplaySettings;
  mmr: number | null;
  fontScale: FontScale;
  isBlue: boolean;
}) {
  const teamBg = isBlue ? "bg-team-blue/5" : "bg-team-orange/5";
  const teamBorder = isBlue ? "border-team-blue/30" : "border-team-orange/30";

  return (
    <div className={cn("relative rounded-md border-l-2 border-transparent", teamBorder)}>
      {/* Main row */}
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-md px-1.5 py-0.5",
          teamBg,
        )}
      >
        {/* Player name */}
        {display.showNames && (
          <span className={cn("truncate font-medium text-text-secondary", fontScale.name)}>
            {player.name}
          </span>
        )}

        {/* Score */}
        {display.showPlayerScore && (
          <span className={cn(
            "font-mono font-semibold tabular-nums text-text-primary",
            fontScale.playerScore,
            !display.showNames && "ml-0"
          )}>
            {player.score}
          </span>
        )}

        {/* Stats: G A S */}
        {display.showStats && (
          <span className={cn(
            "flex items-center gap-0.5 font-mono tabular-nums text-text-muted",
            fontScale.stats,
            (display.showNames || display.showPlayerScore) && "ml-auto"
          )}>
            <StatPill value={player.goals} label="G" />
            <StatPill value={player.assists} label="A" />
            <StatPill value={player.saves} label="S" />
          </span>
        )}

        {/* MMR badge */}
        {display.showMmr && mmr !== null && (
          <MmrBadge mmr={mmr} fontScale={fontScale} />
        )}
      </div>

      {/* Boost bar (below row) */}
      {display.showBoost && (
        <BoostBar boost={player.boostAmount} />
      )}
    </div>
  );
});

// ─── Stat Pill ──────────────────────────────────────────────────────────────

function StatPill({ value, label }: { value: number; label: string }) {
  const hasValue = value > 0;
  return (
    <span className={cn(
      "inline-flex items-center gap-px rounded px-0.5 py-px",
      hasValue ? "bg-text-muted/10 text-text-tertiary" : "text-text-muted/40"
    )}>
      <span>{value}</span>
      <span className="text-[7px] uppercase">{label}</span>
    </span>
  );
}

// ─── MMR Badge ──────────────────────────────────────────────────────────────

function MmrBadge({ mmr, fontScale }: { mmr: number; fontScale: FontScale }) {
  // Color coding: high (>1500) = green, mid (>1000) = yellow, low = muted
  const colorClass =
    mmr > 1500 ? "mmr-high" :
    mmr > 1000 ? "mmr-mid" :
    "mmr-low";

  const bgClass =
    mmr > 1500 ? "bg-boost-full/10" :
    mmr > 1000 ? "bg-boost-mid/10" :
    "bg-text-muted/5";

  return (
    <span className={cn(
      "ml-auto inline-flex items-center rounded px-1 py-px font-mono font-semibold tabular-nums",
      fontScale.mmr,
      colorClass,
      bgClass,
    )}>
      {mmr}
    </span>
  );
}

// ─── Boost Bar ──────────────────────────────────────────────────────────────

function BoostBar({ boost }: { boost: number }) {
  const pct = Math.min(100, Math.max(0, boost));
  const colorClass =
    pct > 60 ? "bg-boost-full" :
    pct > 25 ? "bg-boost-mid" : "bg-boost-low";

  return (
    <div className="h-px w-full bg-text-muted/10">
      <div
        className={cn("h-full transition-all duration-200", colorClass)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
