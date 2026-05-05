import { useParams, useNavigate } from "react-router-dom";
import { usePlayerDetail } from "@/hooks/usePlayerDirectory";
import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import {
  ArrowLeft,
  Shield,
  Swords,
  Calendar,
  Clock,
  Target,
  Goal,
  HeartHandshake,
  Crosshair,
  Zap,
} from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function pct(a: number, b: number): string {
  if (b === 0) return "0%";
  return Math.round((a / b) * 100) + "%";
}

export function PlayerDetailPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const id = playerId ? parseInt(playerId, 10) : 0;

  const { data: player, isLoading } = usePlayerDetail(id);

  return (
    <PageContainer>
      <h2 className="text-2xl font-bold text-text-primary">Detalle del Jugador</h2>

      <button
        onClick={() => navigate("/players")}
        className="mb-4 flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-accent-primary"
      >
        <ArrowLeft size={16} />
        Volver al directorio
      </button>

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      )}

      {!isLoading && !player && (
        <Card className="p-8 text-center">
          <p className="text-text-secondary">Jugador no encontrado.</p>
        </Card>
      )}

      {player && (
        <>
          {/* Header */}
          <Card className="mb-4 p-5">
            <h1 className="mb-1 text-2xl font-bold text-text-primary">
              {player.name}
            </h1>
            <p className="text-xs text-text-tertiary">
              Jugador #{player.player_id} · {player.primary_id}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="default">
                <Calendar size={12} className="mr-1" />
                {formatDate(player.first_seen)} → {formatDate(player.last_seen)}
              </Badge>
              <Badge variant="default">
                {player.total_matches} partida
                {player.total_matches !== 1 ? "s" : ""} jugadas
              </Badge>
              <Badge variant="success">
                {player.matches_as_teammate} como compañero
              </Badge>
              <Badge variant="danger">
                {player.matches_as_opponent} como rival
              </Badge>
            </div>
          </Card>

          {/* Como compañero */}
          {player.matches_as_teammate > 0 && (
            <>
              <h2 className="mb-3 mt-6 flex items-center gap-2 text-lg font-bold text-text-primary">
                <Shield size={18} className="text-accent-secondary" />
                Como Compañero ({player.matches_as_teammate} partidas)
              </h2>
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  label="Win Rate"
                  value={pct(
                    player.wins_together,
                    player.wins_together + player.losses_together
                  )}
                  icon={Target}
                />
                <StatCard
                  label="W - L"
                  value={`${player.wins_together}-${player.losses_together}`}
                  icon={Swords}
                />
                <StatCard
                  label="Goles totales"
                  value={player.total_goals_together}
                  icon={Goal}
                />
                <StatCard
                  label="Asistencias"
                  value={player.total_assists_together}
                  icon={HeartHandshake}
                />
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  label="Salvadas"
                  value={player.total_saves_together}
                  icon={Shield}
                />
                <StatCard
                  label="Tiros"
                  value={player.total_shots_together}
                  icon={Crosshair}
                />
                <StatCard
                  label="Prom gol/part"
                  value={(
                    player.total_goals_together / player.matches_as_teammate
                  ).toFixed(2)}
                  icon={Zap}
                />
                <StatCard
                  label="Prom asis/part"
                  value={(
                    player.total_assists_together /
                    player.matches_as_teammate
                  ).toFixed(2)}
                  icon={HeartHandshake}
                />
              </div>
            </>
          )}

          {/* Como rival */}
          {player.matches_as_opponent > 0 && (
            <>
              <h2 className="mb-3 mt-6 flex items-center gap-2 text-lg font-bold text-text-primary">
                <Swords size={18} className="text-accent-danger" />
                Como Rival ({player.matches_as_opponent} partidas)
              </h2>
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  label="Win Rate"
                  value={pct(
                    player.wins_against,
                    player.wins_against + player.losses_against
                  )}
                  icon={Target}
                />
                <StatCard
                  label="W - L"
                  value={`${player.wins_against}-${player.losses_against}`}
                  icon={Swords}
                />
                <StatCard
                  label="Goles contra"
                  value={player.total_goals_against}
                  icon={Goal}
                />
                <StatCard
                  label="Asist contra"
                  value={player.total_assists_against}
                  icon={HeartHandshake}
                />
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard
                  label="Salvadas contra"
                  value={player.total_saves_against}
                  icon={Shield}
                />
                <StatCard
                  label="Tiros contra"
                  value={player.total_shots_against}
                  icon={Crosshair}
                />
                <StatCard
                  label="Prom gol/part"
                  value={(
                    player.total_goals_against /
                    player.matches_as_opponent
                  ).toFixed(2)}
                  icon={Zap}
                />
                <StatCard
                  label="Prom asis/part"
                  value={(
                    player.total_assists_against /
                    player.matches_as_opponent
                  ).toFixed(2)}
                  icon={HeartHandshake}
                />
              </div>
            </>
          )}

          {/* Recent matches */}
          {player.recent_matches.length > 0 && (
            <>
              <h2 className="mb-3 mt-6 flex items-center gap-2 text-lg font-bold text-text-primary">
                <Clock size={18} className="text-accent-primary" />
                Últimas partidas
              </h2>
              <div className="space-y-2">
                {player.recent_matches.map((m) => (
                  <Card
                    key={m.match_id}
                    className="cursor-pointer transition-all hover:shadow-level-2 hover:-translate-y-0.5"
                    onClick={() => navigate(`/history/${m.match_id}`)}
                  >
                    <div className="flex items-center gap-4 p-3">
                      <Badge
                        variant={
                          m.relationship === "teammate" ? "success" : "danger"
                        }
                      >
                        {m.relationship === "teammate"
                          ? "Compañero"
                          : "Rival"}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-text-primary">
                          {m.playlist ?? "Partida"} — {m.arena ?? "Arena"}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {formatDateTime(m.start_time)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-secondary">
                        <span>
                          <Goal size={12} className="inline mr-0.5" />
                          {m.goals}
                        </span>
                        <span>
                          <HeartHandshake size={12} className="inline mr-0.5" />
                          {m.assists}
                        </span>
                        <span>
                          <Shield size={12} className="inline mr-0.5" />
                          {m.saves}
                        </span>
                        <span>
                          <Crosshair size={12} className="inline mr-0.5" />
                          {m.shots}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </PageContainer>
  );
}
