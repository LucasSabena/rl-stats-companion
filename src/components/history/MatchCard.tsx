import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { formatDateTime, formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ContextMenu } from "@/components/ui/ContextMenu";
import type { MatchSummary } from "@/lib/types";
import { Eye, Pencil, Trash2, Clock, MapPin } from "lucide-react";
import { getArenaDisplayName, getArenaImagePath } from "@/lib/arenaMap";

interface MatchCardProps {
  match: MatchSummary;
  onClick?: () => void;
  onEdit?: (match: MatchSummary) => void;
  onDelete?: (matchId: number) => void;
}

export const MatchCard = memo(function MatchCard({ match, onClick, onEdit, onDelete }: MatchCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation(["history", "common"]);

  const matchTypeLabel: Record<string, string> = {
    ranked: t("history:matchTypes.ranked"),
    casual: t("history:matchTypes.casual"),
    tournament: t("history:matchTypes.tournament"),
    other: t("history:matchTypes.other"),
  };

  const playlistLabelMap: Record<string, string> = {
    Duel: t("history:playlists.duel"),
    Doubles: t("history:playlists.doubles"),
    Standard: t("history:playlists.standard"),
    Chaos: t("history:playlists.chaos"),
    Other: t("history:playlists.other"),
  };

  const blueWon = match.winnerTeamNum === 0;
  const orangeWon = match.winnerTeamNum === 1;
  const hasLocalTeam = match.localTeamNum !== null && match.localTeamNum !== undefined;
  const isWin = hasLocalTeam && match.winnerTeamNum === match.localTeamNum;
  const isLoss = hasLocalTeam && match.winnerTeamNum !== null && match.winnerTeamNum !== match.localTeamNum;

  const resultLabel = isWin
    ? t("history:results.win")
    : isLoss
    ? t("history:results.loss")
    : match.winnerTeamNum === 0
    ? t("history:results.blueWon")
    : match.winnerTeamNum === 1
    ? t("history:results.orangeWon")
    : t("history:results.draw");

  const resultVariant = isWin ? "win" : isLoss ? "loss" : "default";

  const arenaName = match.arena ? getArenaDisplayName(match.arena) : null;
  const arenaImage = match.arena ? getArenaImagePath(match.arena) : null;

  function handleClick() {
    if (onClick) onClick();
    else navigate(`/history/${match.id}`);
  }

  return (
    <ContextMenu
      items={[
        {
          label: t("history:contextMenu.viewDetail"),
          icon: Eye,
          onClick: () => navigate(`/history/${match.id}`),
        },
        {
          label: t("history:contextMenu.editMatch"),
          icon: Pencil,
          onClick: () => onEdit?.(match),
        },
        {
          label: t("history:contextMenu.deleteMatch"),
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
          "group relative cursor-pointer rounded-xl border border-border-default shadow-[var(--shadow-card-inner)] overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "hover:-translate-y-1 hover:border-border-highlight hover:shadow-level-3",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
        )}
      >
        {/* Arena background image on hover */}
        {arenaImage && (
          <img
            src={arenaImage}
            alt={arenaName ?? ""}
            className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        )}

        {/* Dark overlay on hover when image shows */}
        <div
          className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
            arenaImage ? "bg-gradient-to-r from-bg-surface/90 via-bg-surface/80 to-bg-surface/90" : ""
          )}
        />

        {/* Subtle background glow based on win/loss/neutral */}
        <div className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none",
          isWin ? "group-hover:opacity-100 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.05)_0%,transparent_70%)]"
                : isLoss ? "group-hover:opacity-100 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.05)_0%,transparent_70%)]"
                : "group-hover:opacity-100 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.02)_0%,transparent_70%)]"
        )} />

        {/* Content grid */}
        <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-4">
          {/* Left column: thumbnail + date/badges/playlist */}
          <div className="flex items-center gap-3 min-w-0">
            {arenaImage && (
              <img
                src={arenaImage}
                alt={arenaName ?? ""}
                className="h-14 w-14 rounded-lg object-cover border border-border-subtle bg-bg-panel shrink-0 hidden sm:block"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-tertiary font-medium">
                  {formatDateTime(match.startTime * 1000)}
                </span>
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full shrink-0 shadow-[0_0_8px_currentColor]",
                    match.isOnline ? "bg-accent-secondary text-accent-secondary" : "bg-text-muted text-text-muted"
                  )}
                  title={match.isOnline ? t("history:onlineStatus.online") : t("history:onlineStatus.local")}
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
                <span className="text-[11px] text-text-secondary font-medium tracking-wide uppercase truncate">
                  {playlistLabelMap[match.playlist] ?? match.playlist}
                </span>
              )}
            </div>
          </div>

          {/* Center: Score with win highlight */}
          <div className="flex items-center gap-4 px-4">
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
          <div className="flex min-w-0 flex-col items-end gap-2">
            <Badge variant={resultVariant} glow={isWin}>{resultLabel}</Badge>
            {match.durationSeconds && (
              <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                <Clock size={12} className="text-text-muted" />
                <span className="text-xs text-text-secondary font-mono tracking-tight">
                  {formatDuration(match.durationSeconds)}
                </span>
              </div>
            )}
            {arenaName && (
              <div className="flex items-center gap-1.5 max-w-[10rem] opacity-80 group-hover:opacity-100 transition-opacity">
                <img
                  src={arenaImage ?? ""}
                  alt={arenaName}
                  className="h-4 w-4 rounded object-cover border border-border-subtle bg-bg-panel shrink-0"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
                <MapPin size={12} className="text-text-muted shrink-0" />
                <span className="text-[11px] text-text-muted truncate" title={arenaName}>
                  {arenaName}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </ContextMenu>
  );
});