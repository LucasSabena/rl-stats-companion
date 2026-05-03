import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { LiveMatchState, Player, RlEvent, ConnectionStatus, SessionSummary } from "@/lib/types";

interface LiveState {
  currentMatch: LiveMatchState | null;
  players: Player[];
  events: RlEvent[];
  connectionStatus: ConnectionStatus;
  lastMatchSummary: SessionSummary | null;
  matchSummaryTimestamp: number | null;

  setMatch: (match: LiveMatchState | null) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
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
      players: [],
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
          state.players = match?.players ?? [];
        }),

      updatePlayer: (playerId, updates) =>
        set((state) => {
          const player = state.players.find((p: Player) => p.id === playerId);
          if (player) Object.assign(player, updates);
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
          state.players = [];
          state.events = [];
        }),
    }))
  )
);

export const selectBlueTeamPlayers = (state: LiveState) =>
  state.players.filter((p: Player) => p.team === 0);

export const selectOrangeTeamPlayers = (state: LiveState) =>
  state.players.filter((p: Player) => p.team === 1);
