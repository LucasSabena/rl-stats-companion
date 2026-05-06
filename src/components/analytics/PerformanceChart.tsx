import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
  ComposedChart,
  Bar,
} from "recharts";
import { BarChart3 } from "lucide-react";
import type { DailyRollup } from "@/lib/types";

type ChartMetric = "winRate" | "matchesPlayed" | "avgScore" | "goals" | "assists" | "saves" | "demos";

interface PerformanceChartProps {
  data: DailyRollup[];
  defaultMetric?: ChartMetric;
}

const METRIC_KEYS: { key: ChartMetric; labelKey: string; color: string; type: "rate" | "volume" }[] = [
  { key: "winRate", labelKey: "analytics:chart.metrics.wr", color: "var(--color-accent-primary)", type: "rate" },
  { key: "matchesPlayed", labelKey: "analytics:chart.metrics.matches", color: "var(--color-accent-purple)", type: "volume" },
  { key: "avgScore", labelKey: "analytics:chart.metrics.score", color: "var(--color-accent-success)", type: "volume" },
  { key: "goals", labelKey: "analytics:chart.metrics.goals", color: "var(--color-accent-secondary)", type: "volume" },
  { key: "assists", labelKey: "analytics:chart.metrics.assists", color: "var(--color-accent-purple)", type: "volume" },
  { key: "saves", labelKey: "analytics:chart.metrics.saves", color: "var(--color-accent-primary)", type: "volume" },
  { key: "demos", labelKey: "analytics:chart.metrics.demos", color: "var(--color-accent-danger)", type: "volume" },
];

export const PerformanceChart = memo(function PerformanceChart({
  data,
  defaultMetric = "winRate",
}: PerformanceChartProps) {
  const { t } = useTranslation(["analytics", "common"]);
  const [metric, setMetric] = useState<ChartMetric>(defaultMetric);
  const [combo, setCombo] = useState(true);

  const METRICS = METRIC_KEYS.map((m) => ({ ...m, label: t(m.labelKey) }));

  const chartData = useMemo(() => {
    return data.map((d) => ({
      date: d.date,
      winRate: d.matchesPlayed > 0 ? Math.round((d.wins / d.matchesPlayed) * 100) : 0,
      matchesPlayed: d.matchesPlayed,
      avgScore: Math.round(d.avgScore),
      goals: d.totalGoals,
      assists: d.totalAssists,
      saves: d.totalSaves,
      demos: d.totalDemos,
    }));
  }, [data]);

  const currentMetricDef = METRICS.find((m) => m.key === metric)!;

  const volumeMetricKey: ChartMetric = useMemo(() => {
    if (currentMetricDef.type === "volume") return metric;
    return "matchesPlayed";
  }, [currentMetricDef.type, metric]);

  const volumeMetricDef = METRICS.find((m) => m.key === volumeMetricKey)!;

  const yDomain: [number, number] | [number, "auto"] = useMemo(() => {
    if (!combo && metric === "winRate") return [0, 100];
    return [0, "auto"];
  }, [combo, metric]);

  if (chartData.length === 0) {
    return (
      <Card className="flex h-64 items-center justify-center">
        <p className="text-sm text-text-secondary">{t("analytics:chart.noData")}</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-display text-sm font-semibold text-text-primary">{t("analytics:chart.evolution")}</h3>

        <div className="flex items-center gap-2">
          <div className="flex flex-wrap items-center gap-0.5 rounded-lg border border-border-subtle bg-bg-panel p-0.5">
            {METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => { setMetric(m.key); setCombo(false); }}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
                  metric === m.key && !combo
                    ? "bg-accent-primary text-white shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCombo(!combo)}
            className={cn(
              "flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
              combo
                ? "border-accent-primary bg-accent-primary text-white shadow-sm"
                : "border-border-subtle bg-bg-surface text-text-secondary hover:text-text-primary"
            )}
          >
            <BarChart3 size={14} />
            {t("analytics:chart.combo")}
          </button>
        </div>
      </div>

      <div role="img" aria-label={t("analytics:chart.ariaLabel", { metric: currentMetricDef.label })} className="h-80 max-sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          {combo ? (
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="gradient-winRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent-primary)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--color-accent-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }}
                axisLine={{ stroke: "var(--color-border-subtle)" }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                domain={[0, 100]}
                tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                allowDecimals={false}
                tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border-highlight)",
                  borderRadius: "10px",
                  color: "var(--color-text-primary)",
                }}
                labelStyle={{ color: "var(--color-text-primary)" }}
              />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="winRate"
                name={t("analytics:chart.winRate")}
                stroke="var(--color-accent-primary)"
                strokeWidth={2}
                fill="url(#gradient-winRate)"
              />
              <Bar
                yAxisId="right"
                dataKey={volumeMetricKey}
                name={volumeMetricDef.label}
                fill={volumeMetricDef.color}
                fillOpacity={0.6}
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          ) : (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentMetricDef.color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={currentMetricDef.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }}
                axisLine={{ stroke: "var(--color-border-subtle)" }}
                tickLine={false}
              />
              <YAxis
                domain={yDomain}
                tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border-highlight)",
                  borderRadius: "10px",
                  color: "var(--color-text-primary)",
                }}
                labelStyle={{ color: "var(--color-text-primary)" }}
              />
              <Area
                type="monotone"
                dataKey={metric}
                name={currentMetricDef.label}
                stroke={currentMetricDef.color}
                strokeWidth={2}
                fill={`url(#gradient-${metric})`}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
});
