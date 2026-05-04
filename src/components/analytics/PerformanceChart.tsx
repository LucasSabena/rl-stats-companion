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
  { key: "winRate", label: "Win Rate", color: "#3B82F6" },
  { key: "avgScore", label: "Puntuación", color: "#10B981" },
  { key: "matchesPlayed", label: "Partidas", color: "#8B5CF6" },
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
        <p className="text-sm text-text-secondary">No hay datos para este período</p>
      </Card>
    );
  }

  const currentColor = METRICS.find((m) => m.key === metric)?.color ?? "#3B82F6";

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-text-primary">Evolución</h3>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border-subtle bg-bg-tertiary p-0.5">
            {METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => { setMetric(m.key); setShowCombo(false); }}
                className={`rounded px-3 py-1 text-xs font-medium transition-all ${
                  metric === m.key && !showCombo
                    ? "bg-accent-primary text-white"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {m.label}
              </button>
            ))}
            <button
              onClick={() => setShowCombo(!showCombo)}
              className={`rounded px-3 py-1 text-xs font-medium transition-all ${
                showCombo
                  ? "bg-accent-primary text-white"
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
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#64748B", fontSize: 11 }}
                axisLine={{ stroke: "#1E293B" }}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                domain={[0, 100]}
                tick={{ fill: "#64748B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                allowDecimals={false}
                tick={{ fill: "#64748B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #1E293B",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#F8FAFC" }}
              />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="winRate"
                name="Win Rate (%)"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#gradient-winRate)"
              />
              <Bar
                yAxisId="right"
                dataKey="matchesPlayed"
                name="Partidas"
                fill="#8B5CF6"
                fillOpacity={0.6}
                radius={[2, 2, 0, 0]}
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
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#64748B", fontSize: 11 }}
                axisLine={{ stroke: "#1E293B" }}
                tickLine={false}
              />
              <YAxis
                domain={yDomain}
                tick={{ fill: "#64748B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #1E293B",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#F8FAFC" }}
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
