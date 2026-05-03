import { memo, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils";
import { Goal, Shield, ShieldAlert, Crosshair } from "lucide-react";
import type { RlEvent } from "@/lib/types";

interface ScoreTimelineProps {
  events: RlEvent[];
  team0Name?: string;
  team1Name?: string;
}

function getStatfeedLabel(data: Record<string, unknown>): string | null {
  const eventType = data.event_type as string | undefined;
  if (!eventType) return null;
  switch (eventType) {
    case "Save":
      return "Parada";
    case "EpicSave":
      return "Parada Épica";
    case "Shot":
      return "Tiro";
    case "Goal":
      return "Gol";
    case "Assist":
      return "Asistencia";
    case "Demolish":
      return "Demo";
    default:
      return eventType;
  }
}

function getStatfeedColor(data: Record<string, unknown>): string {
  const eventType = data.event_type as string | undefined;
  switch (eventType) {
    case "Save":
      return "text-blue-400";
    case "EpicSave":
      return "text-purple-400";
    case "Shot":
      return "text-yellow-400";
    case "Goal":
      return "text-orange-400";
    case "Assist":
      return "text-green-400";
    case "Demolish":
      return "text-red-400";
    default:
      return "text-gray-400";
  }
}

function getStatfeedIcon(data: Record<string, unknown>) {
  const eventType = data.event_type as string | undefined;
  switch (eventType) {
    case "EpicSave":
      return ShieldAlert;
    case "Shot":
    case "Goal":
      return Crosshair;
    case "Save":
    default:
      return Shield;
  }
}

export const ScoreTimeline = memo(function ScoreTimeline({
  events,
  team0Name = "Azul",
  team1Name = "Naranja",
}: ScoreTimelineProps) {
  const [team0Score, setTeam0Score] = useState(0);
  const [team1Score, setTeam1Score] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let t0 = 0;
    let t1 = 0;
    for (const e of events) {
      if (e.type === "GoalScored") {
        const team = (e.data.team as number) ?? 0;
        if (team === 0) t0++;
        else t1++;
      }
    }
    setTeam0Score(t0);
    setTeam1Score(t1);
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-border-subtle bg-bg-secondary p-12">
        <p className="text-center text-sm text-text-secondary">
          No hay eventos registrados
        </p>
      </div>
    );
  }

  // Sort events by timestamp
  const displayEvents = events.filter(
    (e) => e.type === "GoalScored" || e.type === "StatfeedEvent"
  );

  if (displayEvents.length === 0) {
    return (
      <div className="rounded-xl border border-border-subtle bg-bg-secondary p-12">
        <p className="text-center text-sm text-text-secondary">
          No hay eventos registrados
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-secondary p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-text-primary">
          Línea de Eventos
        </h3>
        <div className="flex items-center gap-3 font-mono text-sm text-text-secondary">
          <span className="text-blue-400">{team0Name}</span>
          <span className="font-bold text-text-primary tabular-nums">{team0Score}</span>
          <span className="text-text-tertiary">-</span>
          <span className="font-bold text-text-primary tabular-nums">{team1Score}</span>
          <span className="text-orange-400">{team1Name}</span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative ml-4 border-l-2 border-gray-700 pl-8"
      >
        {displayEvents.map((event, idx) => {
          const time = formatDuration(event.timestamp);
          const data = event.data as Record<string, unknown>;
          const team = (data.team as number) ?? 0;

          if (event.type === "GoalScored") {
            const scorerName = (data.scorer_name as string) ?? (data.player as string) ?? "Desconocido";
            const assisterName = data.assister_name as string | undefined;
            const teamColor = team === 0 ? "bg-blue-500" : "bg-orange-500";
            const teamLabel = team === 0 ? team0Name : team1Name;
            // Calculate running score at this event
            const goalsBefore = displayEvents.slice(0, idx + 1).filter(
              (e) => e.type === "GoalScored"
            ).reduce(
              (acc, e) => {
                const t = (e.data.team as number) ?? 0;
                if (t === 0) acc[0]++;
                else acc[1]++;
                return acc;
              },
              [0, 0]
            );

            return (
              <div key={event.id} className="relative mb-6 last:mb-0">
                {/* Timeline dot */}
                <div
                  className={cn(
                    "absolute -left-[42px] top-1 w-3 h-3 rounded-full ring-2 ring-bg-secondary",
                    teamColor
                  )}
                />

                {/* Time badge */}
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-xs font-mono text-text-tertiary">
                    {time}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      team === 0
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-orange-500/10 text-orange-400"
                    )}
                  >
                    {teamLabel}
                  </span>
                </div>

                {/* Goal detail */}
                <div className="flex items-start gap-3">
                  <Goal size={14} className="mt-0.5 text-yellow-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-text-primary font-medium truncate">
                      {scorerName}
                    </p>
                    {assisterName && (
                      <p className="text-xs text-text-tertiary mt-0.5">
                        Asistencia: {assisterName}
                      </p>
                    )}
                  </div>
                  <div className="ml-auto flex-shrink-0">
                    <span className="font-mono text-sm font-bold text-text-primary tabular-nums">
                      {goalsBefore[0]} - {goalsBefore[1]}
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          // Statfeed events — smaller entries
          const label = getStatfeedLabel(data);
          const iconColorClass = getStatfeedColor(data);
          const playerName = (data.player_name as string) ?? (data.player as string) ?? "Jugador";
          const Icon = getStatfeedIcon(data);

          if (!label) return null;

          return (
            <div key={event.id} className="relative mb-4 last:mb-0">
              {/* Timeline dot — smaller */}
              <div
                className={cn(
                  "absolute -left-[41px] top-1.5 w-2 h-2 rounded-full ring-2 ring-bg-secondary",
                  team === 0 ? "bg-blue-500" : "bg-orange-500"
                )}
              />

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-text-tertiary w-10 flex-shrink-0">
                  {time}
                </span>
                <Icon size={12} className={cn("flex-shrink-0", iconColorClass)} />
                <span className="text-xs text-text-secondary truncate">
                  {playerName}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium ml-auto flex-shrink-0",
                    iconColorClass
                  )}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
