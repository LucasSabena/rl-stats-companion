import { memo } from "react";
import { cn } from "@/lib/utils";
import { formatDateTime, formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Globe, Monitor, Swords } from "lucide-react";
import type { MatchDetail, MatchType } from "@/lib/types";

interface MatchHeaderProps {
  match: MatchDetail;
}

const MATCH_TYPE_LABELS: Record<MatchType, string> = {
  ranked: "Ranked",
  casual: "Casual",
  tournament: "Torneo",
  other: "Otro",
};

const MATCH_TYPE_VARIANTS: Record<MatchType, "ranked" | "default"> = {
  ranked: "ranked",
  casual: "default",
  tournament: "default",
  other: "default",
};

export const MatchHeader = memo(function MatchHeader({ match }: MatchHeaderProps) {
  const isDraw = match.winnerTeamNum === null;

  const blueWon = match.winnerTeamNum === 0;
  const orangeWon = match.winnerTeamNum === 1;

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-6 shadow-level-2">
      {/* Top row: type, playlist, online/local, arena */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {match.matchType && (
            <Badge variant={MATCH_TYPE_VARIANTS[match.matchType]}>
              {MATCH_TYPE_LABELS[match.matchType]}
            </Badge>
          )}
          {match.playlist && (
            <span className="text-xs text-text-secondary">{match.playlist}</span>
          )}
          <Badge
            className={cn(
              match.isOnline
                ? "bg-accent-secondary/20 text-accent-secondary"
                : "bg-bg-tertiary text-text-muted"
            )}
          >
            {match.isOnline ? (
              <Globe size={12} className="mr-1" />
            ) : (
              <Monitor size={12} className="mr-1" />
            )}
            {match.isOnline ? "Online" : "Local"}
          </Badge>
        </div>

        {match.arena && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-text-secondary">
            <Swords size={14} className="text-text-tertiary" />
            {match.arena}
          </span>
        )}
      </div>

      {/* Score */}
      <div className="mt-6 flex items-center justify-center gap-6 sm:gap-10">
        <div className="flex flex-col items-center">
          <div
            className={cn(
              "h-5 w-5 rounded-full shadow-level-1",
              blueWon ? "bg-team-blue ring-2 ring-team-blue/30" : "bg-team-blue/70"
            )}
          />
          <span className="mt-2 text-xs font-bold uppercase tracking-widest text-team-blue">
            Azul
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <span
            className={cn(
              "font-mono text-6xl font-extrabold tracking-tight drop-shadow-sm transition-all sm:text-7xl",
              blueWon ? "text-team-blue" : isDraw ? "text-text-primary" : "text-text-tertiary"
            )}
          >
            {match.teamBlueScore}
          </span>
          <span className="text-3xl font-bold text-text-tertiary">—</span>
          <span
            className={cn(
              "font-mono text-6xl font-extrabold tracking-tight drop-shadow-sm transition-all sm:text-7xl",
              orangeWon ? "text-team-orange" : isDraw ? "text-text-primary" : "text-text-tertiary"
            )}
          >
            {match.teamOrangeScore}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <div
            className={cn(
              "h-5 w-5 rounded-full shadow-level-1",
              orangeWon ? "bg-team-orange ring-2 ring-team-orange/30" : "bg-team-orange/70"
            )}
          />
          <span className="mt-2 text-xs font-bold uppercase tracking-widest text-team-orange">
            Naranja
          </span>
        </div>
      </div>

      {/* Metadata grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-lg bg-bg-tertiary p-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            Duración
          </p>
          <p className="mt-0.5 text-sm font-medium text-text-primary">
            {match.durationSeconds ? formatDuration(match.durationSeconds) : "—"}
          </p>
        </div>
        <div className="rounded-lg bg-bg-tertiary p-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            Inicio
          </p>
          <p className="mt-0.5 text-sm font-medium text-text-primary">
            {formatDateTime(match.startTime * 1000)}
          </p>
        </div>
        {match.endTime && (
          <div className="rounded-lg bg-bg-tertiary p-3 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
              Fin
            </p>
            <p className="mt-0.5 text-sm font-medium text-text-primary">
              {formatDateTime(match.endTime * 1000)}
            </p>
          </div>
        )}
        <div className="rounded-lg bg-bg-tertiary p-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            Prórroga
          </p>
          <p className="mt-0.5 text-sm font-medium text-text-primary">
            {match.isOvertime ? "Sí" : "No"}
          </p>
        </div>
        <div className="rounded-lg bg-bg-tertiary p-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            Arena
          </p>
          <p className="mt-0.5 text-sm font-medium text-text-primary">
            {match.arena ?? "—"}
          </p>
        </div>
      </div>
    </div>
  );
});
