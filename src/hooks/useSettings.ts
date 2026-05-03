import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, setSettings } from "@/lib/api";
import { QUERY_STALE_TIME } from "@/lib/constants";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
    staleTime: QUERY_STALE_TIME.settings,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
