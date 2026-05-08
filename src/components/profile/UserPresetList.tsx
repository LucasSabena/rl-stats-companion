import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import type { UserPreset } from "@/lib/types";
import { Edit3, Trash2, Download, Share2, Sliders } from "lucide-react";

interface UserPresetListProps {
  presets: UserPreset[];
  onEdit: (p: UserPreset) => void;
  onDelete: (id: number) => void;
  onShare: (p: UserPreset) => void;
  onExport: (p: UserPreset) => void;
}

function formatDateLabel(iso: string, lang = "es"): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(lang, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export function UserPresetList({ presets, onEdit, onDelete, onShare, onExport }: UserPresetListProps) {
  const { t, i18n } = useTranslation("presets");
  const lang = i18n.language || "es";

  if (presets.length === 0) {
    return (
      <EmptyState
        icon={Sliders}
        title={t("emptyTitle")}
        description={t("emptyDescription")}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {presets.map((preset) => (
        <div
          key={preset.id}
          className="group flex flex-col rounded-xl border border-border-subtle bg-bg-surface p-4 transition-all hover:border-border-highlight hover:bg-surface-hover hover:shadow-level-1"
        >
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-text-primary">{preset.name}</h3>
              {preset.description && (
                <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{preset.description}</p>
              )}
            </div>
            <div className="ml-2 flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button variant="icon" size="sm" onClick={() => onEdit(preset)} aria-label={t("editPreset")}>
                <Edit3 size={14} />
              </Button>
              <Button variant="icon" size="sm" onClick={() => onDelete(preset.id)} aria-label={t("delete")}>
                <Trash2 size={14} />
              </Button>
              <Button variant="icon" size="sm" onClick={() => onExport(preset)} aria-label={t("export")}>
                <Download size={14} />
              </Button>
              <Button variant="icon" size="sm" onClick={() => onShare(preset)} aria-label={t("share")}>
                <Share2 size={14} />
              </Button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {preset.camera && (
              <span className="rounded-md bg-accent-primary-subtle px-2 py-0.5 text-xs font-medium text-accent-primary">
                {t("camera")}
              </span>
            )}
            {preset.controls && (
              <span className="rounded-md bg-accent-secondary-subtle px-2 py-0.5 text-xs font-medium text-accent-secondary">
                {t("controls")}
              </span>
            )}
            {preset.deadzone && (
              <span className="rounded-md bg-surface-elevated px-2 py-0.5 text-xs font-medium text-text-secondary">
                {t("deadzone")}
              </span>
            )}
            {preset.hardware && (
              <span className="rounded-md bg-surface-elevated px-2 py-0.5 text-xs font-medium text-text-secondary">
                {t("hardware")}
              </span>
            )}
          </div>

          <div className="mt-auto pt-3 text-xs text-text-tertiary">
            {formatDateLabel(preset.updatedAt || preset.createdAt, lang)}
          </div>
        </div>
      ))}
    </div>
  );
}
