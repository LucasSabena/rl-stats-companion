import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMatch } from "@/lib/api";

export function useDeleteMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: number) => deleteMatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["rollups"] });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    },
  });
}
