import { memo, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
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
import type { DailyRollup } from "@/lib/types";

type ChartMetric = "winRate" | "avgScore" | "matchesPlayed";

interface PerformanceChartProps {
  data: DailyRollup[];
  defaultMetric?: ChartMetric;
}

const METRICS: { key: ChartMetric; label: string; color: string }[] = [
  { key: "winRate", label: "Win Rate", color: "var(--color-accent-primary)" },
  { key: "avgScore", label: "Puntuacion", color: "var(--color-accent-success)" },
  { key: "matchesPlayed", label: "Partidas", color: "var(--color-accent-purple)" },
];

export const PerformanceChart = memo(function PerformanceChart({
  data,
  defaultMetric = "winRate",
}: PerformanceChartProps) {
  const [metric, setMetric] = useState<ChartMetric>(defaultMetric);
  const [showCombo, setShowCombo] = useState(false);

  const chartData = useMemo(() => {
    return data.map((d) => ({
      date: d.date,
      winRate: d.matchesPlayed > 0 ? Math.round((d.wins / d.matchesPlayed) * 100) : 0,
      avgScore: Math.round(d.avgScore),
      matchesPlayed: d.matchesPlayed,
    }));
  }, [data]);

  const yDomain: [number, number] | [number, "auto"] = useMemo(() => {
    if (metric === "winRate") return [0, 100];
    return [0, "auto"];
  }, [metric]);

  if (chartData.length === 0) {
    return (
      <Card className="flex h-64 items-center justify-center">
        <p className="text-sm text-text-secondary">No hay datos para este periodo</p>
      </Card>
    );
  }

  const currentColor = METRICS.find((m) => m.key === metric)?.color ?? "var(--color-accent-primary)";

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-sm font-semibold text-text-primary">Evolucion</h3>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-lg border border-border-subtle bg-bg-tertiary p-0.5">
            {METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => { setMetric(m.key); setShowCombo(false); }}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                  metric === m.key && !showCombo
                    ? "bg-accent-primary text-white shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {m.label}
              </button>
            ))}
            <button
              onClick={() => setShowCombo(!showCombo)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                showCombo
                  ? "bg-accent-primary text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Win + Partidas
            </button>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {showCombo ? (
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
                  border: "1px solid var(--color-border-strong)",
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
                name="Win Rate (%)"
                stroke="var(--color-accent-primary)"
                strokeWidth={2}
                fill="url(#gradient-winRate)"
              />
              <Bar
                yAxisId="right"
                dataKey="matchesPlayed"
                name="Partidas"
                fill="var(--color-accent-purple)"
                fillOpacity={0.6}
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          ) : (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentColor} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={currentColor} stopOpacity={0} />
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
                  border: "1px solid var(--color-border-strong)",
                  borderRadius: "10px",
                  color: "var(--color-text-primary)",
                }}
                labelStyle={{ color: "var(--color-text-primary)" }}
              />
              <Area
                type="monotone"
                dataKey={metric}
                stroke={currentColor}
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
