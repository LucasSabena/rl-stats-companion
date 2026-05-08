import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type { UserPreset, UserPresetInput } from "@/lib/types";

const PRESETS_KEY = ["userPresets"] as const;

export function useUserPresets() {
  return useQuery({
    queryKey: PRESETS_KEY,
    queryFn: async () => {
      return await invoke<UserPreset[]>("list_user_presets_cmd");
    },
  });
}

export function useSaveUserPreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (preset: UserPresetInput) => {
      return await invoke<number>("save_user_preset_cmd", { preset });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRESETS_KEY });
    },
  });
}

export function useDeleteUserPreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      return await invoke<void>("delete_user_preset_cmd", { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRESETS_KEY });
    },
  });
}

export function useExportPreset() {
  return useMutation({
    mutationFn: async (id: number) => {
      return await invoke<string>("export_preset_json_cmd", { id });
    },
  });
}

export function useImportPreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (json: string) => {
      return await invoke<number>("import_preset_json_cmd", { json });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRESETS_KEY });
    },
  });
}
