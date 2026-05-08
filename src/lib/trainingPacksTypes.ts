export type PackCategory =
  | "speedflip"
  | "aerial"
  | "dribbling"
  | "shooting"
  | "rings"
  | "obstacle-course"
  | "kickoff"
  | "wall-ceiling"
  | "goalie"
  | "freestyle"
  | "defense"
  | "powershot";

export type PackDifficulty = "beginner" | "intermediate" | "advanced" | "pro";

export interface TrainingPack {
  id: string;
  name: string;
  code: string;
  creator: string;
  category: PackCategory;
  difficulty: PackDifficulty;
  description: string;
  tags?: string[];
  sourceUrl?: string;
  featured?: boolean;
}

export interface TrainingPackCatalog {
  lastUpdated: string;
  packs: TrainingPack[];
}

export interface UserTrainingPack extends TrainingPack {
  type: "user";
  createdAt: number;
}
