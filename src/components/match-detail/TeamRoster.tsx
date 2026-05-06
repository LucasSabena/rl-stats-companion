import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Crown, Users } from "lucide-react";
import type { PlayerStats } from "@/lib/types";

interface TeamRosterProps {
  players: PlayerStats[];
  teamNum: 0 | 1;
  teamName: string;
  teamColorClass: "blue" | "orange";
}

function getInitials(name: string): string {
  return name
    .split(/[\s_]+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function detectParty(players: PlayerStats[], current: PlayerStats): boolean {
  const prefixes = players.map((p) => {
    const idx = Math.max(p.name.indexOf(" "), p.name.indexOf("_"), p.name.indexOf("|"));
    return idx > 0 ? p.name.slice(0, idx).toLowerCase() : "";
  });
  const currentPrefix = prefixes.find((_, i) => players[i].id === current.id) ?? "";
  if (currentPrefix && prefixes.filter((p) => p === currentPrefix).length > 1) return true;

  const teamScores = players.filter((p) => p.team === current.team).map((p) => p.score);
  const maxTeamScore = teamScores.length ? Math.max(...teamScores) : 0;
  if (current.score === maxTeamScore && current.score > 100) return true;

  return false;
}

export const TeamRoster = memo(function TeamRoster({
  players,
  teamNum,
  teamName,
  teamColorClass,
}: TeamRosterProps) {
  const { t } = useTranslation("matchDetail");
  const teamPlayers = useMemo(
    () => players.filter((p) => p.team === teamNum),
    [players, teamNum]
  );

  const isBlue = teamColorClass === "blue";
  const colorText = isBlue ? "text-team-blue" : "text-team-orange";
  const colorBg = isBlue ? "bg-team-blue" : "bg-team-orange";
  const colorBgSoft = isBlue ? "bg-team-blue-bg" : "bg-team-orange-bg";

  if (teamPlayers.length === 0) return null;

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface p-5 shadow-level-1">
      <div className="mb-4 flex items-center gap-2">
        <div className={cn("h-3 w-3 rounded-full", colorBg)} />
        <h3 className={cn("font-display text-sm font-bold uppercase tracking-wider", colorText)}>
          {teamName}
        </h3>
        <span className="ml-auto text-xs text-text-tertiary">
          {t("roster.playerCount", { count: teamPlayers.length })}
        </span>
      </div>

      <div className="space-y-2">
        {teamPlayers.map((player) => {
          const isParty = detectParty(players, player);
          return (
            <div
              key={player.id}
              className="flex items-center gap-3 rounded-lg bg-bg-panel/80 p-3 transition-colors hover:bg-surface-hover/80"
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                  colorBgSoft,
                  colorText
                )}
              >
                {getInitials(player.name)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-text-primary">
                    {player.name}
                  </span>
                  {player.mvp && (
                    <Crown size={12} className="shrink-0 text-accent-warning" />
                  )}
                  {isParty && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent-purple-subtle border border-accent-purple/20 px-1.5 py-0.5 text-[10px] font-semibold text-accent-purple">
                      <Users size={10} />
                      Party
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-text-secondary">
                  <Stat value={player.score} label={t("roster.pts")} />
                  <Stat value={player.goals} label={t("roster.gol")} />
                  <Stat value={player.assists} label={t("roster.ast")} />
                  <Stat value={player.saves} label={t("roster.par")} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <span>
      <span className="font-semibold text-text-primary">{value}</span>{" "}
      <span className="text-text-tertiary">{label}</span>
    </span>
  );
}