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
} from "lucide-react";

interface StatsGridProps {
  data: AnalyticsData;
}

export const StatsGrid = memo(function StatsGrid({ data }: StatsGridProps) {
  const items = useMemo(
    () => [
      { label: "Win Rate", value: `${data.winRate}%`, icon: Trophy },
      { label: "Puntuación media", value: Math.round(data.avgScore), icon: TrendingUp },
      { label: "Goles / partido", value: data.avgGoals.toFixed(1), icon: Target },
      { label: "Asist. / partido", value: data.avgAssists.toFixed(1), icon: Zap },
      { label: "Paradas / partido", value: data.avgSaves.toFixed(1), icon: Shield },
      { label: "Tiros / partido", value: data.avgShots.toFixed(1), icon: Crosshair },
      { label: "Boost medio", value: `${Math.round(data.avgBoost)}%`, icon: Zap },
      { label: "Duración media", value: `${Math.round(data.avgDuration / 60)}m`, icon: Timer },
    ],
    [data]
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <StatCard key={item.label} label={item.label} value={item.value} icon={item.icon} />
      ))}
    </div>
  );
});
