import { useState, useMemo } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { StatsGrid } from "@/components/analytics/StatsGrid";
import { PerformanceChart } from "@/components/analytics/PerformanceChart";
import { PeriodTabs } from "@/components/analytics/PeriodTabs";
import { StreakCard } from "@/components/analytics/StreakCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import type { AnalyticsPeriod, MatchSession } from "@/lib/types";
import { BarChart3, Clock, Calendar, Trophy, Target } from "lucide-react";

function SessionCard({ session }: { session: MatchSession }) {
  const startDate = new Date(session.start_time);
  const dateStr = startDate.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const durationMin = Math.round(session.duration_seconds / 60);
  const winRate = session.match_count > 0
    ? Math.round((session.wins / session.match_count) * 100)
    : 0;

  return (
    <Card className="flex flex-col gap-3 p-4 transition-all hover:shadow-level-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-text-tertiary" />
          <span className="text-xs text-text-secondary">{dateStr}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-text-tertiary">
          <Clock size={12} />
          <span>{durationMin}m</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-text-tertiary">Partidas</p>
            <p className="font-mono text-lg font-bold text-text-primary">{session.match_count}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-text-tertiary">Win Rate</p>
            <p className={`font-mono text-lg font-bold ${winRate >= 50 ? "text-accent-secondary" : "text-accent-danger"}`}>
              {winRate}%
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <Trophy size={12} className="text-accent-primary" /> {session.wins}V
          </span>
          <span className="flex items-center gap-1">
            <Target size={12} className="text-accent-danger" /> {session.losses}D
          </span>
        </div>
      </div>
    </Card>
  );
}

export function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("week");
  const { data: result, isLoading, isError } = useAnalytics(period);

  const sessions = useMemo(() => result?.sessions ?? [], [result]);

  return (
    <PageContainer>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Analisis de rendimiento</h2>
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
          <StreakCard bestStreak={result.data.bestStreak} currentStreak={result.data.currentStreak} />

          {result.rollups.length > 0 && (
            <PerformanceChart data={result.rollups} />
          )}

          {period === "session" && sessions.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-text-primary">
                Historial de sesiones
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sessions.map((s) => (
                  <SessionCard key={s.id} session={s} />
                ))}
              </div>
            </div>
          )}

          {period !== "session" && result.rollups.length === 0 && (
            <Card className="flex h-64 items-center justify-center">
              <p className="text-sm text-text-secondary">No hay datos de evolucion para este periodo</p>
            </Card>
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
    </PageContainer>
  );
}
