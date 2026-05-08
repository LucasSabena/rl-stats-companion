import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { PackCategory } from "@/lib/trainingPacksTypes";
import {
  Zap,
  Plane,
  Gamepad2,
  Target,
  CircleDashed,
  Flag,
  Shield,
  Flame,
  Volleyball,
  Hexagon,
  Crosshair,
  Gem,
} from "lucide-react";

const CATEGORIES: { key: PackCategory; icon: React.ElementType }[] = [
  { key: "speedflip", icon: Zap },
  { key: "aerial", icon: Plane },
  { key: "dribbling", icon: Gamepad2 },
  { key: "shooting", icon: Target },
  { key: "rings", icon: CircleDashed },
  { key: "obstacle-course", icon: Flag },
  { key: "kickoff", icon: Flame },
  { key: "wall-ceiling", icon: Hexagon },
  { key: "goalie", icon: Shield },
  { key: "freestyle", icon: Gem },
  { key: "defense", icon: Crosshair },
  { key: "powershot", icon: Volleyball },
];

interface CategoryFilterProps {
  activeCategory: string | null;
  onCategoryChange: (c: string | null) => void;
}

export function CategoryFilter({ activeCategory, onCategoryChange }: CategoryFilterProps) {
  const { t } = useTranslation("trainingPacks");

  return (
    <div className="relative w-full">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
        <button
          type="button"
          onClick={() => onCategoryChange(null)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
            activeCategory === null
              ? "bg-accent-primary text-white"
              : "bg-bg-panel text-text-secondary border border-border-subtle hover:bg-surface-hover"
          )}
        >
          {t("categories.all")}
        </button>

        {CATEGORIES.map(({ key, icon: Icon }) => {
          const isActive = activeCategory === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onCategoryChange(isActive ? null : key)}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-accent-primary text-white"
                  : "bg-bg-panel text-text-secondary border border-border-subtle hover:bg-surface-hover"
              )}
            >
              <Icon size={14} />
              {t(`categories.${key}`)}
            </button>
          );
        })}
      </div>

      {/* Left/right fade indicators for overflow */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-bg-base to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-bg-base to-transparent" />
    </div>
  );
}
