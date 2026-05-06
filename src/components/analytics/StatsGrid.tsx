import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import type { AnalyticsData } from "@/lib/types";
import type { LucideIcon } from "lucide-react";
import {
  Trophy,
  Target,
  Shield,
  Crosshair,
  Zap,
  TrendingUp,
  Swords,
  Flame,
} from "lucide-react";

interface StatItem {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent: "blue" | "orange" | "green" | "purple" | "default";
  trend?: "up" | "down" | "flat";
  trendValue?: string;
}

interface PrimaryStatsRowProps {
  data: AnalyticsData;
}

export const PrimaryStatsRow = memo(function PrimaryStatsRow({ data }: PrimaryStatsRowProps) {
  const { t } = useTranslation(["analytics", "common"]);

  const items: StatItem[] = useMemo(
    () => [
      {
        label: t("analytics:stats.totalMatches"),
        value: data.totalMatches,
        icon: Swords,
        accent: "blue",
      },
      {
        label: t("analytics:stats.winRate"),
        value: `${data.winRate}%`,
        icon: Trophy,
        accent: data.winRate >= 50 ? "green" : "orange",
        trend: data.winRate >= 50 ? "up" : "down",
        trendValue: t("analytics:stats.winLossTrend", { wins: data.wins, losses: data.losses }),
      },
      {
        label: t("analytics:stats.totalGoals"),
        value: data.totalGoals,
        icon: Target,
        accent: "orange",
        trendValue: `${data.avgGoals.toFixed(1)} ${t("analytics:stats.perMatch")}`,
      },
      {
        label: t("analytics:stats.avgScore"),
        value: Math.round(data.avgScore),
        icon: TrendingUp,
        accent: "purple",
      },
    ],
    [data, t]
  );

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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

interface SecondaryStatsRowProps {
  data: AnalyticsData;
  streak: { best: number; current: number };
}

export const SecondaryStatsRow = memo(function SecondaryStatsRow({ data, streak }: SecondaryStatsRowProps) {
  const { t } = useTranslation(["analytics", "common"]);

  const items: StatItem[] = useMemo(
    () => [
      {
        label: t("analytics:stats.totalAssists"),
        value: data.totalAssists,
        icon: Zap,
        accent: "purple",
        trendValue: `${data.avgAssists.toFixed(1)} ${t("analytics:stats.perMatch")}`,
      },
      {
        label: t("analytics:stats.totalSaves"),
        value: data.totalSaves,
        icon: Shield,
        accent: "blue",
        trendValue: `${data.avgSaves.toFixed(1)} ${t("analytics:stats.perMatch")}`,
      },
      {
        label: t("analytics:stats.totalShots"),
        value: data.totalShots,
        icon: Crosshair,
        accent: "orange",
        trendValue: `${data.avgShots.toFixed(1)} ${t("analytics:stats.perMatch")}`,
      },
      {
        label: t("analytics:stats.totalDemos"),
        value: data.totalDemos,
        icon: Flame,
        accent: "orange",
      },
    ],
    [data, t]
  );

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
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
      <StreakCompactCard best={streak.best} current={streak.current} />
    </div>
  );
});

function StreakCompactCard({ best, current }: { best: number; current: number }) {
  const { t } = useTranslation(["analytics", "common"]);

  return (
    <Card className="flex items-center gap-3 border-l-[3px] border-l-accent-success p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-success-subtle text-accent-success">
        <Flame size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">{t("analytics:streaks.label")}</p>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="font-mono text-xl font-bold tracking-tight text-text-primary">{current}</span>
          <span className="text-[10px] text-text-tertiary">/ {best} {t("analytics:streaks.bestSuffix")}</span>
        </div>
      </div>
    </Card>
  );
}
