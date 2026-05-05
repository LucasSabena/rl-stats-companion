import { useQuery } from "@tanstack/react-query";
import { getPlayerDirectory, getPlayerDetail } from "@/lib/api";
import { QUERY_STALE_TIME } from "@/lib/constants";

export function usePlayerDirectory(filters?: {
  search?: string;
  relationship?: string;
  sortBy?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["player-directory", filters ?? {}],
    queryFn: () => getPlayerDirectory(filters),
    staleTime: QUERY_STALE_TIME.matches,
  });
}

export function usePlayerDetail(playerId: number) {
  return useQuery({
    queryKey: ["player-detail", playerId],
    queryFn: () => getPlayerDetail(playerId),
    staleTime: QUERY_STALE_TIME.matches,
  });
}
