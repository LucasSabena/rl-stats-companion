import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { MatchFilters, MatchType } from "@/lib/types";
import { Search, X } from "lucide-react";

interface FilterBarProps {
  filters: MatchFilters;
  onChange: (filters: MatchFilters) => void;
}

type ResultFilter = "all" | "win" | "loss";

const matchTypeOptions: { value: MatchType; label: string }[] = [
  { value: "ranked", label: "Ranked" },
  { value: "casual", label: "Casual" },
  { value: "tournament", label: "Torneo" },
  { value: "other", label: "Otro" },
];

const modeOptions: { value: string; label: string }[] = [
  { value: "Duel", label: "Duel (1v1)" },
  { value: "Doubles", label: "Doubles (2v2)" },
  { value: "Standard", label: "Standard (3v3)" },
  { value: "Chaos", label: "Chaos (4v4)" },
  { value: "Other", label: "Otro" },
];

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
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as ResultFilter;
      onChange({
        ...filters,
        result: value === "all" ? null : value,
      });
    },
    [filters, onChange]
  );

  const handleMatchType = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      onChange({
        ...filters,
        matchType: value === "all" ? null : (value as MatchType),
      });
    },
    [filters, onChange]
  );

  const handleMode = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
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
      const timestamp = value ? new Date(value).getTime() / 1000 : null;
      onChange({ ...filters, dateFrom: timestamp });
    },
    [filters, onChange]
  );

  const handleDateTo = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const timestamp = value ? new Date(value).getTime() / 1000 : null;
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

  const selectBaseClasses = cn(
    "h-9 rounded-md border bg-bg-secondary px-3 text-sm text-text-primary",
    "border-border-subtle focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/50"
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar por jugador..."
          className={cn(
            "h-9 rounded-md border bg-bg-secondary pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted",
            "border-border-subtle focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/50"
          )}
        />
      </div>

      {/* Filters group */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs text-text-muted">Resultado</label>
        <select value={filters.result ?? "all"} onChange={handleResult} className={selectBaseClasses}>
          <option value="all">Todos</option>
          <option value="win">Victorias</option>
          <option value="loss">Derrotas</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs text-text-muted">Tipo</label>
        <select value={filters.matchType ?? "all"} onChange={handleMatchType} className={selectBaseClasses}>
          <option value="all">Todos</option>
          {matchTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs text-text-muted">Modo</label>
        <select value={filters.mode ?? "all"} onChange={handleMode} className={selectBaseClasses}>
          <option value="all">Todos</option>
          {modeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Date range */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs text-text-muted">Desde</label>
        <input
          type="date"
          value={dateFromValue}
          onChange={handleDateFrom}
          className={cn(selectBaseClasses, "[color-scheme:dark]")}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs text-text-muted">Hasta</label>
        <input
          type="date"
          value={dateToValue}
          onChange={handleDateTo}
          className={cn(selectBaseClasses, "[color-scheme:dark]")}
        />
      </div>

      {/* Clear */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} leftIcon={X}>
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
