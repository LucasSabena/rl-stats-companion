import { memo } from "react";
import { cn, formatDateTime, formatDuration } from "@/lib/utils";
import { Globe, Monitor, Clock, Calendar, MapPin, Trophy } from "lucide-react";
import { getArenaDisplayName } from "@/lib/arenaMap";
import type { MatchDetail, MatchType } from "@/lib/types";

interface MatchInfoPanelProps {
  match: MatchDetail;
}

const MATCH_TYPE_LABELS: Record<MatchType, string> = {
  ranked: "Ranked",
  casual: "Casual",
  tournament: "Torneo",
  training: "Entrenamiento",
  other: "Otro",
};

export const MatchInfoPanel = memo(function MatchInfoPanel({ match }: MatchInfoPanelProps) {
  const hasLocalTeam = match.localTeamNum !== null && match.localTeamNum !== undefined;
  const isWin = hasLocalTeam && match.winnerTeamNum === match.localTeamNum;
  const isLoss = hasLocalTeam && match.winnerTeamNum !== null && match.winnerTeamNum !== match.localTeamNum;

  const resultLabel = isWin
    ? "Victoria"
    : isLoss
    ? "Derrota"
    : match.winnerTeamNum === 0
    ? "Gano Azul"
    : match.winnerTeamNum === 1
    ? "Gano Naranja"
    : "Empate";
  const resultColor = isWin
    ? "text-accent-success"
    : isLoss
    ? "text-accent-danger"
    : "text-text-secondary";

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-5 shadow-level-1">
      <h3 className="font-display mb-4 flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Trophy size={16} className="text-accent-warning" />
        Informacion de la partida
      </h3>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <InfoItem label="Resultado" value={resultLabel} valueClassName={resultColor} />
        <InfoItem
          label="Tipo"
          value={match.matchType ? MATCH_TYPE_LABELS[match.matchType] : "---"}
        />
        <InfoItem label="Playlist" value={match.playlist ?? "---"} />
        <InfoItem
          label="Modo"
          value={match.isOnline ? "Online" : "Local"}
          icon={match.isOnline ? <Globe size={12} /> : <Monitor size={12} />}
        />
        <InfoItem label="Arena" value={getArenaDisplayName(match.arena)} icon={<MapPin size={12} />} />
        <InfoItem
          label="Duracion"
          value={match.durationSeconds ? formatDuration(match.durationSeconds) : "---"}
          icon={<Clock size={12} />}
        />
        <InfoItem label="Prorroga" value={match.isOvertime ? "Si" : "No"} />
        <InfoItem
          label="Goles totales"
          value={`${match.teamBlueScore} - ${match.teamOrangeScore}`}
        />
        <InfoItem
          label="Fecha"
          value={formatDateTime(match.startTime * 1000)}
          icon={<Calendar size={12} />}
        />
      </div>
    </div>
  );
});

function InfoItem({
  label,
  value,
  icon,
  valueClassName,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-lg bg-bg-panel/80 p-3">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
        {icon}
        {label}
      </p>
      <p className={cn("mt-1 text-sm font-medium text-text-primary", valueClassName)}>{value}</p>
    </div>
  );
}
