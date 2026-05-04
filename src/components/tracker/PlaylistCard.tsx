import type { PlaylistStats } from "@/lib/types";
import { RankBadge } from "./RankBadge";
import { cn } from "@/lib/utils";

interface PlaylistCardProps {
  name: string;
  stats: PlaylistStats | null;
  className?: string;
}

const PLAYLIST_LABELS: Record<string, string> = {
  duel: "1v1",
  double: "2v2",
  standard: "3v3",
  dropshot: "Dropshot",
  hoops: "Hoops",
  rumble: "Rumble",
  snowday: "Snow Day",
  unranked: "Casual",
};

export function PlaylistCard({ name, stats, className }: PlaylistCardProps) {
  const label = PLAYLIST_LABELS[name] || name;

  if (!stats || (!stats.rank && stats.mmr == null)) {
    return (
      <div className={cn("rounded-xl border border-border-subtle bg-bg-secondary p-3", className)}>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">{label}</p>
        <span className="text-sm text-text-tertiary italic">Sin datos</span>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-border-subtle bg-bg-secondary p-3 transition-all duration-200 hover:border-border-default", className)}>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">{label}</p>

      <RankBadge rank={stats.rank} mmr={stats.mmr} size="sm" />

      <div className="mt-2 flex gap-3 text-xs text-text-tertiary">
        {stats.matchesPlayed != null && (
          <span>{stats.matchesPlayed} part.</span>
        )}
        {stats.winStreak != null && stats.winStreak > 0 && (
          <span className="text-accent-success font-medium">W{stats.winStreak}</span>
        )}
        {stats.loseStreak != null && stats.loseStreak > 0 && (
          <span className="text-accent-danger font-medium">L{stats.loseStreak}</span>
        )}
      </div>
    </div>
  );
}
