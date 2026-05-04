import { memo, useMemo } from "react";
import { StatCard } from "@/components/ui/StatCard";
import type { AnalyticsData } from "@/lib/types";
import {
  Trophy,
  Target,
  Shield,
  Crosshair,
  Zap,
  Timer,
  TrendingUp,
  Swords,
  Flame,
  Gauge,
} from "lucide-react";

interface StatsGridProps {
  data: AnalyticsData;
}

export const StatsGrid = memo(function StatsGrid({ data }: StatsGridProps) {
  const items = useMemo(
    () => [
      {
        label: "Partidas jugadas",
        value: data.totalMatches,
        icon: Swords,
      },
      {
        label: "Win Rate",
        value: `${data.winRate}%`,
        icon: Trophy,
        trend: data.winRate >= 50 ? "up" as const : "down" as const,
        trendValue: `${data.wins}V / ${data.losses}D`,
      },
      {
        label: "Puntuación media",
        value: Math.round(data.avgScore),
        icon: TrendingUp,
      },
      {
        label: "Goles totales",
        value: data.totalGoals,
        icon: Target,
        trendValue: `${data.avgGoals.toFixed(1)} / partido`,
      },
      {
        label: "Asistencias totales",
        value: data.totalAssists,
        icon: Zap,
        trendValue: `${data.avgAssists.toFixed(1)} / partido`,
      },
      {
        label: "Paradas totales",
        value: data.totalSaves,
        icon: Shield,
        trendValue: `${data.avgSaves.toFixed(1)} / partido`,
      },
      {
        label: "Tiros totales",
        value: data.totalShots,
        icon: Crosshair,
        trendValue: `${data.avgShots.toFixed(1)} / partido`,
      },
      {
        label: "Demoliciones",
        value: data.totalDemos,
        icon: Flame,
      },
      {
        label: "Velocidad max",
        value: `${Math.round(data.peakSpeed)} km/h`,
        icon: Gauge,
      },
      {
        label: "Duración media",
        value: `${Math.round(data.avgDuration / 60)}m`,
        icon: Timer,
      },
    ],
    [data]
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <StatCard
          key={item.label}
          label={item.label}
          value={item.value}
          icon={item.icon}
          trend={item.trend}
          trendValue={item.trendValue}
        />
      ))}
    </div>
  );
});
