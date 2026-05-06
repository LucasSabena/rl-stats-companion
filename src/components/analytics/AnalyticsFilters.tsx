import { useTranslation } from "react-i18next";
import type { AnalyticsPeriod, PlaylistFilter, MatchTypeFilter } from "@/lib/types";
import { PeriodTabs } from "./PeriodTabs";
import { ListMusic, Swords, ChevronDown } from "lucide-react";

interface AnalyticsFiltersProps {
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  playlist: PlaylistFilter;
  onPlaylistChange: (playlist: PlaylistFilter) => void;
  matchType: MatchTypeFilter;
  onMatchTypeChange: (matchType: MatchTypeFilter) => void;
  isLoading?: boolean;
}

const playlistKeys: { value: PlaylistFilter; key: string }[] = [
  { value: "all", key: "analytics:filters.playlists.all" },
  { value: "duel", key: "analytics:filters.playlists.duel" },
  { value: "doubles", key: "analytics:filters.playlists.doubles" },
  { value: "standard", key: "analytics:filters.playlists.standard" },
  { value: "chaos", key: "analytics:filters.playlists.chaos" },
  { value: "rumble", key: "analytics:filters.playlists.rumble" },
  { value: "dropshot", key: "analytics:filters.playlists.dropshot" },
  { value: "hoops", key: "analytics:filters.playlists.hoops" },
  { value: "snowday", key: "analytics:filters.playlists.snowday" },
  { value: "other", key: "analytics:filters.playlists.other" },
];

const matchTypeKeys: { value: MatchTypeFilter; key: string }[] = [
  { value: "all", key: "analytics:filters.matchTypes.all" },
  { value: "ranked", key: "analytics:filters.matchTypes.ranked" },
  { value: "casual", key: "analytics:filters.matchTypes.casual" },
  { value: "tournament", key: "analytics:filters.matchTypes.tournament" },
  { value: "training", key: "analytics:filters.matchTypes.training" },
  { value: "other", key: "analytics:filters.matchTypes.other" },
];

export function AnalyticsFilters({
  period,
  onPeriodChange,
  playlist,
  onPlaylistChange,
  matchType,
  onMatchTypeChange,
  isLoading,
}: AnalyticsFiltersProps) {
  const { t } = useTranslation(["analytics", "common"]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <PeriodTabs active={period} onChange={onPeriodChange} />

      <div className="hidden h-6 w-px bg-border-subtle sm:block" />

      <div className="relative w-full sm:w-auto">
        <ListMusic size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <select
          value={playlist}
          onChange={(e) => onPlaylistChange(e.target.value as PlaylistFilter)}
          disabled={isLoading}
          aria-label={t("analytics:filters.playlistAriaLabel")}
          className="h-9 w-full appearance-none rounded-md border border-border-subtle bg-bg-surface py-1.5 pl-9 pr-8 text-xs text-text-primary transition-colors hover:border-border-highlight focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/50 disabled:opacity-50 sm:w-[160px]"
        >
          {playlistKeys.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.key)}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
      </div>

      <div className="relative w-full sm:w-auto">
        <Swords size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <select
          value={matchType}
          onChange={(e) => onMatchTypeChange(e.target.value as MatchTypeFilter)}
          disabled={isLoading}
          aria-label={t("analytics:filters.matchTypeAriaLabel")}
          className="h-9 w-full appearance-none rounded-md border border-border-subtle bg-bg-surface py-1.5 pl-9 pr-8 text-xs text-text-primary transition-colors hover:border-border-highlight focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/50 disabled:opacity-50 sm:w-[140px]"
        >
          {matchTypeKeys.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.key)}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
      </div>
    </div>
  );
}
