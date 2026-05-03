import { useParams, useNavigate } from "react-router-dom";
import { useMatchDetail } from "@/hooks/useMatchDetail";
import { MatchHeader } from "@/components/match-detail/MatchHeader";
import { MatchInfoPanel } from "@/components/match-detail/MatchInfoPanel";
import { TeamRoster } from "@/components/match-detail/TeamRoster";
import { ScoreTimeline } from "@/components/match-detail/ScoreTimeline";
import { PlayerStatsTable } from "@/components/match-detail/PlayerStatsTable";
import { GoalDetail } from "@/components/match-detail/GoalDetail";
import { PageContainer } from "@/components/layout/PageContainer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Gamepad2, ArrowLeft } from "lucide-react";

export function MatchDetailPage() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const id = Number(matchId);
  const { data, isLoading, isError } = useMatchDetail(id);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="mb-4">
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="mb-6 h-48 w-full" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="mt-6">
          <Skeleton className="h-56 w-full" />
        </div>
      </PageContainer>
    );
  }

  if (isError || !data) {
    return (
      <PageContainer>
        <EmptyState
          icon={Gamepad2}
          title="Partida no encontrada"
          description="No se pudieron cargar los detalles de esta partida."
          actionLabel="Volver al historial"
          onAction={() => navigate("/history")}
        />
      </PageContainer>
    );
  }

  if (data.players.length === 0 && data.events.length === 0) {
    return (
      <PageContainer>
        <Button
          variant="ghost"
          leftIcon={ArrowLeft}
          onClick={() => navigate("/history")}
          className="mb-4"
        >
          Volver al historial
        </Button>
        <EmptyState
          icon={Gamepad2}
          title="Sin datos de partida"
          description="Esta partida no contiene datos de jugadores ni eventos."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          leftIcon={ArrowLeft}
          onClick={() => navigate("/history")}
        >
          Volver al historial
        </Button>
      </div>

      {/* Fila 1: Header */}
      <div className="mt-4">
        <MatchHeader match={data} />
      </div>

      {/* Fila 2: Grid de 2 columnas en desktop */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Izquierda */}
        <div className="space-y-6">
          <MatchInfoPanel match={data} />
          <TeamRoster
            players={data.players}
            teamNum={0}
            teamName="Equipo Azul"
            teamColorClass="blue"
          />
        </div>

        {/* Derecha */}
        <div className="space-y-6">
          <TeamRoster
            players={data.players}
            teamNum={1}
            teamName="Equipo Naranja"
            teamColorClass="orange"
          />
        </div>
      </div>

      {/* Fila 3: Timeline */}
      <div className="mt-6">
        <ScoreTimeline
          events={data.events}
          team0Name="Azul"
          team1Name="Naranja"
        />
      </div>

      {/* Fila 4: Player Stats */}
      <div className="mt-6">
        <PlayerStatsTable players={data.players} />
      </div>

      {/* Fila 5: Goals */}
      <div className="mt-6">
        <GoalDetail goals={data.goals} />
      </div>
    </PageContainer>
  );
}
