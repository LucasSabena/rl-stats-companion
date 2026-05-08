import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import type { TrainingPack, PackDifficulty } from "@/lib/trainingPacksTypes";
import {
  ExternalLink,
  Copy,
  Star,
  PackageOpen,
} from "lucide-react";
import { useState } from "react";

interface TrainingPackDetailProps {
  pack: TrainingPack | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const DIFFICULTY_STYLES: Record<PackDifficulty, { badge: string; labelColor: string }> = {
  beginner: {
    badge: "bg-accent-success-subtle text-accent-success border border-accent-success/20",
    labelColor: "text-accent-success",
  },
  intermediate: {
    badge: "bg-accent-info-subtle text-accent-info border border-accent-info/20",
    labelColor: "text-accent-info",
  },
  advanced: {
    badge: "bg-accent-warning-subtle text-accent-warning border border-accent-warning/20",
    labelColor: "text-accent-warning",
  },
  pro: {
    badge: "bg-accent-danger-subtle text-accent-danger border border-accent-danger/20",
    labelColor: "text-accent-danger",
  },
};

export function TrainingPackDetail({
  pack,
  isFavorite,
  onToggleFavorite,
}: TrainingPackDetailProps) {
  const { t } = useTranslation("trainingPacks");
  const [copied, setCopied] = useState(false);

  if (!pack) {
    return (
      <EmptyState
        icon={PackageOpen}
        title={t("page.noResults")}
        description={t("page.searchPlaceholder")}
        className="h-full"
      />
    );
  }

  const diffStyle = DIFFICULTY_STYLES[pack.difficulty];

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(pack.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard errors
    }
  };

  return (
    <div className="bg-bg-surface/80 backdrop-blur-xl border border-border-subtle rounded-xl p-6 h-full flex flex-col gap-5 animate-slide-in-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold tracking-wider text-text-muted uppercase">
            {t("page.codeLabel")}
          </span>
          <h2 className="font-display text-xl font-bold text-text-primary leading-tight">
            {pack.name}
          </h2>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide bg-bg-elevated text-text-secondary border border-border-subtle">
          {t(`categories.${pack.category}`)}
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
            diffStyle.badge
          )}
        >
          {t(`difficulties.${pack.difficulty}`)}
        </span>
      </div>

      {/* Creator + source link */}
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <span className="text-text-muted">{pack.creator}</span>
        {pack.sourceUrl && (
          <a
            href={pack.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-link hover:text-link-hover transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={12} />
            {t("card.viewDetails")}
          </a>
        )}
      </div>

      {/* Big code display */}
      <div className="rounded-xl border border-border-subtle bg-bg-base p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold tracking-wider text-text-muted uppercase">
            {t("page.codeLabel")}
          </span>
          <Button
            variant="primary"
            size="sm"
            leftIcon={Copy}
            onClick={handleCopyCode}
            className={cn(
              "transition-all",
              copied && "bg-accent-success hover:bg-accent-success"
            )}
          >
            {copied ? t("page.copied") : t("page.copyCode")}
          </Button>
        </div>
        <div
          className="font-mono text-lg font-semibold tracking-widest text-text-primary break-all select-all cursor-pointer"
          onClick={handleCopyCode}
          title={t("page.copyCode")}
        >
          {pack.code}
        </div>
      </div>

      {/* Description */}
      {pack.description && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold tracking-wider text-text-muted uppercase">
            {t("page.descriptionLabel")}
          </span>
          <p className="text-sm text-text-secondary leading-relaxed">
            {pack.description}
          </p>
        </div>
      )}

      {/* Tags */}
      {pack.tags && pack.tags.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold tracking-wider text-text-muted uppercase">
            Tags
          </span>
          <div className="flex flex-wrap gap-2">
            {pack.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block rounded-full bg-bg-elevated border border-border-subtle px-2.5 py-0.5 text-xs font-medium text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto pt-2">
        <Button
          variant={isFavorite ? "secondary" : "primary"}
          leftIcon={Star}
          onClick={onToggleFavorite}
          className={cn(
            "w-full",
            isFavorite && "text-yellow-400 border-yellow-400/30 hover:border-yellow-400/50"
          )}
        >
          {isFavorite ? t("page.removedFromFavorites") : t("page.addedToFavorites")}
        </Button>
      </div>
    </div>
  );
}
