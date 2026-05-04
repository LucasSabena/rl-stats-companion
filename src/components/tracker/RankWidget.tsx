import { useTrackerProfile } from "@/hooks/useTrackerProfile";
import { RankBadge } from "./RankBadge";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

export function RankWidget() {
  const { data: profile, isLoading } = useTrackerProfile();

  if (isLoading || !profile) return null;

  const ranked = profile.stats.ranked;

  return (
    <div className={cn(
      "rounded-xl border border-border-subtle bg-bg-secondary/80 p-4",
      "backdrop-blur-sm"
    )}>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={14} className="text-accent-primary" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
          Rangos
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {ranked.standard && (
          <div className="min-w-0">
            <p className="mb-0.5 text-[10px] font-medium text-text-tertiary">3v3</p>
            <RankBadge rank={ranked.standard.rank} mmr={ranked.standard.mmr} size="sm" />
          </div>
        )}
        {ranked.double && (
          <div className="min-w-0">
            <p className="mb-0.5 text-[10px] font-medium text-text-tertiary">2v2</p>
            <RankBadge rank={ranked.double.rank} mmr={ranked.double.mmr} size="sm" />
          </div>
        )}
        {ranked.duel && (
          <div className="min-w-0">
            <p className="mb-0.5 text-[10px] font-medium text-text-tertiary">1v1</p>
            <RankBadge rank={ranked.duel.rank} mmr={ranked.duel.mmr} size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}
