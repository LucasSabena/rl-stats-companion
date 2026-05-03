import { memo, useState, useMemo } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { PlayerStats } from "@/lib/types";

interface PlayerStatsTableProps {
  players: PlayerStats[];
}

type Tab = "table" | "compare";
type StatKey = "goals" | "assists" | "saves" | "shots" | "score" | "demos" | "touches";

const STAT_KEYS: { key: StatKey; label: string }[] = [
  { key: "goals", label: "Goles" },
  { key: "assists", label: "Asistencias" },
  { key: "saves", label: "Paradas" },
  { key: "shots", label: "Tiros" },
  { key: "score", label: "Puntos" },
  { key: "demos", label: "Demos" },
  { key: "touches", label: "Toques" },
];

function getTeamBarColor(team: 0 | 1): string {
  if (team === 0) return "rgba(96,165,250,1)"; // blue-400
  return "rgba(251,146,60,1)"; // orange-400
}

export const PlayerStatsTable = memo(function PlayerStatsTable({
  players,
}: PlayerStatsTableProps) {
  const [tab, setTab] = useState<Tab>("table");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const bestScore = useMemo(
    () => (players.length > 0 ? Math.max(...players.map((p) => p.score)) : 0),
    [players]
  );

  const columns = [
    {
      key: "name",
      header: "Jugador",
      sortable: true,
      render: (p: PlayerStats) => (
        <div className="flex items-center gap-2">
          {p.mvp && <Crown size={14} className="shrink-0 text-yellow-400" />}
          <span className="font-medium text-text-primary">{p.name}</span>
        </div>
      ),
    },
    {
      key: "team",
      header: "Equipo",
      sortable: true,
      render: (p: PlayerStats) =>
        p.team === 0 ? (
          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">
            Azul
          </span>
        ) : (
          <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-400">
            Naranja
          </span>
        ),
    },
    { key: "score", header: "Puntos", sortable: true },
    { key: "goals", header: "Goles", sortable: true },
    { key: "assists", header: "Asist.", sortable: true },
    { key: "saves", header: "Paradas", sortable: true },
    { key: "shots", header: "Tiros", sortable: true },
    { key: "demos", header: "Demos", sortable: true },
    { key: "touches", header: "Toques", sortable: true },
  ];

  const compareColumns = [
    {
      key: "__select",
      header: "",
      render: (p: PlayerStats) => (
        <input
          type="checkbox"
          checked={selectedIds.has(p.id)}
          onChange={() => toggleSelect(p.id)}
          className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500/30"
        />
      ),
    },
    ...columns,
  ];

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const selectedPlayers = useMemo(
    () => players.filter((p) => selectedIds.has(p.id)),
    [players, selectedIds]
  );

  const chartData = useMemo(() => {
    return STAT_KEYS.map(({ key, label }) => {
      const entry: Record<string, string | number> = { stat: label };
      selectedPlayers.forEach((p) => {
        entry[p.name] = p[key] ?? 0;
      });
      return entry;
    });
  }, [selectedPlayers]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          Estadísticas de jugadores
        </h3>

        <div className="flex rounded-lg border border-border-subtle bg-bg-tertiary p-0.5">
          <button
            onClick={() => setTab("table")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              tab === "table"
                ? "bg-accent-primary text-white"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            Tabla
          </button>
          <button
            onClick={() => setTab("compare")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
              tab === "compare"
                ? "bg-accent-primary text-white"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            Comparar
          </button>
        </div>
      </div>

      {tab === "table" ? (
        <DataTable
          columns={columns}
          data={players}
          keyExtractor={(p) => p.id}
          emptyMessage="No hay datos de jugadores"
          rowClassName={(p: PlayerStats) =>
            p.score === bestScore ? "bg-accent-primary/5" : undefined
          }
        />
      ) : (
        <div>
          <DataTable
            columns={compareColumns}
            data={players}
            keyExtractor={(p) => p.id}
            emptyMessage="No hay datos de jugadores"
          />

          <div className="mt-6 rounded-lg border border-border-subtle bg-bg-secondary p-4">
            {selectedPlayers.length >= 2 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="stat"
                      tick={{ fill: "#64748B", fontSize: 11 }}
                      axisLine={{ stroke: "#1E293B" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#64748B", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        border: "1px solid #1E293B",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#F8FAFC" }}
                    />
                    {selectedPlayers.map((player) => (
                      <Bar
                        key={player.id}
                        dataKey={player.name}
                        fill={getTeamBarColor(player.team)}
                        radius={[3, 3, 0, 0]}
                        maxBarSize={40}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center">
                <p className="text-sm text-text-secondary">
                  Selecciona al menos 2 jugadores para comparar
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
