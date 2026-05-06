import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMatchHistory } from "@/hooks/useMatchHistory";
import { useDeleteMatch } from "@/hooks/useDeleteMatch";
import { useUpdateMatch } from "@/hooks/useUpdateMatch";
import { MatchList } from "@/components/history/MatchList";
import { FilterBar } from "@/components/history/FilterBar";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { MatchFilters, MatchSummary } from "@/lib/types";
import { Gamepad2 } from "lucide-react";

function filtersToParams(filters: MatchFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.result) params.set("result", filters.result);
  if (filters.matchType) params.set("type", filters.matchType);
  if (filters.mode) params.set("mode", filters.mode);
  if (filters.dateFrom) params.set("from", String(filters.dateFrom));
  if (filters.dateTo) params.set("to", String(filters.dateTo));
  return params;
}

function paramsToFilters(params: URLSearchParams): MatchFilters {
  const filters: MatchFilters = {};
  const search = params.get("search");
  const result = params.get("result") as "win" | "loss" | null;
  const type = params.get("type");
  const mode = params.get("mode");
  const from = params.get("from");
  const to = params.get("to");

  if (search) filters.search = search;
  if (result === "win" || result === "loss") filters.result = result;
  if (type) filters.matchType = type as MatchFilters["matchType"];
  if (mode) filters.mode = mode;
  if (from) filters.dateFrom = Number(from);
  if (to) filters.dateTo = Number(to);

  return filters;
}

export function HistoryPage() {
  const { t } = useTranslation(["history", "common"]);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilters = paramsToFilters(searchParams);
  const [filters, setFilters] = useState<MatchFilters>(initialFilters);

  const { data, isLoading, isError } = useMatchHistory(filters);

  const [editingMatch, setEditingMatch] = useState<MatchSummary | null>(null);
  const [deletingMatchId, setDeletingMatchId] = useState<number | null>(null);

  const [editMatchType, setEditMatchType] = useState<string>("");
  const [editPlaylist, setEditPlaylist] = useState<string>("");

  const deleteMutation = useDeleteMatch();
  const updateMutation = useUpdateMatch();

  const matchTypeOptions: { value: string; label: string }[] = [
    { value: "ranked", label: t("history:matchTypes.ranked") },
    { value: "casual", label: t("history:matchTypes.casual") },
    { value: "tournament", label: t("history:matchTypes.tournament") },
    { value: "other", label: t("history:matchTypes.other") },
  ];

  const playlistOptions: { value: string; label: string }[] = [
    { value: "Duel", label: t("history:playlists.duel") },
    { value: "Doubles", label: t("history:playlists.doubles") },
    { value: "Standard", label: t("history:playlists.standard") },
    { value: "Chaos", label: t("history:playlists.chaos") },
    { value: "Other", label: t("history:playlists.other") },
  ];

  const handleFiltersChange = useCallback(
    (newFilters: MatchFilters) => {
      setFilters(newFilters);
      const newParams = filtersToParams(newFilters);
      setSearchParams(newParams, { replace: true });
    },
    [setSearchParams]
  );

  useEffect(() => {
    if (editingMatch) {
      setEditMatchType(editingMatch.matchType ?? "");
      setEditPlaylist(editingMatch.playlist ?? "");
    }
  }, [editingMatch]);

  const handleDelete = (matchId: number) => setDeletingMatchId(matchId);

  const confirmDelete = () => {
    if (deletingMatchId) {
      deleteMutation.mutate(deletingMatchId);
      setDeletingMatchId(null);
    }
  };

  const handleEdit = (match: MatchSummary) => setEditingMatch(match);

  const saveEdit = (data: { matchType: string | null; playlist: string | null }) => {
    if (editingMatch) {
      updateMutation.mutate({ matchId: editingMatch.id, data });
      setEditingMatch(null);
    }
  };

  const selectBaseClasses =
    "h-10 w-full rounded-md border bg-bg-surface px-3 text-sm text-text-primary border-border-subtle focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/50";

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary">{t("history:pageTitle")}</h2>
      </div>

      <FilterBar filters={filters} onChange={handleFiltersChange} />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          icon={Gamepad2}
          title={t("history:errors.loadFailed.title")}
          description={t("history:errors.loadFailed.description")}
        />
      )}

      {!isLoading && !isError && (!data || data.length === 0) && (
        <EmptyState
          icon={Gamepad2}
          title={t("history:empty.noMatches.title")}
          description={t("history:empty.noMatches.description")}
        />
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <MatchList
          matches={data}
          onEditMatch={handleEdit}
          onDeleteMatch={handleDelete}
        />
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deletingMatchId !== null}
        onClose={() => setDeletingMatchId(null)}
        title={t("history:modals.delete.title")}
        description={t("history:modals.delete.description")}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeletingMatchId(null)}>
              {t("common:buttons.cancel")}
            </Button>
            <Button variant="danger" onClick={confirmDelete} isLoading={deleteMutation.isPending}>
              {t("common:buttons.delete")}
            </Button>
          </div>
        }
      >
        <></>
      </Modal>

      {/* Edit modal */}
      <Modal
        isOpen={editingMatch !== null}
        onClose={() => setEditingMatch(null)}
        title={t("history:modals.edit.title")}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditingMatch(null)}>
              {t("common:buttons.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                saveEdit({
                  matchType: editMatchType || null,
                  playlist: editPlaylist || null,
                })
              }
              isLoading={updateMutation.isPending}
            >
              {t("common:buttons.save")}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">{t("history:modals.edit.matchTypeLabel")}</label>
            <select
              value={editMatchType}
              onChange={(e) => setEditMatchType(e.target.value)}
              className={selectBaseClasses}
            >
              <option value="">—</option>
              {matchTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">{t("history:modals.edit.playlistLabel")}</label>
            <select
              value={editPlaylist}
              onChange={(e) => setEditPlaylist(e.target.value)}
              className={selectBaseClasses}
            >
              <option value="">—</option>
              {playlistOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}