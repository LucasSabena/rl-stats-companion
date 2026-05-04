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
          "group relative cursor-pointer grid items-center gap-4 rounded-xl border border-border-default bg-bg-surface p-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[var(--shadow-card-inner)] overflow-hidden",
          "hover:-translate-y-1 hover:border-border-highlight hover:shadow-level-3",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary",
          "grid-cols-[1fr_auto_1fr]"
        )}
      >
        {/* Subtle background glow based on win/loss/neutral */}
        <div className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none",
          isWin ? "group-hover:opacity-100 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.05)_0%,transparent_70%)]" 
                : isLoss ? "group-hover:opacity-100 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.05)_0%,transparent_70%)]"
                : "group-hover:opacity-100 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.02)_0%,transparent_70%)]"
        )} />

        {/* Left column: date, badges, mode */}
        <div className="flex min-w-0 flex-col gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary font-medium">
              {formatDateTime(match.startTime * 1000)}
            </span>
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full shrink-0 shadow-[0_0_8px_currentColor]",
                match.isOnline ? "bg-accent-secondary text-accent-secondary" : "bg-text-muted text-text-muted"
              )}
              title={match.isOnline ? "En línea" : "Local"}
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {match.matchType && (
              <Badge
                variant={match.matchType === "ranked" ? "ranked" : "default"}
              >
                {matchTypeLabel[match.matchType] ?? match.matchType}
              </Badge>
            )}
            {match.isOvertime && (
              <Badge variant="overtime">OT</Badge>
            )}
          </div>
          {match.playlist && (
            <span className="text-[11px] text-text-secondary font-medium tracking-wide uppercase">
              {playlistLabelMap[match.playlist] ?? match.playlist}
            </span>
          )}
        </div>

        {/* Center: Score with win highlight */}
        <div className="flex items-center gap-4 px-4 relative z-10">
          <div className="flex flex-col items-center">
            <div className={cn(
              "h-2 w-2 rounded-full mb-1.5 transition-all duration-300",
              blueWon ? "bg-team-blue ring-4 ring-team-blue-bg shadow-[0_0_12px_rgba(59,130,246,0.6)]" : "bg-team-blue/30"
            )} />
            <span
              className={cn(
                "font-display text-3xl font-bold tabular-nums leading-none tracking-tighter",
                blueWon ? "text-team-blue text-shadow-sm" : "text-text-muted"
              )}
            >
              {match.teamBlueScore}
            </span>
          </div>
          <span className="text-border-highlight font-display text-xl pb-1">–</span>
          <div className="flex flex-col items-center">
            <div className={cn(
              "h-2 w-2 rounded-full mb-1.5 transition-all duration-300",
              orangeWon ? "bg-team-orange ring-4 ring-team-orange-bg shadow-[0_0_12px_rgba(249,115,22,0.6)]" : "bg-team-orange/30"
            )} />
            <span
              className={cn(
                "font-display text-3xl font-bold tabular-nums leading-none tracking-tighter",
                orangeWon ? "text-team-orange text-shadow-sm" : "text-text-muted"
              )}
            >
              {match.teamOrangeScore}
            </span>
          </div>
        </div>

        {/* Right column: result, duration, arena */}
        <div className="flex min-w-0 flex-col items-end gap-2 relative z-10">
          <Badge variant={resultVariant} glow={isWin}>{resultLabel}</Badge>
          {match.durationSeconds && (
            <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
              <Clock size={12} className="text-text-muted" />
              <span className="text-xs text-text-secondary font-mono tracking-tight">
                {formatDuration(match.durationSeconds)}
              </span>
            </div>
          )}
          {match.arena && (
            <div className="flex items-center gap-1.5 max-w-[10rem] opacity-80 group-hover:opacity-100 transition-opacity">
              <MapPin size={12} className="text-text-muted shrink-0" />
              <span className="text-[11px] text-text-muted truncate">
                {match.arena}
              </span>
            </div>
          )}
        </div>
      </div>
    </ContextMenu>
  );
});
