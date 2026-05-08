import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { PageContainer } from "@/components/layout/PageContainer";
import { useTrainingPacks } from "@/hooks/useTrainingPacks";
import { CategoryFilter } from "@/components/training-packs/CategoryFilter";
import { TrainingPackDetail } from "@/components/training-packs/TrainingPackDetail";
import { AddPackModal } from "@/components/training-packs/AddPackModal";
import { useTrainingPacksStore } from "@/stores/trainingPacksStore";
import type { TrainingPack } from "@/lib/trainingPacksTypes";

import { Search, Plus, Star, RotateCw, Target } from "lucide-react";

export function TrainingPacksPage() {
  const { t } = useTranslation("trainingPacks");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeDifficulty, setActiveDifficulty] = useState<string | null>(null);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const { packs, featuredPacks, isLoading, isError, filteredPacks, refetch } = useTrainingPacks();
  const { favorites, toggleFavorite, addUserPack, isFavorite } = useTrainingPacksStore();

  const allPacks = filteredPacks(search, activeCategory, activeDifficulty);
  const visiblePacks = favoritesOnly
    ? allPacks.filter((p) => favorites.has(p.id))
    : allPacks;

  const selectedPack = packs.find((p) => p.id === selectedPackId) ?? null;

  const handleAddSave = useCallback(
    (pack: Omit<TrainingPack, "id" | "featured" | "sourceUrl">) => {
      addUserPack(pack as Parameters<typeof addUserPack>[0]);
      setAddModalOpen(false);
    },
    [addUserPack]
  );

  const handleToggleFavorite = useCallback(
    (id: string) => {
      toggleFavorite(id);
    },
    [toggleFavorite]
  );

  return (
    <PageContainer>
      <div className="flex h-[calc(100vh-8rem)] gap-5">
        {/* LEFT PANEL: Filters + List */}
        <div className="flex w-80 shrink-0 flex-col gap-3 overflow-hidden rounded-xl border border-border-subtle bg-bg-surface/80 backdrop-blur-xl p-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-text-primary">
              {t("page.title")}
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFavoritesOnly((v) => !v)}
                className={`rounded-lg p-1.5 transition-colors ${
                  favoritesOnly
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "text-text-tertiary hover:bg-bg-panel hover:text-text-secondary"
                }`}
                title={t("page.favorites")}
              >
                <Star size={16} className={favoritesOnly ? "fill-yellow-400" : ""} />
              </button>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-bg-panel hover:text-text-secondary"
                title="Refresh"
              >
                <RotateCw size={16} />
              </button>
              <button
                type="button"
                onClick={() => setAddModalOpen(true)}
                className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-bg-panel hover:text-text-secondary"
                title={t("page.addPack")}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("page.searchPlaceholder")}
              className="w-full rounded-lg border border-border-subtle bg-bg-base py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/50 transition-all"
            />
          </div>

          {/* Category Chips */}
          <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

          {/* Difficulty Buttons */}
          <div className="flex gap-1.5">
            {(["beginner","intermediate","advanced","pro"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setActiveDifficulty((prev) => (prev === d ? null : d))}
                className={`flex-1 rounded-md py-1 text-[10px] font-semibold tracking-wide transition-all ${
                  activeDifficulty === d
                    ? d === "beginner"
                      ? "bg-accent-success-subtle text-accent-success border border-accent-success/30"
                      : d === "intermediate"
                      ? "bg-accent-info-subtle text-accent-info border border-accent-info/30"
                      : d === "advanced"
                      ? "bg-accent-warning-subtle text-accent-warning border border-accent-warning/30"
                      : "bg-accent-danger-subtle text-accent-danger border border-accent-danger/30"
                    : "bg-bg-panel text-text-muted border border-border-subtle hover:bg-bg-hover"
                }`}
              >
                {t(`difficulties.${d}`)}
              </button>
            ))}
          </div>

          {/* Pack Count */}
          {!isLoading && (
            <p className="text-[11px] text-text-tertiary">
              {visiblePacks.length} pack{visiblePacks.length !== 1 && "s"}
            </p>
          )}

          {/* Scrollable List */}
          <div className="flex-1 -mx-1 overflow-y-auto px-1 space-y-2">
            {isLoading && (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-lg bg-bg-elevated animate-pulse" />
                ))}
              </div>
            )}

            {isError && (
              <div className="rounded-lg border border-accent-danger/20 bg-accent-danger-subtle p-3 text-sm text-accent-danger">
                Error al cargar los packs.
                <button type="button" onClick={() => refetch()} className="ml-2 underline">
                  Reintentar
                </button>
              </div>
            )}

            {!isLoading && !isError && visiblePacks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Search size={32} className="mb-2 text-text-tertiary" />
                <p className="text-sm text-text-muted">{t("page.noResults")}</p>
              </div>
            )}

            {!isLoading &&
              visiblePacks.map((pack) => (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => setSelectedPackId(pack.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-all duration-200 ${
                    selectedPackId === pack.id
                      ? "border-accent-primary bg-accent-primary-muted shadow-[var(--shadow-glow-blue)]"
                      : "border-border-subtle bg-bg-panel hover:border-border-highlight hover:bg-bg-hover"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                        pack.difficulty === "beginner"
                          ? "bg-accent-success-subtle text-accent-success"
                          : pack.difficulty === "intermediate"
                          ? "bg-accent-info-subtle text-accent-info"
                          : pack.difficulty === "advanced"
                          ? "bg-accent-warning-subtle text-accent-warning"
                          : "bg-accent-danger-subtle text-accent-danger"
                      }`}
                    >
                      {t(`difficulties.${pack.difficulty}`).slice(0, 3)}
                    </span>
                    <span className="truncate text-sm font-semibold text-text-primary">
                      {pack.name}
                    </span>
                    {favorites.has(pack.id) && (
                      <Star size={10} className="ml-auto shrink-0 text-yellow-400 fill-yellow-400" />
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[10px] text-text-muted">{pack.creator}</span>
                    <span className="h-3 w-px bg-border-subtle" />
                    <span className="text-[10px] font-mono text-text-tertiary">{pack.code}</span>
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* RIGHT PANEL: Detail */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {selectedPack ? (
            <TrainingPackDetail
              pack={selectedPack}
              isFavorite={isFavorite(selectedPack.id)}
              onToggleFavorite={() => handleToggleFavorite(selectedPack.id)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-xl border border-border-subtle bg-bg-surface/50 p-8 text-center">
              <Target size={48} className="mb-4 text-text-tertiary" />
              <h3 className="font-display text-xl font-bold text-text-secondary">
                {t("page.searchPlaceholder")}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-text-muted">
                Seleccioná un pack de entrenamiento para ver los detalles y copiar el código rápidamente.
              </p>

              {featuredPacks.length > 0 && (
                <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-3">
                  {featuredPacks.slice(0, 4).map((pack) => (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => setSelectedPackId(pack.id)}
                      className="rounded-lg border border-border-subtle bg-bg-panel p-3 text-left transition-all hover:border-border-highlight hover:bg-bg-hover"
                    >
                      <p className="truncate text-xs font-semibold text-text-primary">{pack.name}</p>
                      <p className="mt-0.5 text-[10px] text-text-muted">{pack.creator}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AddPackModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddSave}
      />
    </PageContainer>
  );
}
