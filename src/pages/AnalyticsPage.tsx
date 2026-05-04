import { useState, useMemo } from "react";
import { useAnalytics, useSessionMatches, useInsights } from "@/hooks/useAnalytics";
import { StatsGrid } from "@/components/analytics/StatsGrid";
import { PerformanceChart } from "@/components/analytics/PerformanceChart";
import { PeriodTabs } from "@/components/analytics/PeriodTabs";
import { StreakCard } from "@/components/analytics/StreakCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import type { AnalyticsPeriod, MatchSession, SessionMatch } from "@/lib/types";
import {
  BarChart3,
  Clock,
  Calendar,
  Trophy,
  Target,
  Swords,
  ChevronRight,
  X,
  Gauge,
} from "lucide-react";

function SessionCard({
  session,
  onClick,
}: {
  session: MatchSession;
  onClick: () => void;
}) {
  const startDate = new Date(session.start_time);
  const dateStr = startDate.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const durationMin = Math.round(session.duration_seconds / 60);
  const winRate =
    session.match_count > 0
      ? Math.round((session.wins / session.match_count) * 100)
      : 0;

  return (
    <Card
      className="cursor-pointer p-4 transition-all hover:shadow-level-2 hover:-translate-y-0.5"
      onClick={onClick}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-text-tertiary" />
            <span className="text-xs text-text-secondary">{dateStr}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <Clock size={12} />
            <span>{durationMin}m</span>
            <ChevronRight size={14} className="text-accent-primary" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-text-tertiary">
                Partidas
              </p>
              <p className="font-mono text-lg font-bold text-text-primary">
                {session.match_count}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider text-text-tertiary">
                WR
              </p>
              <p
                className={`font-mono text-lg font-bold ${
                  winRate >= 50 ? "text-accent-secondary" : "text-accent-danger"
                }`}
              >
                {winRate}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-accent-secondary">
              <Trophy size={12} /> {session.wins}V
            </span>
            <span className="flex items-center gap-1 text-accent-danger">
              <Swords size={12} /> {session.losses}D
            </span>
            {session.unknown > 0 && (
              <span className="flex items-center gap-1 text-text-tertiary">
                ? {session.unknown}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function SessionMatchDetail({ matches }: { matches: SessionMatch[] }) {
  if (matches.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p className="text-sm text-text-secondary">Cargando partidas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {matches.map((m) => {
        const startDate = new Date(m.start_time);
        const timeStr = startDate.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const myTeam = m.local_team ?? -1;
        const myScore =
          myTeam === 0
            ? m.score_blue
            : myTeam === 1
              ? m.score_orange
              : "?";
        const theirScore =
          myTeam === 0
            ? m.score_orange
            : myTeam === 1
              ? m.score_blue
              : "?";

        const myPlayer = m.players.find(
          (p) => p.team_num === m.local_team
        );

        return (
          <div
            key={m.id}
            className={`rounded-lg border p-3 transition-colors ${
              m.is_win
                ? "border-accent-secondary/20 bg-accent-secondary/5"
                : "border-accent-danger/20 bg-accent-danger/5"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold ${
                    m.is_win
                      ? "bg-accent-secondary/20 text-accent-secondary"
                      : "bg-accent-danger/20 text-accent-danger"
                  }`}
                >
                  {m.is_win ? "V" : "D"}
                </span>
                <span className="text-sm text-text-primary">
                  {myScore} - {theirScore}
                </span>
                <span className="text-[10px] text-text-tertiary">{timeStr}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-text-tertiary">
                {m.is_overtime && (
                  <span className="rounded bg-accent-warning/20 px-1.5 py-0.5 text-accent-warning">
                    OT
                  </span>
                )}
                <span>
                  {Math.round(m.duration_seconds / 60)}m
                </span>
              </div>
            </div>
            {myPlayer && (
              <div className="mt-2 flex gap-3 text-[10px] text-text-tertiary">
                <span>
                  <span className="text-text-secondary">{myPlayer.score}</span> pts
                </span>
                <span>
                  <span className="text-text-secondary">{myPlayer.goals}</span> goles
                </span>
                <span>
                  <span className="text-text-secondary">{myPlayer.assists}</span> asist
                </span>
                <span>
                  <span className="text-text-secondary">{myPlayer.saves}</span> paradas
                </span>
                <span>
                  <span className="text-text-secondary">{myPlayer.shots}</span> tiros
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function InsightsPanel({
  period,
}: {
  period: AnalyticsPeriod;
}) {
  const { data: insights, isLoading } = useInsights(period);
  const maxHourPlayed = useMemo(
    () => (insights?.byHour?.length ? Math.max(...insights.byHour.map((hour) => hour.played)) : 0),
    [insights?.byHour]
  );

  if (isLoading) {
    return (
      <Card>
        <div className="space-y-4 p-4">
          <Skeleton className="h-6 w-48" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (!insights?.available) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">
        Analisis avanzado
      </h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {insights.playlists && insights.playlists.length > 0 && (
          <Card className="p-4">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              <Trophy size={14} /> Por playlist
            </h4>
            <div className="space-y-2">
              {insights.playlists.slice(0, 5).map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-text-secondary">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-text-tertiary">{p.played}j</span>
                    <span
                      className={
                        p.winRate >= 50
                          ? "text-accent-secondary"
                          : "text-accent-danger"
                      }
                    >
                      {p.winRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {insights.byHour && insights.byHour.length > 0 && (
          <Card className="p-4">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              <Clock size={14} /> Mejor horario
            </h4>
            <p className="mb-2 text-sm text-text-primary">
              {insights.bestHour}:00hs — WR{" "}
              <span className="text-accent-secondary font-bold">
                {insights.bestHourWR}%
              </span>
            </p>
            <div className="flex h-28 items-end gap-1">
              {insights.byHour.map((h) => {
                const height =
                  maxHourPlayed > 0
                    ? (h.played / maxHourPlayed) * 100
                    : 0;
                return (
                  <div
                    key={h.hour}
                    className="group flex-1 relative"
                    title={`${h.hour}h: ${h.played}j, ${h.winRate}% WR`}
                  >
                    <div
                      className={`w-full rounded-t transition-colors ${
                        h.winRate >= 50
                          ? "bg-accent-secondary/80 group-hover:bg-accent-secondary"
                          : "bg-accent-danger/60 group-hover:bg-accent-danger"
                      }`}
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] text-text-tertiary">
                      {h.hour}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <Card className="p-4">
          <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            <Gauge size={14} /> Clutch & dominio
          </h4>
          <div className="space-y-3 text-xs">
            {insights.otGames && insights.otGames > 0 ? (
              <div className="flex justify-between">
                <span className="text-text-secondary">
                  Overtime ({insights.otGames}j)
                </span>
                <span
                  className={
                    (insights.otWinRate ?? 0) >= 50
                      ? "text-accent-secondary"
                      : "text-accent-danger"
                  }
                >
                  {(insights.otWinRate ?? 0)}%
                </span>
              </div>
            ) : null}
            {insights.closeGames && insights.closeGames > 0 ? (
              <div className="flex justify-between">
                <span className="text-text-secondary">
                  Partidos cerrados (+-1 gol, {insights.closeGames}j)
                </span>
                <span
                  className={
                    (insights.closeWinRate ?? 0) >= 50
                      ? "text-accent-secondary"
                      : "text-accent-danger"
                  }
                >
                  {(insights.closeWinRate ?? 0)}%
                </span>
              </div>
            ) : null}
            {insights.blowoutGames && insights.blowoutGames > 0 ? (
              <div className="flex justify-between">
                <span className="text-text-secondary">
                  Palizas (+4 goles, {insights.blowoutGames}j)
                </span>
                <span
                  className={
                    (insights.blowoutWinRate ?? 0) >= 50
                      ? "text-accent-secondary"
                      : "text-accent-danger"
                  }
                >
                  {(insights.blowoutWinRate ?? 0)}%
                </span>
              </div>
            ) : null}
          </div>
        </Card>

        {insights.contrib && (
          <Card className="p-4">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              <Target size={14} /> Contribucion al equipo
            </h4>
            <div className="space-y-2">
              {[
                {
                  label: "Goles",
                  pct: insights.contrib.goalsPct,
                  color: "bg-accent-primary",
                },
                {
                  label: "Asistencias",
                  pct: insights.contrib.assistsPct,
                  color: "bg-accent-secondary",
                },
                {
                  label: "Paradas",
                  pct: insights.contrib.savesPct,
                  color: "bg-accent-warning",
                },
                {
                  label: "Tiros",
                  pct: insights.contrib.shotsPct,
                  color: "bg-accent-purple",
                },
                {
                  label: "Demos",
                  pct: insights.contrib.demosPct,
                  color: "bg-accent-danger",
                },
              ].map((c) => (
                <div key={c.label}>
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-text-tertiary">{c.label}</span>
                    <span className="text-text-secondary">{c.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-bg-tertiary">
                    <div
                      className={`h-full rounded-full ${c.color}`}
                      style={{ width: `${Math.min(c.pct, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("week");
  const { data: result, isLoading, isError } = useAnalytics(period);
  const [selectedSession, setSelectedSession] =
    useState<MatchSession | null>(null);

  const { data: sessionMatches, isLoading: matchesLoading } =
    useSessionMatches(
      selectedSession?.start_time,
      selectedSession?.end_time
    );

  const sessions = useMemo(() => result?.sessions ?? [], [result]);

  return (
    <PageContainer>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            Analisis de rendimiento
          </h2>
          {result?.data && (
            <p className="mt-1 text-sm text-text-secondary">
              {result.data.totalMatches} partidas en el rango seleccionado
            </p>
          )}
        </div>
        <PeriodTabs active={period} onChange={setPeriod} />
      </div>

      {isLoading && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-72 w-full" />
        </div>
      )}

      {isError && (
        <EmptyState
          icon={BarChart3}
          title="Error cargando analisis"
          description="No se pudieron cargar los datos de rendimiento."
        />
      )}

      {!isLoading && !isError && result && (
        <div className="space-y-6">
          <StatsGrid data={result.data} />
          <StreakCard
            bestStreak={result.data.bestStreak}
            currentStreak={result.data.currentStreak}
          />

          {result.rollups.length > 0 && (
            <PerformanceChart data={result.rollups} />
          )}

          <InsightsPanel period={period} />

          {period === "session" && sessions.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-text-primary">
                Historial de sesiones
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sessions.map((s) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    onClick={() => setSelectedSession(s)}
                  />
                ))}
              </div>
            </div>
          )}

          {result.data.totalMatches === 0 && (
            <EmptyState
              icon={BarChart3}
              title="No hay datos para este periodo"
              description="Juga algunas partidas para ver tu analisis aqui."
            />
          )}
        </div>
      )}

      <Modal
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        size="lg"
      >
        {selectedSession && (
          <div className="max-h-[80vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">
                Detalle de sesion
              </h3>
              <button
                onClick={() => setSelectedSession(null)}
                className="rounded-lg p-1.5 text-text-tertiary hover:bg-bg-tertiary hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mb-4 flex gap-4 text-sm">
              <span className="text-text-secondary">
                {selectedSession.match_count} partidas
              </span>
              <span className="text-accent-secondary">
                {selectedSession.wins}V
              </span>
              <span className="text-accent-danger">
                {selectedSession.losses}D
              </span>
              <span className="text-text-tertiary">
                {Math.round(selectedSession.duration_seconds / 60)}m
              </span>
            </div>
            <SessionMatchDetail
              matches={
                matchesLoading ? [] : (sessionMatches ?? [])
              }
            />
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
