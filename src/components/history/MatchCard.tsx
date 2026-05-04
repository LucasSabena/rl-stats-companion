import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { formatDateTime, formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ContextMenu } from "@/components/ui/ContextMenu";
import type { MatchSummary } from "@/lib/types";
import { Eye, Pencil, Trash2, Clock, MapPin } from "lucide-react";

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
          "group grid cursor-pointer items-center gap-4 rounded-xl border border-border-subtle bg-bg-tertiary p-4 transition-all duration-200",
          "hover:-translate-y-0.5 hover:border-border-strong hover:shadow-level-3",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
          "grid-cols-[1fr_auto_1fr]"
        )}
      >
        {/* Left column: date, badges, mode */}
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary font-medium">
              {formatDateTime(match.startTime * 1000)}
            </span>
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full shrink-0",
                match.isOnline ? "bg-accent-secondary" : "bg-text-muted"
              )}
              title={match.isOnline ? "En línea" : "Local"}
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {match.matchType && (
              <Badge
                variant={match.matchType === "ranked" ? "ranked" : "default"}
                className="text-[10px]"
              >
                {matchTypeLabel[match.matchType] ?? match.matchType}
              </Badge>
            )}
            {match.isOvertime && (
              <Badge variant="overtime" className="text-[10px]">OT</Badge>
            )}
          </div>
          {match.playlist && (
            <span className="text-[11px] text-text-secondary font-medium">
              {playlistLabelMap[match.playlist] ?? match.playlist}
            </span>
          )}
        </div>

        {/* Center: Score with win highlight */}
        <div className="flex items-center gap-3 px-4">
          <div className="flex flex-col items-center">
            <div className={cn(
              "h-2.5 w-2.5 rounded-full mb-1",
              blueWon ? "bg-team-blue ring-2 ring-team-blue/20" : "bg-team-blue/50"
            )} />
            <span
              className={cn(
                "font-mono text-2xl font-bold tabular-nums leading-none",
                blueWon ? "text-team-blue" : "text-text-secondary"
              )}
            >
              {match.teamBlueScore}
            </span>
          </div>
          <span className="text-text-tertiary font-medium text-lg">–</span>
          <div className="flex flex-col items-center">
            <div className={cn(
              "h-2.5 w-2.5 rounded-full mb-1",
              orangeWon ? "bg-team-orange ring-2 ring-team-orange/20" : "bg-team-orange/50"
            )} />
            <span
              className={cn(
                "font-mono text-2xl font-bold tabular-nums leading-none",
                orangeWon ? "text-team-orange" : "text-text-secondary"
              )}
            >
              {match.teamOrangeScore}
            </span>
          </div>
        </div>

        {/* Right column: result, duration, arena */}
        <div className="flex min-w-0 flex-col items-end gap-1.5">
          <Badge variant={resultVariant}>{resultLabel}</Badge>
          {match.durationSeconds && (
            <div className="flex items-center gap-1">
              <Clock size={11} className="text-text-muted" />
              <span className="text-xs text-text-tertiary font-mono">
                {formatDuration(match.durationSeconds)}
              </span>
            </div>
          )}
          {match.arena && (
            <div className="flex items-center gap-1 max-w-[10rem]">
              <MapPin size={11} className="text-text-muted shrink-0" />
              <span className="text-[10px] text-text-muted truncate">
                {match.arena}
              </span>
            </div>
          )}
        </div>
      </div>
    </ContextMenu>
  );
});
