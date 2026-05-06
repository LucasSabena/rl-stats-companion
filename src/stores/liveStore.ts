import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { LiveMatchState, RlEvent, ConnectionStatus, SessionSummary } from "@/lib/types";

interface LiveState {
  currentMatch: LiveMatchState | null;
  events: RlEvent[];
  connectionStatus: ConnectionStatus;
  lastMatchSummary: SessionSummary | null;
  matchSummaryTimestamp: number | null;

  setMatch: (match: LiveMatchState | null) => void;
  addEvent: (event: RlEvent) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setMatchSummary: (summary: SessionSummary) => void;
  clearMatchSummary: () => void;
  reset: () => void;
}

export const useLiveStore = create<LiveState>()(
  immer(
    subscribeWithSelector((set) => ({
      currentMatch: null,
      events: [],
      connectionStatus: "disconnected",
      lastMatchSummary: null,
      matchSummaryTimestamp: null,

      setMatch: (match) =>
        set((state) => {
          if (state.currentMatch?.matchGuid !== match?.matchGuid) {
            state.events = [];
          }
          state.currentMatch = match;
        }),

      addEvent: (event) =>
        set((state) => {
          state.events.unshift(event);
          if (state.events.length > 100) state.events.pop();
        }),

      setConnectionStatus: (status) =>
        set((state) => {
          state.connectionStatus = status;
        }),

      setMatchSummary: (summary) =>
        set((state) => {
          state.lastMatchSummary = summary;
          state.matchSummaryTimestamp = Date.now();
        }),

      clearMatchSummary: () =>
        set((state) => {
          state.lastMatchSummary = null;
          state.matchSummaryTimestamp = null;
        }),

      reset: () =>
        set((state) => {
          state.currentMatch = null;
          state.events = [];
        }),
    }))
  )
);
