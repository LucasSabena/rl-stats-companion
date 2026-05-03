import { useState, useEffect } from "react";
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

const matchTypeOptions: { value: string; label: string }[] = [
  { value: "ranked", label: "Ranked" },
  { value: "casual", label: "Casual" },
  { value: "tournament", label: "Torneo" },
  { value: "other", label: "Otro" },
];

const playlistOptions: { value: string; label: string }[] = [
  { value: "Duel", label: "Duel (1v1)" },
  { value: "Doubles", label: "Doubles (2v2)" },
  { value: "Standard", label: "Standard (3v3)" },
  { value: "Chaos", label: "Chaos (4v4)" },
  { value: "Other", label: "Otro" },
];

export function HistoryPage() {
  const [filters, setFilters] = useState<MatchFilters>({});
  const { data, isLoading, isError } = useMatchHistory(filters);

  const [editingMatch, setEditingMatch] = useState<MatchSummary | null>(null);
  const [deletingMatchId, setDeletingMatchId] = useState<number | null>(null);

  const [editMatchType, setEditMatchType] = useState<string>("");
  const [editPlaylist, setEditPlaylist] = useState<string>("");

  const deleteMutation = useDeleteMatch();
  const updateMutation = useUpdateMatch();

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
    "h-10 w-full rounded-md border bg-bg-secondary px-3 text-sm text-text-primary border-border-subtle focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/50";

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary">Historial de partidas</h2>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

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
          title="Error cargando historial"
          description="No se pudieron cargar las partidas. Intenta de nuevo."
        />
      )}

      {!isLoading && !isError && (!data || data.length === 0) && (
        <EmptyState
          icon={Gamepad2}
          title="Sin partidas capturadas"
          description="Inicia Rocket League, habilita la Stats API y juega una partida. Capturaremos los datos automáticamente."
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
        title="¿Borrar partida?"
        description="Esta acción no se puede deshacer."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeletingMatchId(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDelete} isLoading={deleteMutation.isPending}>
              Borrar
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
        title="Editar partida"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditingMatch(null)}>
              Cancelar
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
              Guardar
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">Tipo de partida</label>
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
            <label className="mb-1 block text-sm font-medium text-text-secondary">Playlist</label>
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
