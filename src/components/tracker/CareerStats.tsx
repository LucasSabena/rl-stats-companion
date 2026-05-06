import { useTranslation } from "react-i18next";
import type { OverviewStats } from "@/lib/types";
import { StatCard } from "@/components/ui/StatCard";
import { Trophy, Swords, Star, Shield, Crosshair, Goal } from "lucide-react";

interface CareerStatsProps {
  stats: OverviewStats;
}

export function CareerStats({ stats }: CareerStatsProps) {
  const { t } = useTranslation("tracker");
  const items = [
    { label: t("career.wins"), value: stats.wins, icon: Trophy },
    { label: t("career.goals"), value: stats.goals, icon: Goal },
    { label: t("career.mvps"), value: stats.mvps, icon: Star },
    { label: t("career.shots"), value: stats.shots, icon: Crosshair },
    { label: t("career.saves"), value: stats.saves, icon: Shield },
    { label: t("career.assists"), value: stats.assists, icon: Swords },
  ].filter((item) => item.value != null);

  if (items.length === 0) {
    return (
      <p className="text-sm text-text-tertiary italic">{t("career.noStats")}</p>
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
