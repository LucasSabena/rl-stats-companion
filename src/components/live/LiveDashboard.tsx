import { useEffect, useState, useCallback } from "react";
import { useLiveStore } from "@/stores/liveStore";
import { TeamPanel } from "./TeamPanel";
import { EventFeed } from "./EventFeed";
import { MatchTimer } from "./MatchTimer";
import { ScoreDisplay } from "./ScoreDisplay";
import { ConnectionStatus } from "./ConnectionStatus";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { RankWidget } from "@/components/tracker/RankWidget";
import { cn } from "@/lib/utils";
import { Radio, X } from "lucide-react";

function getMatchSizeLabel(playerCount: number): string {
  if (playerCount <= 2) return "1v1";
  if (playerCount <= 4) return "2v2";
  if (playerCount <= 6) return "3v3";
  if (playerCount <= 8) return "4v4";
  return `${playerCount} jug.`;
}

function MatchEndBanner() {
  const lastMatchSummary = useLiveStore((state) => state.lastMatchSummary);
  const summaryTimestamp = useLiveStore((state) => state.matchSummaryTimestamp);
  const clearMatchSummary = useLiveStore((state) => state.clearMatchSummary);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (lastMatchSummary) {
      setVisible(true);
    }
  }, [lastMatchSummary]);

  useEffect(() => {
    if (!visible || !summaryTimestamp) return;
    const elapsed = Date.now() - summaryTimestamp;
    const remaining = Math.max(0, 15000 - elapsed);

    if (remaining === 0) {
      clearMatchSummary();
      setVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      clearMatchSummary();
      setVisible(false);
    }, remaining);

    return () => clearTimeout(timer);
  }, [visible, summaryTimestamp, clearMatchSummary]);

  const handleDismiss = useCallback(() => {
    clearMatchSummary();
    setVisible(false);
  }, [clearMatchSummary]);

  if (!visible || !lastMatchSummary) return null;

  const { score_blue, score_orange, winner, duration_seconds, players } = lastMatchSummary;

  let label = "";
  let bgClass = "";

  if (winner === null) {
    label = `Empate ${score_blue} - ${score_orange}`;
    bgClass = "border-border-subtle bg-bg-secondary";
  } else if (winner === 0) {
    label = `Victoria! ${score_blue} - ${score_orange}`;
    bgClass = "border-accent-success/30 bg-accent-success-subtle";
  } else {
    label = `Derrota ${score_blue} - ${score_orange}`;
    bgClass = "border-accent-danger/30 bg-accent-danger-subtle";
  }

  const mins = Math.floor(duration_seconds / 60);
  const secs = duration_seconds % 60;
  const durationStr = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <div
      className={cn(
        "relative flex items-center justify-between rounded-xl border px-4 py-3 animate-slide-down",
        bgClass
      )}
      role="alert"
    >
      <div className="flex items-center gap-3">
        <span className="text-base font-bold text-text-primary">{label}</span>
        <span className="text-xs text-text-tertiary">
          Duracion: {durationStr} | {players.length} jugadores
        </span>
      </div>
      <button
        onClick={handleDismiss}
        className="flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-hover hover:text-text-secondary"
        aria-label="Cerrar notificacion"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function LiveDashboard() {
  const currentMatch = useLiveStore((state) => state.currentMatch);
  const connectionStatus = useLiveStore((state) => state.connectionStatus);

  const bluePlayers = currentMatch?.players.filter((player) => player.team === 0) ?? [];
  const orangePlayers = currentMatch?.players.filter((player) => player.team === 1) ?? [];

  if (!currentMatch) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <ConnectionStatus status={connectionStatus} />
        </div>
        <MatchEndBanner />
        <div className="flex h-full items-center justify-center">
          <EmptyState
            icon={Radio}
            title="Esperando partida..."
            description="Inicia una partida en Rocket League para ver los datos en directo."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <MatchEndBanner />

      <div className="flex items-center justify-between">
        <ConnectionStatus status={connectionStatus} />
        <div className="flex items-center gap-2">
          {currentMatch.matchType && (
            <Badge
              variant={currentMatch.matchType === "online" ? "info" : "default"}
            >
              {currentMatch.matchType === "online" ? "Online" : "Local"}
            </Badge>
          )}
          {currentMatch.playerCount !== undefined && (
            <Badge variant="accent">
              {getMatchSizeLabel(currentMatch.playerCount)}
            </Badge>
          )}
          <MatchTimer
            timeRemaining={currentMatch.gameState.timeRemaining}
            isOvertime={currentMatch.gameState.isOvertime}
          />
        </div>
      </div>

      <ScoreDisplay
        blueScore={currentMatch.teamBlueScore}
        orangeScore={currentMatch.teamOrangeScore}
        arena={currentMatch.gameState.arena ?? undefined}
      />

      <RankWidget />

      <div className="grid gap-4 lg:grid-cols-2">
        <TeamPanel team="blue" players={bluePlayers} />
        <TeamPanel team="orange" players={orangePlayers} />
      </div>

      <EventFeed />
    </div>
  );
}
