import { useTranslation } from "react-i18next";
import { useTrackerProfile } from "@/hooks/useTrackerProfile";
import { RankBadge } from "./RankBadge";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

export function RankWidget() {
  const { t } = useTranslation("tracker");
  const { data: profile, isLoading } = useTrackerProfile();

  if (isLoading || !profile) return null;

  const ranked = profile.stats.ranked;

  return (
    <div className={cn(
      "rounded-xl border border-border-subtle bg-bg-surface/80 p-2.5",
      "backdrop-blur-sm"
    )}>
      <div className="flex items-center gap-1.5 mb-2">
        <TrendingUp size={12} className="text-accent-primary" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
          {t("ranks.title")}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {ranked.standard && (
          <div className="min-w-0">
            <p className="mb-0.5 text-[10px] font-medium text-text-tertiary">{t("playlist.standard")}</p>
            <RankBadge rank={ranked.standard.rank} mmr={ranked.standard.mmr} size="sm" />
          </div>
        )}
        {ranked.double && (
          <div className="min-w-0">
            <p className="mb-0.5 text-[10px] font-medium text-text-tertiary">{t("playlist.double")}</p>
            <RankBadge rank={ranked.double.rank} mmr={ranked.double.mmr} size="sm" />
          </div>
        )}
        {ranked.duel && (
          <div className="min-w-0">
            <p className="mb-0.5 text-[10px] font-medium text-text-tertiary">{t("playlist.duel")}</p>
            <RankBadge rank={ranked.duel.rank} mmr={ranked.duel.mmr} size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}
