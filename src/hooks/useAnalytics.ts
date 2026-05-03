import { useQuery } from "@tanstack/react-query";
import { getAnalytics, getDailyRollups } from "@/lib/api";
import type { AnalyticsPeriod } from "@/lib/types";
import { QUERY_STALE_TIME } from "@/lib/constants";

export function useAnalytics(period: AnalyticsPeriod) {
  return useQuery({
    queryKey: ["analytics", period],
    queryFn: () => getAnalytics(period),
    staleTime: QUERY_STALE_TIME.analytics,
  });
}

export function useDailyRollups(period: AnalyticsPeriod) {
  return useQuery({
    queryKey: ["rollups", period],
    queryFn: () => getDailyRollups(period),
    staleTime: QUERY_STALE_TIME.analytics,
  });
}
