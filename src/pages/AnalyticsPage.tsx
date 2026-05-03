import { useState } from "react";
import { useAnalytics, useDailyRollups } from "@/hooks/useAnalytics";
import { StatsGrid } from "@/components/analytics/StatsGrid";
import { PerformanceChart } from "@/components/analytics/PerformanceChart";
import { PeriodTabs } from "@/components/analytics/PeriodTabs";
import { StreakCard } from "@/components/analytics/StreakCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import type { AnalyticsPeriod } from "@/lib/types";
import { BarChart3 } from "lucide-react";

export function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("week");
  const { data, isLoading, isError } = useAnalytics(period);
  const { data: rollups } = useDailyRollups(period);

  return (
    <PageContainer>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-text-primary">Análisis de rendimiento</h2>
        <PeriodTabs active={period} onChange={setPeriod} />
      </div>

      {isLoading && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-72 w-full" />
        </div>
      )}

      {isError && (
        <EmptyState
          icon={BarChart3}
          title="Error cargando análisis"
          description="No se pudieron cargar los datos de rendimiento."
        />
      )}

      {!isLoading && !isError && data && (
        <>
          <StatsGrid data={data} />
          <StreakCard bestStreak={data.bestStreak} currentStreak={data.currentStreak} />
          {rollups && rollups.length > 0 && (
            <PerformanceChart data={rollups} metric="winRate" />
          )}
          {(!rollups || rollups.length === 0) && (
            <EmptyState
              icon={BarChart3}
              title="No hay datos para este período"
              description="Juega algunas partidas para ver tu análisis aquí."
            />
          )}
        </>
      )}
    </PageContainer>
  );
}
