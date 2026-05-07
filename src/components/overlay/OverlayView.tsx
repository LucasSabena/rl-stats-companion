import React, { memo, useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { useTranslation } from "react-i18next";
import { getSettings } from "@/lib/api";
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
  opacity: 0.85,
  playerScope: "all",
  showNames: true,
  showPlayerScore: true,
  showBoost: true,
  showMmr: true,
  showSpeed: true,
};

// --- Font Scale Map ---
const FONT_SCALE = {
  small: {
    root: "text-[10px]",
    score: "text-[24px]",
    timer: "text-[12px]",
    name: "max-w-[60px]",
    playerScore: "text-[11px]",
    stats: "text-[9px]",
    mmr: "text-[9px]",
    arena: "text-[9px]",
  },
  medium: {
    root: "text-[12px]",
    score: "text-[32px]",
    timer: "text-[14px]",
    name: "max-w-[80px]",
    playerScore: "text-[13px]",
    stats: "text-[11px]",
    mmr: "text-[11px]",
    arena: "text-[11px]",
  },
  large: {
    root: "text-[14px]",
    score: "text-[42px]",
    timer: "text-[18px]",
    name: "max-w-[110px]",
    playerScore: "text-[15px]",
    stats: "text-[13px]",
    mmr: "text-[13px]",
    arena: "text-[13px]",
  },
} as const;

type FontScale = typeof FONT_SCALE[keyof typeof FONT_SCALE];

