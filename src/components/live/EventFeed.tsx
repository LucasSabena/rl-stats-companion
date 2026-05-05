import { memo } from "react";
import { useLiveStore } from "@/stores/liveStore";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";
import type { RlEvent, RlEventType } from "@/lib/types";
import { Goal, Swords, CircleDot, Timer, Pause, Play, RotateCcw, FastForward, Clock } from "lucide-react";

const eventIcons: Record<RlEventType, typeof Goal> = {
  UpdateState: CircleDot,
  BallHit: CircleDot,
  GoalScored: Goal,
  StatfeedEvent: Swords,
  MatchCreated: CircleDot,
  MatchEnded: CircleDot,
  GoalReplayStart: RotateCcw,
  GoalReplayEnd: FastForward,
  PlayerJoined: CircleDot,
  PlayerLeft: CircleDot,
  CountdownBegin: Timer,
  MatchPaused: Pause,
  MatchUnpaused: Play,
  ClockUpdatedSeconds: Clock,
  RoundStarted: Play,
};

const eventLabels: Record<RlEventType, string> = {
  UpdateState: "Actualizacion",
  BallHit: "Pelota golpeada",
  GoalScored: "Gol!",
  StatfeedEvent: "Estadistica",
  MatchCreated: "Partida creada",
  MatchEnded: "Partida finalizada",
  GoalReplayStart: "Repeticion de gol",
  GoalReplayEnd: "Fin repeticion",
  PlayerJoined: "Jugador unido",
  PlayerLeft: "Jugador salio",
  CountdownBegin: "Cuenta regresiva",
  MatchPaused: "Partida pausada",
  MatchUnpaused: "Partida reanudada",
  ClockUpdatedSeconds: "Reloj actualizado",
  RoundStarted: "Ronda iniciada",
};

const eventColors: Record<RlEventType, string> = {
  UpdateState: "text-text-tertiary",
  BallHit: "text-text-tertiary",
  GoalScored: "text-accent-secondary",
  StatfeedEvent: "text-accent-purple",
  MatchCreated: "text-accent-info",
  MatchEnded: "text-accent-warning",
  GoalReplayStart: "text-text-tertiary",
  GoalReplayEnd: "text-text-tertiary",
  PlayerJoined: "text-text-tertiary",
  PlayerLeft: "text-text-tertiary",
  CountdownBegin: "text-accent-info",
  MatchPaused: "text-accent-warning",
  MatchUnpaused: "text-accent-success",
  ClockUpdatedSeconds: "text-text-tertiary",
  RoundStarted: "text-accent-info",
};

export const EventFeed = memo(function EventFeed() {
  const events = useLiveStore((state) => state.events);

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface">
      <div className="border-b border-border-subtle px-4 py-3">
        <h3 className="font-display text-sm font-semibold text-text-primary">Eventos recientes</h3>
      </div>
      <div className="h-48 overflow-y-auto p-2">
        {events.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-tertiary">Sin eventos aun</p>
        ) : (
          <div className="space-y-0.5">
            {events.slice(0, 50).map((event) => (
              <EventItem key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

function EventItem({ event }: { event: RlEvent }) {
  const Icon = eventIcons[event.type] ?? CircleDot;
  return (
    <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors hover:bg-surface-hover/50">
      <Icon size={14} className={cn("shrink-0", eventColors[event.type] ?? "text-text-tertiary")} />
      <span className="text-text-secondary">{eventLabels[event.type] ?? event.type}</span>
      <span className="ml-auto text-[11px] text-text-muted">{formatDateTime(event.timestamp * 1000)}</span>
    </div>
  );
}
