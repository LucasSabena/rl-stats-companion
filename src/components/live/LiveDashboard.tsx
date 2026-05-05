import { useEffect, useState, useCallback } from "react";
import { useLiveStore } from "@/stores/liveStore";
import { TeamPanel } from "./TeamPanel";
import { PlayerCard } from "./PlayerCard";
import { EventFeed } from "./EventFeed";
import { MatchTimer } from "./MatchTimer";
import { ScoreDisplay } from "./ScoreDisplay";
import { ConnectionStatus } from "./ConnectionStatus";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { RankWidget } from "@/components/tracker/RankWidget";
import { useLiveMmr } from "@/hooks/useLiveMmr";
import { cn } from "@/lib/utils";
import { Radio, X, RefreshCw } from "lucide-react";

function getMatchSizeLabel(playerCount: number): string {
  if (playerCount === 1) return "Entrenamiento";
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
    bgClass = "border-border-subtle bg-bg-surface";
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
  const { data: liveMmr, isFetching: isFetchingMmr, forceRefresh } = useLiveMmr();

  const bluePlayers = currentMatch?.players.filter((player) => player.team === 0) ?? [];
  const orangePlayers = currentMatch?.players.filter((player) => player.team === 1) ?? [];
  const otherPlayers = currentMatch?.players.filter((player) => player.team !== 0 && player.team !== 1) ?? [];
  const mmrByPlayerId = Object.fromEntries(
    (liveMmr?.players ?? []).map((player) => [player.primaryId, player])
  );

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

      {liveMmr && (
        <div className="rounded-xl border border-border-subtle bg-bg-secondary/70 px-4 py-3 text-xs text-text-tertiary">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>
              Playlist {liveMmr.playlistConfidence === "high" ? "detectada" : liveMmr.playlistConfidence === "low" ? "estimada" : "desconocida"}:
              <span className="ml-1 font-semibold text-text-secondary">{liveMmr.playlist ?? "sin resolver"}</span>
            </span>
            {liveMmr.playlistCandidates.length > 1 && (
              <span>
                Candidatos: <span className="text-text-secondary">{liveMmr.playlistCandidates.join(", ")}</span>
              </span>
            )}
            <span>Actualizado: {new Date(liveMmr.fetchedAt).toLocaleTimeString("es-AR")}</span>
            {currentMatch?.matchType === "online" && (
              <button
                onClick={forceRefresh}
                disabled={isFetchingMmr}
                className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary disabled:opacity-50"
                aria-label="Actualizar MMR"
                type="button"
              >
                <RefreshCw size={12} className={cn(isFetchingMmr && "animate-spin")} />
                <span>{isFetchingMmr ? "Actualizando..." : "Actualizar"}</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <TeamPanel
          team="blue"
          players={bluePlayers}
          mmrByPlayerId={mmrByPlayerId}
          mmrLoading={isFetchingMmr}
        />
        <TeamPanel
          team="orange"
          players={orangePlayers}
          mmrByPlayerId={mmrByPlayerId}
          mmrLoading={isFetchingMmr}
        />
      </div>

      {otherPlayers.length > 0 && (
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="h-3 w-3 rounded-full bg-text-muted" />
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-text-secondary">
              Otros jugadores
            </h3>
          </div>
          <div className="space-y-2">
            {otherPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                mmr={mmrByPlayerId[player.id] ?? null}
                mmrLoading={isFetchingMmr}
              />
            ))}
          </div>
        </div>
      )}

      <EventFeed />
    </div>
  );
}
