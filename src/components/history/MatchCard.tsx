import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { formatDateTime, formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ContextMenu } from "@/components/ui/ContextMenu";
import type { MatchSummary } from "@/lib/types";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface MatchCardProps {
  match: MatchSummary;
  onClick?: () => void;
  onEdit?: (match: MatchSummary) => void;
  onDelete?: (matchId: number) => void;
}

const matchTypeLabel: Record<string, string> = {
  ranked: "Ranked",
  casual: "Casual",
  tournament: "Torneo",
  other: "Otro",
};

const playlistLabelMap: Record<string, string> = {
  Duel: "Duel (1v1)",
  Doubles: "Doubles (2v2)",
  Standard: "Standard (3v3)",
  Chaos: "Chaos (4v4)",
  Other: "Otro",
};

export const MatchCard = memo(function MatchCard({ match, onClick, onEdit, onDelete }: MatchCardProps) {
  const navigate = useNavigate();

  const blueWon = match.winnerTeamNum === 0;
  const orangeWon = match.winnerTeamNum === 1;
  const hasLocalTeam = match.localTeamNum !== null && match.localTeamNum !== undefined;
  const isWin = hasLocalTeam && match.winnerTeamNum === match.localTeamNum;
  const isLoss = hasLocalTeam && match.winnerTeamNum !== null && match.winnerTeamNum !== match.localTeamNum;
  const resultLabel = isWin
    ? "Victoria"
    : isLoss
    ? "Derrota"
    : match.winnerTeamNum === 0
    ? "Ganó Azul"
    : match.winnerTeamNum === 1
    ? "Ganó Naranja"
    : "Empate";
  const resultVariant = isWin ? "win" : isLoss ? "loss" : "default";

  function handleClick() {
    if (onClick) onClick();
    else navigate(`/history/${match.id}`);
  }

  return (
    <ContextMenu
      items={[
        {
          label: "Ver detalle",
          icon: Eye,
          onClick: () => navigate(`/history/${match.id}`),
        },
        {
          label: "Editar partida",
          icon: Pencil,
          onClick: () => onEdit?.(match),
        },
        {
          label: "Borrar partida",
          icon: Trash2,
          variant: "danger",
          onClick: () => onDelete?.(match.id),
        },
      ]}
    >
      <div
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        role="button"
        tabIndex={0}
        className={cn(
          "group flex cursor-pointer items-center gap-4 rounded-xl border border-border-subtle bg-bg-tertiary p-4 transition-all duration-200",
          "hover:-translate-y-1 hover:border-border-strong hover:shadow-level-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
        )}
      >
        {/* Left: Date, type, playlist, online indicator */}
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary">{formatDateTime(match.startTime * 1000)}</span>
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                match.isOnline ? "bg-accent-secondary" : "bg-text-muted"
              )}
              title={match.isOnline ? "En línea" : "Local"}
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {match.matchType && (
              <Badge variant={match.matchType === "ranked" ? "ranked" : "default"} className="text-[10px]">
                {matchTypeLabel[match.matchType] ?? match.matchType}
              </Badge>
            )}
            {match.isOvertime && <Badge variant="overtime" className="text-[10px]">Prórroga</Badge>}
          </div>
          {match.playlist && (
            <span className="text-[11px] text-text-secondary">
              {playlistLabelMap[match.playlist] ?? match.playlist}
            </span>
          )}
        </div>

        {/* Center: Score */}
        <div className="flex flex-1 items-center justify-center gap-3 px-2">
          <span
            className={cn(
              "font-mono text-2xl font-bold tracking-tight",
                blueWon ? "text-team-blue" : "text-text-primary"
            )}
          >
            {match.teamBlueScore}
          </span>
          <div className="h-8 w-px bg-border-subtle" />
          <span
            className={cn(
              "font-mono text-2xl font-bold tracking-tight",
                orangeWon ? "text-team-orange" : "text-text-primary"
            )}
          >
            {match.teamOrangeScore}
          </span>
        </div>

        {/* Right: Result, duration, arena */}
        <div className="flex min-w-0 flex-col items-end gap-1">
          <Badge variant={resultVariant}>{resultLabel}</Badge>
          <span className="text-xs text-text-tertiary">
            {match.durationSeconds ? formatDuration(match.durationSeconds) : "—"}
          </span>
          {match.arena && (
            <span className="max-w-[8rem] truncate text-[10px] text-text-muted">{match.arena}</span>
          )}
        </div>
      </div>
    </ContextMenu>
  );
});
