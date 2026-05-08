import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { TrainingPack, TrainingPackCatalog } from "@/lib/trainingPacksTypes";
import { useTrainingPacksStore } from "@/stores/trainingPacksStore";

const TRAINING_PACKS_URL =
  "https://raw.githubusercontent.com/LucasSabena/rl-stats/main/public/training-packs.json";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useTrainingPacks() {
  const userPacks = useTrainingPacksStore((state) => state.userPacks);

  const { data, isLoading, isError, refetch } = useQuery<TrainingPack[]>({
    queryKey: ["training-packs"],
    queryFn: async () => {
      const response = await fetch(TRAINING_PACKS_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch training packs");
      }
      const catalog = (await response.json()) as TrainingPackCatalog;
      return catalog.packs ?? [];
    },
    staleTime: STALE_TIME,
  });

  const packs = useMemo<TrainingPack[]>(() => {
    const remotePacks = data ?? [];
    const merged: TrainingPack[] = [...remotePacks, ...userPacks];

    const unique = new Map<string, TrainingPack>();
    for (const pack of merged) {
      if (!unique.has(pack.id)) {
        unique.set(pack.id, pack);
      }
    }

    return Array.from(unique.values()).sort((a, b) => {
      const aFeatured = a.featured ? 1 : 0;
      const bFeatured = b.featured ? 1 : 0;
      if (aFeatured !== bFeatured) return bFeatured - aFeatured;
      return a.name.localeCompare(b.name);
    });
  }, [data, userPacks]);

  const featuredPacks = useMemo(
    () => packs.filter((p) => p.featured),
    [packs]
  );

  const filteredPacks = (
    search: string,
    category: string | null,
    difficulty: string | null
  ): TrainingPack[] => {
    const query = search.trim().toLowerCase();

    return packs.filter((pack) => {
      if (category !== null && pack.category !== category) return false;
      if (difficulty !== null && pack.difficulty !== difficulty) return false;

      if (query.length > 0) {
        const haystack = [
          pack.name,
          pack.creator,
          pack.code,
          ...(pack.tags ?? []),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  };

  return {
    packs,
    featuredPacks,
    isLoading,
    isError,
    filteredPacks,
    refetch,
  };
}
