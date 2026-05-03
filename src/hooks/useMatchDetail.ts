import { useQuery } from "@tanstack/react-query";
import { getMatchDetail } from "@/lib/api";
import { QUERY_STALE_TIME } from "@/lib/constants";

export function useMatchDetail(matchId: number) {
  return useQuery({
    queryKey: ["match-detail", matchId],
    queryFn: () => getMatchDetail(matchId),
    staleTime: QUERY_STALE_TIME.matchDetail,
    enabled: !Number.isNaN(matchId) && matchId > 0,
  });
}
