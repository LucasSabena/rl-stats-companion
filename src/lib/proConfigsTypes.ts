export interface CameraSettings {
  fov: number;
  height: number;
  angle: number;
  distance: number;
  stiffness: number;
  swivelSpeed: number;
  transitionSpeed: number;
  ballCamera: string;
  cameraShake: string;
  lastUpdated?: string;
}

export interface ControlSettings {
  powerslide: string;
  airRollLeft: string;
  airRollRight: string;
  boost: string;
  jump: string;
  ballCam: string;
  brake: string;
  throttle: string;
}

export interface DeadzoneSettings {
  deadzoneShape: string;
  deadzone: number;
  dodgeDeadzone: number;
  aerialSensitivity: number;
  steeringSensitivity: number;
  lastUpdated?: string;
}

export interface HardwareSettings {
  controller: string;
  monitor: string;
  headset: string;
}

export type Continent = "Europe" | "North America" | "South America" | "MENA" | "Oceania" | "Asia-Pacific" | "Sub-Saharan Africa";

export interface ProPlayer {
  name: string;
  fullName?: string;
  nationality: string;
  continent: Continent;
  team: string;
  teamLogo?: string;
  liquipediaUrl: string;
  camera?: CameraSettings;
  controls?: ControlSettings;
  deadzone?: DeadzoneSettings;
  hardware?: HardwareSettings;
}

export interface ProTeam {
  name: string;
  continent: Continent;
  region: string;
  players: ProPlayer[];
}

export interface ProConfigsData {
  lastUpdated: string;
  continents: Record<Continent, ProTeam[]>;
  noTeamPlayers: ProPlayer[];
}
