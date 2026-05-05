import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Profile } from "@/lib/types";
import {
  listProfiles,
  getActiveProfile,
  createProfile as apiCreateProfile,
  switchProfile as apiSwitchProfile,
  deleteProfile as apiDeleteProfile,
  renameProfile as apiRenameProfile,
} from "@/lib/api";
import { getErrorMessage } from "@/lib/api";

interface ProfileState {
  profiles: Profile[];
  activeProfile: Profile | null;
  isLoading: boolean;
  error: string | null;

  fetchProfiles: () => Promise<void>;
  createProfile: (name: string) => Promise<void>;
  switchProfile: (id: string) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  renameProfile: (id: string, newName: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>()(
  immer((set) => ({
    profiles: [],
    activeProfile: null,
    isLoading: false,
    error: null,

    fetchProfiles: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const [profiles, active] = await Promise.all([
          listProfiles(),
          getActiveProfile().catch(() => null),
        ]);
        set((state) => {
          state.profiles = profiles;
          state.activeProfile = active;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = getErrorMessage(error);
          state.isLoading = false;
        });
      }
    },

    createProfile: async (name) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        const profile = await apiCreateProfile(name);
        set((state) => {
          state.profiles.push(profile);
          state.activeProfile = profile;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = getErrorMessage(error);
          state.isLoading = false;
        });
        throw error;
      }
    },

    switchProfile: async (id) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        await apiSwitchProfile(id);
        const active = await getActiveProfile().catch(() => null);
        set((state) => {
          state.activeProfile = active;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = getErrorMessage(error);
          state.isLoading = false;
        });
        throw error;
      }
    },

    deleteProfile: async (id) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        await apiDeleteProfile(id);
        set((state) => {
          state.profiles = state.profiles.filter((p) => p.id !== id);
          if (state.activeProfile?.id === id) {
            state.activeProfile = null;
          }
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = getErrorMessage(error);
          state.isLoading = false;
        });
        throw error;
      }
    },

    renameProfile: async (id, newName) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });
      try {
        await apiRenameProfile(id, newName);
        set((state) => {
          const profile = state.profiles.find((p) => p.id === id);
          if (profile) profile.name = newName;
          if (state.activeProfile?.id === id) {
            state.activeProfile = { ...state.activeProfile, name: newName };
          }
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error = getErrorMessage(error);
          state.isLoading = false;
        });
        throw error;
      }
    },
  }))
);
