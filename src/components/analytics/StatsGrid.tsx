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
        accent: "blue" as const,
      },
      {
        label: "Win Rate",
        value: `${data.winRate}%`,
        icon: Trophy,
        accent: data.winRate >= 50 ? "green" as const : "orange" as const,
        trend: data.winRate >= 50 ? "up" as const : "down" as const,
        trendValue: `${data.wins}V / ${data.losses}D`,
      },
      {
        label: "Puntuacion media",
        value: Math.round(data.avgScore),
        icon: TrendingUp,
        accent: "default" as const,
      },
      {
        label: "Goles totales",
        value: data.totalGoals,
        icon: Target,
        accent: "orange" as const,
        trendValue: `${data.avgGoals.toFixed(1)} / partido`,
      },
      {
        label: "Asistencias totales",
        value: data.totalAssists,
        icon: Zap,
        accent: "purple" as const,
        trendValue: `${data.avgAssists.toFixed(1)} / partido`,
      },
      {
        label: "Paradas totales",
        value: data.totalSaves,
        icon: Shield,
        accent: "blue" as const,
        trendValue: `${data.avgSaves.toFixed(1)} / partido`,
      },
      {
        label: "Tiros totales",
        value: data.totalShots,
        icon: Crosshair,
        accent: "default" as const,
        trendValue: `${data.avgShots.toFixed(1)} / partido`,
      },
      {
        label: "Demoliciones",
        value: data.totalDemos,
        icon: Flame,
        accent: "orange" as const,
      },
      {
        label: "Velocidad max",
        value: `${Math.round(data.peakSpeed)} km/h`,
        icon: Gauge,
        accent: "green" as const,
      },
      {
        label: "Duracion media",
        value: `${Math.round(data.avgDuration / 60)}m`,
        icon: Timer,
        accent: "default" as const,
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
          accent={item.accent}
        />
      ))}
    </div>
  );
});
