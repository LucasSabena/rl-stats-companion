import { memo, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { DailyRollup } from "@/lib/types";

interface PerformanceChartProps {
  data: DailyRollup[];
  metric: "winRate" | "avgScore" | "matchesPlayed";
}

export const PerformanceChart = memo(function PerformanceChart({ data, metric }: PerformanceChartProps) {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      date: d.date,
      winRate: d.matchesPlayed > 0 ? Math.round((d.wins / d.matchesPlayed) * 100) : 0,
      avgScore: Math.round(d.avgScore),
      matchesPlayed: d.matchesPlayed,
    }));
  }, [data]);

  const labels = {
    winRate: "Win Rate (%)",
    avgScore: "Puntuación media",
    matchesPlayed: "Partidas jugadas",
  };

  const colors = {
    winRate: "#3B82F6",
    avgScore: "#10B981",
    matchesPlayed: "#8B5CF6",
  };

  if (chartData.length === 0) {
    return (
      <Card className="flex h-64 items-center justify-center">
        <p className="text-sm text-text-secondary">No hay datos para este período</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-text-primary">{labels[metric]}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[metric]} stopOpacity={0.1} />
                <stop offset="95%" stopColor={colors[metric]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="date" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={{ stroke: "#1E293B" }} tickLine={false} />
            <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
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
              stroke={colors[metric]}
              strokeWidth={2}
              fill={`url(#gradient-${metric})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
});
