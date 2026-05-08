import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLiveHeadToHead } from "@/lib/api";
import { useLiveStore } from "@/stores/liveStore";

export function useLiveHeadToHead() {
  const currentMatch = useLiveStore((state) => state.currentMatch);

  const opponentIds = useMemo(
    () => (currentMatch?.players ?? []).map((player) => player.id).filter(Boolean).sort(),
    [currentMatch?.players]
  );

  return useQuery({
    queryKey: ["liveHeadToHead", opponentIds],
    queryFn: () => getLiveHeadToHead(opponentIds),
    enabled: opponentIds.length > 0,
    staleTime: 60_000,
  });
}