export function OverlayView() {
  useLiveMatch();
  const mmrData = useLiveMmr();

  const mmrMap = React.useMemo(() => {
    const map: Record<string, number | null> = {};
    if (mmrData.data?.players) {
      for (const p of mmrData.data.players) {
        map[p.primaryId] = p.mmr;
      }
    }
    return map;
  }, [mmrData.data]);

  const currentMatch = useLiveStore((s) => s.currentMatch);
  const connectionStatus = useLiveStore((s) => s.connectionStatus);

  const [display, setDisplay] = useState<OverlayDisplaySettings>(DEFAULT_DISPLAY);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    // Cargar configuracion inicial (por si el evento de creacion llego antes de montar)
    getSettings().then((settings) => {
      setDisplay({
        showScore: settings.overlayShowScore ?? true,
        showPlayers: settings.overlayShowPlayers ?? true,
        showStats: settings.overlayShowStats ?? true,
        showTimer: settings.overlayShowTimer ?? true,
        fontScale: (settings.overlayFontScale as OverlayDisplaySettings["fontScale"]) ?? "medium",
        opacity: settings.overlayOpacity ?? 0.85,
        playerScope: (settings.overlayPlayerScope as OverlayDisplaySettings["playerScope"]) ?? "all",
        showNames: settings.overlayShowNames ?? true,
        showPlayerScore: settings.overlayShowPlayerScore ?? true,
        showBoost: settings.overlayShowBoost ?? true,
        showMmr: settings.overlayShowMmr ?? true,
        showSpeed: settings.overlayShowSpeed ?? true,
      });
    }).catch(console.error);

    // Escuchar cambios desde la UI
    const unlisteners: Array<() => void> = [];

    listen<OverlayDisplaySettings>("overlay-settings-updated", (e) => {
      setDisplay(e.payload);
    }).then((fn) => unlisteners.push(fn));

    listen<number>("overlay-opacity-changed", (e) => {
      setDisplay((prev) => ({ ...prev, opacity: e.payload }));
    }).then((fn) => unlisteners.push(fn));

    listen<boolean>("overlay-interactive-mode", (e) => {
      setInteractive(e.payload);
    }).then((fn) => unlisteners.push(fn));

    return () => {
      unlisteners.forEach((fn) => fn());
    };
  }, []);

  const fs = FONT_SCALE[display.fontScale];

  return (
    <div
      className={cn(
        "overlay-mode flex h-screen w-screen flex-col overflow-hidden font-sans text-text-primary p-2",
        fs.root,
        interactive && "pointer-events-auto bg-accent-primary/5 rounded-xl border border-accent-primary/20"
      )}
      style={{ opacity: display.opacity }}
    >
      {interactive && (
        <>
          <div 
            className="absolute inset-0 z-40 cursor-move" 
            data-tauri-drag-region="true"
          />
          <div className="z-50 relative">
            <OverlayDismissButton />
          </div>
        </>
      )}

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
  const { t } = useTranslation(["overlay", "common"]);
  const label =
    connectionStatus === "game_not_running"
      ? t("overlay:waitingState.noGame")
      : t("overlay:waitingState.noMatch");

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex items-center gap-3 rounded-2xl bg-bg-surface/80 backdrop-blur-md px-5 py-3 border border-border-subtle shadow-xl">
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            connectionStatus === "connected"
              ? "bg-accent-success animate-pulse-subtle shadow-[0_0_8px_rgba(16,185,129,0.8)]"
              : "bg-accent-warning animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"
          )}
        />
        <p className="text-sm font-medium text-text-primary tracking-wide">{label}</p>
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
  const { t } = useTranslation(["overlay", "common"]);
  const localTeam = identifyLocalTeam(match.players);
  const allPlayers = match.players;
  const visiblePlayers = display.playerScope === "team" && localTeam !== null
    ? allPlayers.filter((p: Player) => p.team === localTeam)
    : allPlayers;

  const bluePlayers = visiblePlayers.filter((p: Player) => p.team === 0).sort((a, b) => b.score - a.score);
  const orangePlayers = visiblePlayers.filter((p: Player) => p.team === 1).sort((a, b) => b.score - a.score);
  const showBothTeams = bluePlayers.length > 0 && orangePlayers.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-2">
      {/* ── Widget Panel ── */}
      <div className="flex flex-col rounded-2xl bg-bg-surface/85 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_-4px_rgba(0,0,0,0.5)] overflow-hidden">
        
        {/* TOP BAR: Score & Timer */}
        {(display.showScore || display.showTimer) && (
          <div className="relative flex flex-col items-center bg-black/40 pt-3 pb-2 px-4">
            
            {/* Arena Name (Absolute Top) */}
            {display.showTimer && match.gameState.arena && (
              <div className="absolute top-1 right-3 flex items-center gap-1.5">
                <span className={cn("uppercase tracking-[0.2em] font-medium text-text-muted opacity-80", fontScale.arena)}>
                  {getArenaDisplayName(match.gameState.arena)}
                </span>
                <span className={cn("h-1.5 w-1.5 rounded-full shadow-sm", connectionStatus === "connected" ? "bg-accent-success" : "bg-accent-warning")} />
              </div>
            )}

            {/* Score & Timer Layout */}
            <div className="flex items-center justify-center gap-6 w-full">
              {display.showScore && (
                <div className="flex-1 flex justify-end">
                  <span className={cn(
                    "font-display font-bold tabular-nums drop-shadow-md",
                    fontScale.score,
                    match.teamBlueScore > match.teamOrangeScore ? "text-team-blue score-glow-blue" : "text-white"
                  )}>
                    {match.teamBlueScore}
                  </span>
                </div>
              )}
              
              {display.showTimer && (
                <div className="flex shrink-0 flex-col items-center justify-center px-4 py-1.5 rounded-lg bg-white/5 border border-white/5">
                  <span className={cn(
                    "font-mono font-bold tabular-nums tracking-wider",
                    fontScale.timer,
                    match.gameState.isOvertime ? "text-accent-warning animate-overtime" : "text-white"
                  )}>
                    {match.gameState.isOvertime ? `+${formatDuration(match.gameState.timeRemaining)}` : formatDuration(match.gameState.timeRemaining)}
                  </span>
                  {match.gameState.isOvertime && <span className="text-[9px] font-black tracking-widest text-accent-warning uppercase mt-0.5">{t("overlay:labels.overtime")}</span>}
                </div>
              )}

              {display.showScore && (
                <div className="flex-1 flex justify-start">
                  <span className={cn(
                    "font-display font-bold tabular-nums drop-shadow-md",
                    fontScale.score,
                    match.teamOrangeScore > match.teamBlueScore ? "text-team-orange score-glow-orange" : "text-white"
                  )}>
                    {match.teamOrangeScore}
                  </span>
                </div>
              )}
            </div>
            
            {/* Blue/Orange subtle gradients */}
            <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-team-blue/10 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-team-orange/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-team-blue/40 via-white/10 to-team-orange/40" />
          </div>
        )}

        {/* PLAYERS */}
        {display.showPlayers && (
          <div className="flex flex-col">
            {bluePlayers.length > 0 && (
              <TeamSection
                players={bluePlayers}
                display={display}
                mmrMap={mmrMap}
                fontScale={fontScale}
                team={0}
              />
            )}
            
            {showBothTeams && (
              <div className="flex items-center justify-center py-0.5 relative">
                 <div className="absolute w-full h-px bg-white/5" />
                  <span className="relative z-10 bg-bg-surface px-2 text-[9px] font-bold text-text-muted/50 uppercase tracking-widest">{t("overlay:labels.vs")}</span>
              </div>
            )}
            
            {orangePlayers.length > 0 && (
              <TeamSection
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

// ─── Team Section ────────────────────────────────────────────────────────────

const TeamSection = memo(function TeamSection({
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
    <div className="flex flex-col py-1.5 px-2 gap-1 relative">
      {/* Background Accent */}
      <div className={cn(
        "absolute inset-0 opacity-[0.03] pointer-events-none",
        isBlue ? "bg-team-blue" : "bg-team-orange"
      )} />
      
      {players.map((p) => (
        <OverlayPlayerRow
          key={p.id}
          player={p}
          display={display}
          mmr={mmrMap[p.id] ?? null}
          fontScale={fontScale}
          isBlue={isBlue}
        />
      ))}
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
  const { t } = useTranslation(["overlay", "common"]);
  const teamColor = isBlue ? "text-team-blue" : "text-team-orange";

  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg border border-white/5 bg-black/20 flex flex-col",
      "transition-all duration-200"
    )}>
      {/* Main row data */}
      <div className="flex items-center gap-3 px-3 py-2 relative z-10">
        
        {/* Color stripe */}
        <div className={cn("absolute left-0 top-0 bottom-0 w-1", isBlue ? "bg-team-blue" : "bg-team-orange")} />

        {/* Player Name */}
        {display.showNames && (
          <span className={cn(
            "truncate font-display font-semibold tracking-wide ml-1",
            fontScale.name,
            "text-white drop-shadow-sm"
          )}>
            {player.name}
          </span>
        )}

        {/* Puntos */}
        {display.showPlayerScore && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className={cn(
              "font-mono font-bold tabular-nums",
              fontScale.playerScore,
              teamColor
            )}>
              {player.score}
            </span>
            <span className="text-[9px] uppercase font-bold text-text-muted/60 tracking-wider">{t("overlay:labels.pts")}</span>
          </div>
        )}

        {/* Stats (G/A/S) */}
        {display.showStats && (
          <div className={cn(
            "flex items-center gap-2 ml-auto",
            fontScale.stats
          )}>
            <StatPill value={player.goals} icon="G" />
            <StatPill value={player.assists} icon="A" />
            <StatPill value={player.saves} icon="S" />
          </div>
        )}

        {/* MMR */}
        {display.showMmr && mmr !== null && (
          <MmrBadge mmr={mmr} fontScale={fontScale} />
        )}

        {/* Speed */}
        {display.showSpeed && (
          <SpeedBadge speed={player.speed} fontScale={fontScale} />
        )}
      </div>

      {/* Boost Bar (always bottom inside the card) */}
      {display.showBoost && (
        <div className="w-full bg-black/60 h-1.5 relative z-10">
          <div
            className={cn(
              "h-full transition-all duration-300 ease-out",
              player.boostAmount > 60 ? "bg-accent-success shadow-[0_0_6px_rgba(16,185,129,0.5)]" :
              player.boostAmount > 25 ? "bg-accent-warning" : "bg-accent-danger"
            )}
            style={{ width: `${Math.min(100, Math.max(0, player.boostAmount))}%` }}
          />
        </div>
      )}
    </div>
  );
});

// ─── Stat Pill ──────────────────────────────────────────────────────────────

function StatPill({ value, icon }: { value: number; icon: string }) {
  const active = value > 0;
  return (
    <div className={cn(
      "flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5 border border-white/5",
      active ? "text-white" : "text-text-muted/40"
    )}>
      <span className="font-mono font-semibold tabular-nums">{value}</span>
      <span className={cn("text-[9px] font-black uppercase", active ? "text-text-muted" : "text-text-muted/30")}>{icon}</span>
    </div>
  );
}

// ─── MMR Badge ──────────────────────────────────────────────────────────────

function MmrBadge({ mmr, fontScale }: { mmr: number; fontScale: FontScale }) {
  const isHigh = mmr > 1500;
  const isMid = mmr > 1000;

  return (
    <div className={cn(
      "ml-2 flex items-center justify-center rounded px-2 py-0.5 font-mono font-bold tabular-nums border",
      fontScale.mmr,
      isHigh ? "bg-accent-success/10 text-accent-success border-accent-success/20" :
      isMid ? "bg-accent-warning/10 text-accent-warning border-accent-warning/20" :
      "bg-white/5 text-text-secondary border-white/10"
    )}>
      {mmr}
    </div>
  );
}

// ─── Speed Badge ────────────────────────────────────────────────────────────

function SpeedBadge({ speed, fontScale }: { speed: number; fontScale: FontScale }) {
  // Rocket League speedometer scale: supersonic = ~82 game units at ~2200 uu/s
  const RL_SPEED_FACTOR = 2200 / 82; // ≈ 26.829
  const displaySpeed = Math.round(speed / RL_SPEED_FACTOR);
  const isSupersonic = displaySpeed >= 82;
  const isFast = displaySpeed >= 50;

  return (
    <div className={cn(
      "ml-2 flex items-center gap-1 rounded px-2 py-0.5 font-mono font-bold tabular-nums border",
      fontScale.mmr,
      isSupersonic ? "bg-accent-warning/10 text-accent-warning border-accent-warning/20" :
      isFast ? "bg-accent-primary/10 text-accent-primary border-accent-primary/20" :
      "bg-white/5 text-text-secondary border-white/10"
    )}>
      <span>{displaySpeed}</span>
    </div>
  );
}
