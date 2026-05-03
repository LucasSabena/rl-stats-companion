import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMatch } from "@/lib/api";

export function useUpdateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      matchId,
      data,
    }: {
      matchId: number;
      data: { matchType?: string | null; playlist?: string | null };
    }) => updateMatch(matchId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["match-detail", variables.matchId] });
    },
  });
}
