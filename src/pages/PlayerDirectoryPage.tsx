import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerDirectory } from "@/hooks/usePlayerDirectory";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { ArrowRight, Shield, Swords, Search, Users } from "lucide-react";

export function PlayerDirectoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [relationship, setRelationship] = useState("");
  const [sortBy, setSortBy] = useState("matches");

  const { data: players, isLoading } = usePlayerDirectory({
    search: search || undefined,
    relationship: relationship || undefined,
    sortBy,
  });

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    []
  );

  return (
    <PageContainer>
      <h2 className="text-2xl font-bold text-text-primary">Directorio de Jugadores</h2>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            Buscar
          </label>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
            />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Nombre o ID..."
              className="w-full rounded-md border border-border-subtle bg-bg-base py-2 pl-10 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none"
            />
          </div>
        </div>

        <Select
          value={relationship}
          onChange={setRelationship}
          options={[
            { value: "", label: "Todos" },
            { value: "teammate", label: "Compañeros" },
            { value: "opponent", label: "Rivales" },
          ]}
        />

        <Select
          value={sortBy}
          onChange={setSortBy}
          options={[
            { value: "matches", label: "Más partidas" },
            { value: "recent", label: "Más reciente" },
            { value: "wins_together", label: "Más wins juntos" },
            { value: "wins_against", label: "Más wins contra" },
          ]}
        />
      </div>

      {/* List */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && players && players.length === 0 && (
        <EmptyState
          icon={Users}
          title="Sin jugadores registrados"
          description="Jugá algunas partidas para empezar a construir tu directorio."
        />
      )}

      {players && players.length > 0 && (
        <div className="space-y-2">
          {players.map((p) => (
            <Card
              key={p.player_id}
              className="cursor-pointer transition-all hover:shadow-level-2 hover:-translate-y-0.5"
              onClick={() => navigate(`/players/${p.player_id}`)}
            >
              <div className="flex items-center gap-4 p-4">
                {/* Name + badge */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-base font-semibold text-text-primary">
                      {p.name}
                    </p>
                    {p.matches_as_teammate === 0 && (
                      <span className="shrink-0 rounded-full bg-accent-danger/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-danger">
                        Solo rival
                      </span>
                    )}
                    {p.matches_as_opponent === 0 && (
                      <span className="shrink-0 rounded-full bg-accent-success/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-success">
                        Solo compañero
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-text-tertiary">
                    {p.total_matches} partida{p.total_matches !== 1 ? "s" : ""}
                    {" · "}
                    {p.matches_as_teammate} compa · {p.matches_as_opponent} rival
                    {" · "}
                    Primera vez:{" "}
                    {new Date(p.first_seen).toLocaleDateString("es-AR", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Stats columns */}
                <div className="hidden flex-col items-center gap-0.5 sm:flex">
                  <Shield size={13} className="text-accent-secondary/70" />
                  <span className="text-xs text-text-secondary">
                    {p.wins_together}-{p.losses_together}
                  </span>
                  <span className="text-[10px] text-text-tertiary">juntos</span>
                </div>
                <div className="hidden flex-col items-center gap-0.5 sm:flex">
                  <Swords size={13} className="text-accent-danger/70" />
                  <span className="text-xs text-text-secondary">
                    {p.wins_against}-{p.losses_against}
                  </span>
                  <span className="text-[10px] text-text-tertiary">vs</span>
                </div>

                <ArrowRight size={16} className="text-text-tertiary" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
