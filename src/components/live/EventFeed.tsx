import { memo } from "react";
import { useLiveStore } from "@/stores/liveStore";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";
import type { RlEvent, RlEventType } from "@/lib/types";
import { Goal, Swords, CircleDot } from "lucide-react";

const eventIcons: Record<RlEventType, typeof Goal> = {
  UpdateState: CircleDot,
  BallHit: CircleDot,
  GoalScored: Goal,
  StatfeedEvent: Swords,
  MatchCreated: CircleDot,
  MatchEnded: CircleDot,
  ReplayStart: CircleDot,
  ReplayEnd: CircleDot,
  PlayerJoined: CircleDot,
  PlayerLeft: CircleDot,
};

const eventLabels: Record<RlEventType, string> = {
  UpdateState: "Actualización",
  BallHit: "Pelota golpeada",
  GoalScored: "¡Gol!",
  StatfeedEvent: "Estadística",
  MatchCreated: "Partida creada",
  MatchEnded: "Partida finalizada",
  ReplayStart: "Repetición",
  ReplayEnd: "Fin repetición",
  PlayerJoined: "Jugador unido",
  PlayerLeft: "Jugador salió",
};

const eventColors: Record<RlEventType, string> = {
  UpdateState: "text-text-tertiary",
  BallHit: "text-text-tertiary",
  GoalScored: "text-accent-secondary",
  StatfeedEvent: "text-accent-purple",
  MatchCreated: "text-accent-info",
  MatchEnded: "text-accent-warning",
  ReplayStart: "text-text-tertiary",
  ReplayEnd: "text-text-tertiary",
  PlayerJoined: "text-text-tertiary",
  PlayerLeft: "text-text-tertiary",
};

export const EventFeed = memo(function EventFeed() {
  const events = useLiveStore((state) => state.events);

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-secondary">
      <div className="border-b border-border-subtle px-4 py-3">
        <h3 className="text-sm font-semibold text-text-primary">Eventos recientes</h3>
      </div>
      <div className="h-48 overflow-y-auto p-2">
        {events.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-tertiary">Sin eventos aún</p>
        ) : (
          <div className="space-y-1">
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
  const Icon = eventIcons[event.type];
  return (
    <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-surface-hover">
      <Icon size={14} className={cn("shrink-0", eventColors[event.type])} />
      <span className="text-text-secondary">{eventLabels[event.type]}</span>
      <span className="ml-auto text-xs text-text-muted">{formatDateTime(event.timestamp * 1000)}</span>
    </div>
  );
}
