import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { MatchType } from "@/lib/types";

interface SettingsState {
  playerName: string;
  autoStart: boolean;
  hasCompletedOnboarding: boolean;
  rlPath: string | null;
  platform: "steam" | "epic" | null;
  defaultMatchType: MatchType;

  setAutoStart: (value: boolean) => void;
  setPlayerName: (value: string) => void;
  completeOnboarding: () => void;
  setRlPath: (path: string | null) => void;
  setPlatform: (platform: "steam" | "epic" | null) => void;
  setDefaultMatchType: (type: MatchType) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    immer((set) => ({
      autoStart: false,
      playerName: "",
      hasCompletedOnboarding: false,
      rlPath: null,
      platform: null,
      defaultMatchType: "ranked",

      setAutoStart: (value) => set((state) => { state.autoStart = value; }),
      setPlayerName: (value) => set((state) => { state.playerName = value; }),
      completeOnboarding: () => set((state) => { state.hasCompletedOnboarding = true; }),
      setRlPath: (path) => set((state) => { state.rlPath = path; }),
      setPlatform: (platform) => set((state) => { state.platform = platform; }),
      setDefaultMatchType: (type) => set((state) => { state.defaultMatchType = type; }),
    })),
    { name: "settings-store" }
  )
);
