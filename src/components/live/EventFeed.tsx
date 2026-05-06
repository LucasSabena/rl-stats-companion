import { memo } from "react";
import { useLiveStore } from "@/stores/liveStore";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";
import type { RlEvent, RlEventType } from "@/lib/types";
import { Goal, Swords, CircleDot, Timer, Pause, Play, RotateCcw, FastForward, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

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

const eventTranslationKeys: Record<RlEventType, string> = {
  UpdateState: "live:events.UpdateState",
  BallHit: "live:events.BallHit",
  GoalScored: "live:events.GoalScored",
  StatfeedEvent: "live:events.StatfeedEvent",
  MatchCreated: "live:events.MatchCreated",
  MatchEnded: "live:events.MatchEnded",
  GoalReplayStart: "live:events.GoalReplayStart",
  GoalReplayEnd: "live:events.GoalReplayEnd",
  PlayerJoined: "live:events.PlayerJoined",
  PlayerLeft: "live:events.PlayerLeft",
  CountdownBegin: "live:events.CountdownBegin",
  MatchPaused: "live:events.MatchPaused",
  MatchUnpaused: "live:events.MatchUnpaused",
  ClockUpdatedSeconds: "live:events.ClockUpdatedSeconds",
  RoundStarted: "live:events.RoundStarted",
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
  const { t } = useTranslation(["live", "common"]);

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-surface">
      <div className="border-b border-border-subtle px-3 py-2">
        <h3 className="font-display text-xs font-semibold text-text-primary">{t("live:events.title")}</h3>
      </div>
      <div className="h-36 overflow-y-auto p-1.5">
        {events.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-tertiary">{t("live:events.empty")}</p>
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
  const { t } = useTranslation(["live", "common"]);
  const Icon = eventIcons[event.type] ?? CircleDot;
  return (
    <div className="flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors hover:bg-surface-hover/50">
      <Icon size={14} className={cn("shrink-0", eventColors[event.type] ?? "text-text-tertiary")} />
      <span className="text-text-secondary">{t(eventTranslationKeys[event.type] ?? `live:events.${event.type}`) ?? event.type}</span>
      <span className="ml-auto text-[11px] text-text-muted">{formatDateTime(event.timestamp * 1000)}</span>
    </div>
  );
}
