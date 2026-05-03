import { useQuery } from "@tanstack/react-query";
import { getMatches } from "@/lib/api";
import type { MatchFilters } from "@/lib/types";
import { QUERY_STALE_TIME } from "@/lib/constants";

export function useMatchHistory(filters?: MatchFilters) {
  return useQuery({
    queryKey: ["matches", filters ?? {}],
    queryFn: () => getMatches(filters),
    staleTime: QUERY_STALE_TIME.matches,
  });
}
