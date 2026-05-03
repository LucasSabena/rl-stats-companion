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
      "rounded-lg border border-border-subtle bg-bg-secondary/80 p-3",
      "backdrop-blur-sm"
    )}>
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp size={14} className="text-accent-secondary" />
        <span className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
          Rangos
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {ranked.standard && (
          <div className="min-w-0">
            <p className="text-[10px] text-text-tertiary mb-0.5">3v3</p>
            <RankBadge rank={ranked.standard.rank} mmr={ranked.standard.mmr} size="sm" />
          </div>
        )}
        {ranked.double && (
          <div className="min-w-0">
            <p className="text-[10px] text-text-tertiary mb-0.5">2v2</p>
            <RankBadge rank={ranked.double.rank} mmr={ranked.double.mmr} size="sm" />
          </div>
        )}
        {ranked.duel && (
          <div className="min-w-0">
            <p className="text-[10px] text-text-tertiary mb-0.5">1v1</p>
            <RankBadge rank={ranked.duel.rank} mmr={ranked.duel.mmr} size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}
