import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { UserTrainingPack } from "@/lib/trainingPacksTypes";

interface TrainingPacksState {
  userPacks: UserTrainingPack[];
  favorites: Set<string>;
  addUserPack: (pack: Omit<UserTrainingPack, "id" | "createdAt" | "type">) => void;
  removeUserPack: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const STORAGE_KEY = "rl-training-packs";

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadFromStorage(): { userPacks: UserTrainingPack[]; favorites: Set<string> } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { userPacks?: UserTrainingPack[]; favorites?: string[] };
      return {
        userPacks: parsed.userPacks ?? [],
        favorites: new Set<string>(parsed.favorites ?? []),
      };
    }
  } catch {
    // ignore parse errors
  }
  return { userPacks: [], favorites: new Set<string>() };
}

const initial = loadFromStorage();

export const useTrainingPacksStore = create<TrainingPacksState>()(
  immer((set, get) => ({
    userPacks: initial.userPacks,
    favorites: initial.favorites,

    addUserPack: (pack) =>
      set((state) => {
        const newPack: UserTrainingPack = {
          ...pack,
          id: generateId(),
          type: "user",
          createdAt: Date.now(),
        };
        state.userPacks.push(newPack);
      }),

    removeUserPack: (id) =>
      set((state) => {
        state.userPacks = state.userPacks.filter((p) => p.id !== id);
        state.favorites.delete(id);
      }),

    toggleFavorite: (id) =>
      set((state) => {
        if (state.favorites.has(id)) {
          state.favorites.delete(id);
        } else {
          state.favorites.add(id);
        }
      }),

    isFavorite: (id) => get().favorites.has(id),
  }))
);

useTrainingPacksStore.subscribe((state) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        userPacks: state.userPacks,
        favorites: Array.from(state.favorites),
      })
    );
  } catch {
    // ignore write errors
  }
});
