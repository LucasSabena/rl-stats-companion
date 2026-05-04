import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import type { MatchFilters, MatchType } from "@/lib/types";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface FilterBarProps {
  filters: MatchFilters;
  onChange: (filters: MatchFilters) => void;
}

const resultOptions = [
  { value: "all", label: "Todos los resultados" },
  { value: "win", label: "Victorias" },
  { value: "loss", label: "Derrotas" },
];

const matchTypeOptions = [
  { value: "all", label: "Todos los tipos" },
  { value: "ranked", label: "Ranked" },
  { value: "casual", label: "Casual" },
  { value: "tournament", label: "Torneo" },
  { value: "other", label: "Otro" },
];

const modeOptions = [
  { value: "all", label: "Todos los modos" },
  { value: "Duel", label: "Duel (1v1)" },
  { value: "Doubles", label: "Doubles (2v2)" },
  { value: "Standard", label: "Standard (3v3)" },
  { value: "Chaos", label: "Chaos (4v4)" },
  { value: "Other", label: "Otro" },
];

const dateInputClasses = cn(
  "h-9 rounded-md border bg-bg-secondary px-3 text-sm text-text-primary",
  "border-border-subtle focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/50",
  "[color-scheme:dark]"
);

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const [search, setSearch] = useState(filters.search ?? "");

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      onChange({ ...filters, search: value || undefined });
    },
    [filters, onChange]
  );

  const handleResult = useCallback(
    (value: string) => {
      onChange({
        ...filters,
        result: value === "all" ? null : (value as "win" | "loss"),
      });
    },
    [filters, onChange]
  );

  const handleMatchType = useCallback(
    (value: string) => {
      onChange({
        ...filters,
        matchType: value === "all" ? null : (value as MatchType),
      });
    },
    [filters, onChange]
  );

  const handleMode = useCallback(
    (value: string) => {
      onChange({
        ...filters,
        mode: value === "all" ? null : value,
      });
    },
    [filters, onChange]
  );

  const handleDateFrom = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const timestamp = value ? new Date(value + "T00:00:00").getTime() / 1000 : null;
      onChange({ ...filters, dateFrom: timestamp });
    },
    [filters, onChange]
  );

  const handleDateTo = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const timestamp = value ? new Date(value + "T23:59:59").getTime() / 1000 : null;
      onChange({ ...filters, dateTo: timestamp });
    },
    [filters, onChange]
  );

  const clearFilters = useCallback(() => {
    setSearch("");
    onChange({});
  }, [onChange]);

  const hasFilters =
    filters.result ||
    filters.search ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.matchType ||
    filters.mode;

  const dateFromValue = filters.dateFrom
    ? new Date(filters.dateFrom * 1000).toISOString().slice(0, 10)
    : "";

  const dateToValue = filters.dateTo
    ? new Date(filters.dateTo * 1000).toISOString().slice(0, 10)
    : "";

  return (
    <div className="mt-6 rounded-xl border border-border-subtle bg-bg-tertiary/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal size={16} className="text-text-muted" />
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Filtros
        </span>
        {hasFilters && (
          <span className="ml-auto">
            <Button variant="ghost" size="sm" onClick={clearFilters} leftIcon={X}>
              Limpiar
            </Button>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-muted">Buscar</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Nombre de jugador..."
              className={cn(
                "h-9 w-48 rounded-md border bg-bg-secondary pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted",
                "border-border-subtle focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/50"
              )}
            />
          </div>
        </div>

        {/* Resultado */}
        <Select
          options={resultOptions}
          value={filters.result ?? "all"}
          onChange={handleResult}
          placeholder="Resultado"
        />

        {/* Tipo */}
        <Select
          options={matchTypeOptions}
          value={filters.matchType ?? "all"}
          onChange={handleMatchType}
          placeholder="Tipo"
        />

        {/* Modo */}
        <Select
          options={modeOptions}
          value={filters.mode ?? "all"}
          onChange={handleMode}
          placeholder="Modo"
        />

        {/* Date range */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-muted">Desde</label>
          <input
            type="date"
            value={dateFromValue}
            onChange={handleDateFrom}
            className={dateInputClasses}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-muted">Hasta</label>
          <input
            type="date"
            value={dateToValue}
            onChange={handleDateTo}
            className={dateInputClasses}
          />
        </div>
      </div>
    </div>
  );
}
