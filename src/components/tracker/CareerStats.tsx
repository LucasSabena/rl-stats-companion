import type { OverviewStats } from "@/lib/types";
import { StatCard } from "@/components/ui/StatCard";
import { Trophy, Swords, Star, Shield, Crosshair, Goal } from "lucide-react";

interface CareerStatsProps {
  stats: OverviewStats;
}

export function CareerStats({ stats }: CareerStatsProps) {
  const items = [
    { label: "Wins", value: stats.wins, icon: Trophy },
    { label: "Goles", value: stats.goals, icon: Goal },
    { label: "MVPs", value: stats.mvps, icon: Star },
    { label: "Tiros", value: stats.shots, icon: Crosshair },
    { label: "Atajadas", value: stats.saves, icon: Shield },
    { label: "Asistencias", value: stats.assists, icon: Swords },
  ].filter((item) => item.value != null);

  if (items.length === 0) {
    return (
      <p className="text-sm text-text-tertiary italic">Sin estadisticas de carrera disponibles.</p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <StatCard
          key={item.label}
          label={item.label}
          value={item.value!.toLocaleString()}
          icon={item.icon}
        />
      ))}
    </div>
  );
}
