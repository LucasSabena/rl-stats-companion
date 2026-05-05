import type { ProPlayer } from "@/lib/proConfigsTypes";

// ═══════════════════════════════════════════════════════════════════════════════
// EUROPE
// ═══════════════════════════════════════════════════════════════════════════════

const zen: ProPlayer = {
  name: "zen", fullName: "Alexis Bernier", nationality: "France", continent: "Europe",
  team: "Team Vitality", liquipediaUrl: "https://liquipedia.net/rocketleague/Zen",
  imageUrl: "/pro-photos/zen.webp",
  camera: { fov: 110, height: 100, angle: -3.0, distance: 270, stiffness: 0.35, swivelSpeed: 4.0, transitionSpeed: 1.4, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2026-02-12" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.07, dodgeDeadzone: 0.80, aerialSensitivity: 1.50, steeringSensitivity: 1.50, lastUpdated: "2026-02-12" },
  hardware: { controller: "Sony Dualshock 4 (Red)", monitor: "Philips Evnia 25M2N5200P", headset: "Logitech G PRO X 2 LIGHTSPEED (Pink)" },
};

const exotiik: ProPlayer = {
  name: "ExoTiiK", fullName: "Brice Bigeard", nationality: "France", continent: "Europe",
  team: "Team Vitality", liquipediaUrl: "https://liquipedia.net/rocketleague/ExoTiiK",
  imageUrl: "/pro-photos/ExoTiiK.webp",
  camera: { fov: 110, height: 110, angle: -3.0, distance: 270, stiffness: 0.50, swivelSpeed: 4.0, transitionSpeed: 1.0, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2024-09-22" },
  deadzone: { deadzoneShape: "Circle", deadzone: 0.07, dodgeDeadzone: 0.80, aerialSensitivity: 1.60, steeringSensitivity: 1.70, lastUpdated: "2024-09-22" },
  hardware: { controller: "Sony DualShock 4 (Red)", monitor: "Unknown", headset: "Unknown" },
};

const stizzy: ProPlayer = {
  name: "stizzy", fullName: "Gaspar Rosalen Andres", nationality: "Spain", continent: "Europe",
  team: "Team Vitality", liquipediaUrl: "https://liquipedia.net/rocketleague/Stizzy",
  imageUrl: "/pro-photos/stizzy.webp",
  camera: { fov: 110, height: 100, angle: -3.0, distance: 270, stiffness: 0.35, swivelSpeed: 4.0, transitionSpeed: 1.5, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2025-06-29" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.09, dodgeDeadzone: 0.20, aerialSensitivity: 1.90, steeringSensitivity: 1.90, lastUpdated: "2025-10-19" },
  hardware: { controller: "Sony DualSense", monitor: "BenQ Zowie XL2411P", headset: "Unknown" },
};

const vatira: ProPlayer = {
  name: "Vatira", fullName: "Axel Touret", nationality: "France", continent: "Europe",
  team: "Karmine Corp", liquipediaUrl: "https://liquipedia.net/rocketleague/Vatira",
  imageUrl: "/pro-photos/Vatira.webp",
  camera: { fov: 110, height: 90, angle: -5.0, distance: 270, stiffness: 0.35, swivelSpeed: 7.1, transitionSpeed: 1.5, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2025-04-29" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.07, dodgeDeadzone: 0.65, aerialSensitivity: 1.50, steeringSensitivity: 1.50, lastUpdated: "2025-11-17" },
  hardware: { controller: "West Gaming DualSense 5 FPS (Black/Red)", monitor: "Gigabyte AORUS FI25F", headset: "Logitech G PRO X 2 LIGHTSPEED (Pink)" },
};

const extra: ProPlayer = {
  name: "Extra", fullName: "Alexandre Paoli", nationality: "France", continent: "Europe",
  team: "Karmine Corp", liquipediaUrl: "https://liquipedia.net/rocketleague/Extra",
  imageUrl: "/pro-photos/Extra.webp",
  camera: { fov: 110, height: 90, angle: -5.0, distance: 270, stiffness: 0.35, swivelSpeed: 6.9, transitionSpeed: 5.0, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2025-01-21" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.10, dodgeDeadzone: 0.66, aerialSensitivity: 1.50, steeringSensitivity: 1.50, lastUpdated: "2025-01-21" },
};

const archie: ProPlayer = {
  name: "Archie", fullName: "Archie Pickthall", nationality: "England", continent: "Europe",
  team: "Gentle Mates", liquipediaUrl: "https://liquipedia.net/rocketleague/Archie",
  imageUrl: "/pro-photos/Archie.webp",
  camera: { fov: 109, height: 90, angle: -4.0, distance: 270, stiffness: 0.60, swivelSpeed: 2.0, transitionSpeed: 1.2, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2024-07-30" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.05, dodgeDeadzone: 0.75, aerialSensitivity: 1.73, steeringSensitivity: 1.73, lastUpdated: "2023-02-11" },
  hardware: { controller: "Sony DualShock 4 (Blue)", monitor: "Unknown", headset: "HyperX Cloud II" },
};

const nass: ProPlayer = {
  name: "nass", fullName: "Nassim Bali", nationality: "Morocco", continent: "Europe",
  team: "Gentle Mates", liquipediaUrl: "https://liquipedia.net/rocketleague/Nass",
  imageUrl: "/pro-photos/nass.webp",
  camera: { fov: 110, height: 90, angle: -5.0, distance: 270, stiffness: 0.35, swivelSpeed: 6.1, transitionSpeed: 1.8, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2026-02-24" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.07, dodgeDeadzone: 0.70, aerialSensitivity: 1.60, steeringSensitivity: 1.60, lastUpdated: "2026-02-24" },
};

const oski: ProPlayer = {
  name: "Oski", fullName: "Oskar Gozdowski", nationality: "Poland", continent: "Europe",
  team: "Gentle Mates", liquipediaUrl: "https://liquipedia.net/rocketleague/Oski",
  imageUrl: "/pro-photos/Oski.webp",
  camera: { fov: 110, height: 90, angle: -4.0, distance: 270, stiffness: 0.40, swivelSpeed: 7.0, transitionSpeed: 1.5, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2025-01-22" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.08, dodgeDeadzone: 0.75, aerialSensitivity: 1.50, steeringSensitivity: 1.50, lastUpdated: "2023-12-15" },
  hardware: { controller: "Sony DualShock 4 (Black)", monitor: "MSI MAG241C", headset: "HyperX Cloud Stinger Core" },
};

const joreuz: ProPlayer = {
  name: "Joreuz", fullName: "Joris Robben", nationality: "Netherlands", continent: "Europe",
  team: "Ninjas in Pyjamas", liquipediaUrl: "https://liquipedia.net/rocketleague/Joreuz",
  imageUrl: "/pro-photos/Joreuz.webp",
  camera: { fov: 110, height: 100, angle: -3.0, distance: 270, stiffness: 0.35, swivelSpeed: 4.7, transitionSpeed: 1.2, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2025-06-29" },
  deadzone: { deadzoneShape: "Circle", deadzone: 0.05, dodgeDeadzone: 0.70, aerialSensitivity: 1.30, steeringSensitivity: 1.30, lastUpdated: "2024-09-14" },
  hardware: { controller: "Sony DualShock 4 (Midnight Blue)", monitor: "ASUS ROG Strix XG248Q", headset: "Unknown" },
};

const crr: ProPlayer = {
  name: "crr", fullName: "Cristian Fernandez Raigal", nationality: "Spain", continent: "Europe",
  team: "Ninjas in Pyjamas", liquipediaUrl: "https://liquipedia.net/rocketleague/Crr",
  imageUrl: "/pro-photos/crr.webp",
  camera: { fov: 110, height: 90, angle: -4.0, distance: 270, stiffness: 0.40, swivelSpeed: 6.0, transitionSpeed: 1.5, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2025-12-06" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.08, dodgeDeadzone: 0.77, aerialSensitivity: 1.45, steeringSensitivity: 1.45, lastUpdated: "2025-12-06" },
  hardware: { controller: "Sony DualSense 5 (Blue)", monitor: "ViewSonic XG2401", headset: "HyperX Cloud Alpha" },
};

const seikoo: ProPlayer = {
  name: "Seikoo", fullName: "Enzo Grondein", nationality: "France", continent: "Europe",
  team: "Man City Esports", liquipediaUrl: "https://liquipedia.net/rocketleague/Seikoo",
  imageUrl: "/pro-photos/Seikoo.webp",
  camera: { fov: 110, height: 100, angle: -3.0, distance: 240, stiffness: 0.50, swivelSpeed: 4.4, transitionSpeed: 1.4, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2025-11-17" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.07, dodgeDeadzone: 0.68, aerialSensitivity: 1.40, steeringSensitivity: 1.80, lastUpdated: "2025-11-17" },
  hardware: { controller: "Sony DualSense (White)", monitor: "Unknown", headset: "Unknown" },
};

const joyo: ProPlayer = {
  name: "Joyo", fullName: "Joseph Young", nationality: "England", continent: "Europe",
  team: "Geekay Esports", liquipediaUrl: "https://liquipedia.net/rocketleague/Joyo",
  imageUrl: "/pro-photos/Joyo.webp",
  camera: { fov: 110, height: 100, angle: -3.0, distance: 270, stiffness: 0.40, swivelSpeed: 6.5, transitionSpeed: 1.3, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2026-01-21" },
  controls: { powerslide: "L1", airRollLeft: "L1", airRollRight: "", boost: "R1", jump: "cross", ballCam: "triangle", brake: "L2", throttle: "R2" },
  deadzone: { deadzoneShape: "Circle", deadzone: 0.05, dodgeDeadzone: 0.60, aerialSensitivity: 2.00, steeringSensitivity: 2.00, lastUpdated: "2025-11-17" },
};

const apparentlyJack: ProPlayer = {
  name: "ApparentlyJack", fullName: "Jack Benton", nationality: "England", continent: "Europe",
  team: "Geekay Esports", liquipediaUrl: "https://liquipedia.net/rocketleague/ApparentlyJack",
  imageUrl: "/pro-photos/ApparentlyJack.webp",
  camera: { fov: 110, height: 100, angle: -3.0, distance: 270, stiffness: 0.35, swivelSpeed: 2.2, transitionSpeed: 1.8, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2025-11-10" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.05, dodgeDeadzone: 0.70, aerialSensitivity: 1.64, steeringSensitivity: 1.40, lastUpdated: "2025-11-10" },
  hardware: { controller: "Sony DualShock 4 (Black)", monitor: "ASUS Rog Strix", headset: "HyperX Cloud II" },
};

const fairyPeak: ProPlayer = {
  name: "Fairy Peak!", fullName: "Victor Locquet", nationality: "France", continent: "Europe",
  team: "Geekay Esports", liquipediaUrl: "https://liquipedia.net/rocketleague/Fairy_Peak",
  imageUrl: "/pro-photos/Fairy_Peak_.webp",
  camera: { fov: 110, height: 100, angle: -3.0, distance: 270, stiffness: 0.35, swivelSpeed: 4.7, transitionSpeed: 1.4, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2023-12-26" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.07, dodgeDeadzone: 0.65, aerialSensitivity: 2.50, steeringSensitivity: 3.29, lastUpdated: "2025-02-07" },
  hardware: { controller: "Sony DualSense (Blue)", monitor: "ASUS ROG Swift PG258Q (24.5\")", headset: "JBL Quantum 910" },
};

// ─── Historical European Legends ─────────────────────────────────────────────

const kuxir97: ProPlayer = {
  name: "kuxir97", fullName: "Francesco Cinquemani", nationality: "Italy", continent: "Europe",
  team: "GHT", liquipediaUrl: "https://liquipedia.net/rocketleague/Kuxir97",
  imageUrl: "/pro-photos/kuxir97.webp",
  camera: { fov: 110, height: 100, angle: -3.0, distance: 270, stiffness: 0.55, swivelSpeed: 5.0, transitionSpeed: 1.2, ballCamera: "Hold", cameraShake: "No", lastUpdated: "2024-04-11" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.06, dodgeDeadzone: 0.65, aerialSensitivity: 1.60, steeringSensitivity: 1.60, lastUpdated: "2023-08-02" },
  hardware: { controller: "Sony DualSense", monitor: "Unknown", headset: "Unknown" },
};

const kaydop: ProPlayer = {
  name: "Kaydop", fullName: "Alexandre Courant", nationality: "France", continent: "Europe",
  team: "The Last Last Dance", liquipediaUrl: "https://liquipedia.net/rocketleague/Kaydop",
  imageUrl: "/pro-photos/Kaydop.webp",
  camera: { fov: 110, height: 100, angle: -3.0, distance: 270, stiffness: 0.35, swivelSpeed: 4.0, transitionSpeed: 1.0, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2025-07-10" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.08, dodgeDeadzone: 0.75, aerialSensitivity: 1.50, steeringSensitivity: 1.50, lastUpdated: "2024-10-28" },
  hardware: { controller: "Sony PS5 DualSense Edge (White)", monitor: "ASUS ROG Swift PG27AQDP 480Hz", headset: "Logitech G Pro X 2 Lightspeed" },
};

const alpha54: ProPlayer = {
  name: "Alpha54", fullName: "Yanis Champenois", nationality: "France", continent: "Europe",
  team: "Kaydop Corp", liquipediaUrl: "https://liquipedia.net/rocketleague/Alpha54",
  imageUrl: "/pro-photos/Alpha54.webp",
  camera: { fov: 110, height: 110, angle: -3.0, distance: 270, stiffness: 0.35, swivelSpeed: 3.7, transitionSpeed: 1.0, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2024-08-16" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.06, dodgeDeadzone: 0.50, aerialSensitivity: 1.50, steeringSensitivity: 1.50, lastUpdated: "2022-05-07" },
};

const scrubKilla: ProPlayer = {
  name: "Scrub Killa", fullName: "Kyle Robertson", nationality: "Scotland", continent: "Europe",
  team: "Sin Club", liquipediaUrl: "https://liquipedia.net/rocketleague/Scrub_Killa",
  imageUrl: "/pro-photos/Scrub_Killa.webp",
  camera: { fov: 109, height: 90, angle: -5.0, distance: 270, stiffness: 0.35, swivelSpeed: 5.0, transitionSpeed: 1.3, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2024-08-26" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.07, dodgeDeadzone: 0.70, aerialSensitivity: 1.30, steeringSensitivity: 1.30, lastUpdated: "2024-08-26" },
  hardware: { controller: "Sony DualSense", monitor: "Alienware AW2521", headset: "Razer Kraken Tournament Edition" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// NORTH AMERICA
// ═══════════════════════════════════════════════════════════════════════════════

const atomic: ProPlayer = {
  name: "Atomic", fullName: "Massimo Franceschi", nationality: "United States", continent: "North America",
  team: "NRG", liquipediaUrl: "https://liquipedia.net/rocketleague/Atomic",
  imageUrl: "/pro-photos/Atomic.webp",
  camera: { fov: 110, height: 100, angle: -3.0, distance: 270, stiffness: 0.35, swivelSpeed: 6.9, transitionSpeed: 1.2, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2025-09-14" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.05, dodgeDeadzone: 0.40, aerialSensitivity: 2.00, steeringSensitivity: 2.00, lastUpdated: "2024-06-16" },
  hardware: { controller: "Sony DualShock 4 (Midnight)", monitor: "Acer GN246HL", headset: "HyperX Cloud II" },
};

const beastmode: ProPlayer = {
  name: "BeastMode", fullName: "Landon Konerman", nationality: "United States", continent: "North America",
  team: "NRG", liquipediaUrl: "https://liquipedia.net/rocketleague/BeastMode",
  imageUrl: "/pro-photos/BeastMode.webp",
  camera: { fov: 109, height: 90, angle: -4.0, distance: 270, stiffness: 0.45, swivelSpeed: 7.0, transitionSpeed: 1.2, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2025-09-14" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.05, dodgeDeadzone: 0.70, aerialSensitivity: 1.30, steeringSensitivity: 1.30, lastUpdated: "2022-07-17" },
};

const daniel: ProPlayer = {
  name: "Daniel", fullName: "Daniel Piecenski", nationality: "United States", continent: "North America",
  team: "NRG", liquipediaUrl: "https://liquipedia.net/rocketleague/Daniel",
  imageUrl: "/pro-photos/Daniel.webp",
  camera: { fov: 110, height: 100, angle: -3.0, distance: 270, stiffness: 0.35, swivelSpeed: 4.7, transitionSpeed: 1.2, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2025-11-25" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.05, dodgeDeadzone: 0.70, aerialSensitivity: 1.30, steeringSensitivity: 1.30, lastUpdated: "2025-11-25" },
};

const firstkiller: ProPlayer = {
  name: "Firstkiller", fullName: "Jason Corral", nationality: "United States", continent: "North America",
  team: "Shopify Rebellion", liquipediaUrl: "https://liquipedia.net/rocketleague/Firstkiller",
  imageUrl: "/pro-photos/Firstkiller.webp",
  camera: { fov: 110, height: 100, angle: -3.0, distance: 270, stiffness: 0.35, swivelSpeed: 6.9, transitionSpeed: 1.0, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2025-12-11" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.05, dodgeDeadzone: 0.60, aerialSensitivity: 1.30, steeringSensitivity: 1.30, lastUpdated: "2025-12-11" },
};

const lj: ProPlayer = {
  name: "Lj", fullName: "Logan Wilt", nationality: "United States", continent: "North America",
  team: "Shopify Rebellion", liquipediaUrl: "https://liquipedia.net/rocketleague/Lj",
  imageUrl: "/pro-photos/Lj.webp",
  camera: { fov: 110, height: 100, angle: -5.0, distance: 270, stiffness: 0.55, swivelSpeed: 5.0, transitionSpeed: 1.3, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2025-11-10" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.08, dodgeDeadzone: 0.70, aerialSensitivity: 1.60, steeringSensitivity: 1.60, lastUpdated: "2025-11-10" },
  hardware: { controller: "Sony DualShock 4 (Midnight Blue)", monitor: "Unknown", headset: "Unknown" },
};

const jstn: ProPlayer = {
  name: "jstn.", fullName: "Justin Morales", nationality: "United States", continent: "North America",
  team: "FUT Esports", liquipediaUrl: "https://liquipedia.net/rocketleague/Jstn",
  imageUrl: "/pro-photos/jstn_.webp",
  camera: { fov: 110, height: 100, angle: -3.0, distance: 270, stiffness: 0.35, swivelSpeed: 4.7, transitionSpeed: 1.3, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2025-12-11" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.07, dodgeDeadzone: 0.70, aerialSensitivity: 1.30, steeringSensitivity: 1.30, lastUpdated: "2025-12-11" },
  hardware: { controller: "Sony DualShock 4 (Red)", monitor: "ASUS ROG Swift PG259QN", headset: "Bose QuietComfort 20" },
};

// ─── Historical NA Legends ───────────────────────────────────────────────────

const kronovi: ProPlayer = {
  name: "Kronovi", fullName: "Cameron Bills", nationality: "United States", continent: "North America",
  team: "Sin Club", liquipediaUrl: "https://liquipedia.net/rocketleague/Kronovi",
  imageUrl: "/pro-photos/Kronovi.webp",
  camera: { fov: 110, height: 100, angle: -3.0, distance: 260, stiffness: 0.45, swivelSpeed: 1.5, transitionSpeed: 1.4, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2023-11-27" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.05, dodgeDeadzone: 0.85, aerialSensitivity: 1.40, steeringSensitivity: 1.40, lastUpdated: "2021-12-29" },
  hardware: { controller: "Sony DualShock 4 (Blue)", monitor: "ASUS ROG Swift PG278Q", headset: "Logitech G933" },
};

const turbopolsa: ProPlayer = {
  name: "Turbopolsa", fullName: "Pierre Silfver", nationality: "Sweden", continent: "North America",
  team: "Sin Club", liquipediaUrl: "https://liquipedia.net/rocketleague/Turbopolsa",
  imageUrl: "/pro-photos/Turbopolsa.webp",
  camera: { fov: 110, height: 100, angle: -4.0, distance: 270, stiffness: 0.40, swivelSpeed: 4.4, transitionSpeed: 1.5, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2022-01-02" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.10, dodgeDeadzone: 0.55, aerialSensitivity: 1.40, steeringSensitivity: 1.60, lastUpdated: "2022-04-30" },
  hardware: { controller: "Sony DualShock 4", monitor: "BenQ XL2411Z (144Hz)", headset: "HyperX Cloud Alpha" },
};

const squishy: ProPlayer = {
  name: "SquishyMuffinz", fullName: "Mariano Arruda", nationality: "Canada", continent: "North America",
  team: "Sin Club", liquipediaUrl: "https://liquipedia.net/rocketleague/SquishyMuffinz",
  imageUrl: "/pro-photos/SquishyMuffinz.webp",
  camera: { fov: 110, height: 90, angle: -5.0, distance: 270, stiffness: 0.35, swivelSpeed: 7.0, transitionSpeed: 1.8, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2025-05-27" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.07, dodgeDeadzone: 0.80, aerialSensitivity: 1.60, steeringSensitivity: 1.60, lastUpdated: "2026-03-14" },
  hardware: { controller: "Sony DualSense", monitor: "ZOWIE XL2540", headset: "HyperX Cloud Alpha S" },
};

const garrettG: ProPlayer = {
  name: "GarrettG", fullName: "Garrett Gordon", nationality: "United States", continent: "North America",
  team: "Sin Club", liquipediaUrl: "https://liquipedia.net/rocketleague/GarrettG",
  imageUrl: "/pro-photos/GarrettG.webp",
  camera: { fov: 110, height: 100, angle: -3.0, distance: 270, stiffness: 0.35, swivelSpeed: 4.2, transitionSpeed: 1.4, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2025-01-17" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.05, dodgeDeadzone: 0.75, aerialSensitivity: 1.50, steeringSensitivity: 1.50, lastUpdated: "2023-12-15" },
  hardware: { controller: "Sony DualSense", monitor: "ASUS ROG Swift PG258Q", headset: "ASTRO A40" },
};

const jknaps: ProPlayer = {
  name: "JKnaps", fullName: "Jacob Knapman", nationality: "Canada", continent: "North America",
  team: "Sin Club", liquipediaUrl: "https://liquipedia.net/rocketleague/JKnaps",
  imageUrl: "/pro-photos/JKnaps.webp",
  camera: { fov: 109, height: 100, angle: -3.0, distance: 300, stiffness: 0.60, swivelSpeed: 3.1, transitionSpeed: 1.3, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2023-12-15" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.05, dodgeDeadzone: 0.45, aerialSensitivity: 2.00, steeringSensitivity: 2.00, lastUpdated: "2023-12-15" },
  hardware: { controller: "Sony DualShock 4 (Camouflage)", monitor: "Unknown", headset: "Unknown" },
};

const rizzo: ProPlayer = {
  name: "Rizzo", fullName: "Dillon Rizzo", nationality: "United States", continent: "North America",
  team: "Sin Club", liquipediaUrl: "https://liquipedia.net/rocketleague/Rizzo",
  imageUrl: "/pro-photos/Rizzo.webp",
  camera: { fov: 110, height: 100, angle: -5.0, distance: 270, stiffness: 0.40, swivelSpeed: 4.0, transitionSpeed: 1.2, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2023-11-18" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.10, dodgeDeadzone: 0.74, aerialSensitivity: 2.30, steeringSensitivity: 2.30, lastUpdated: "2022-05-01" },
  hardware: { controller: "Microsoft Xbox Elite", monitor: "ASUS VG248QE", headset: "Logitech G PRO X" },
};

const lethamyr: ProPlayer = {
  name: "Lethamyr", fullName: "Treyven Robitaille", nationality: "Canada", continent: "North America",
  team: "Sin Club", liquipediaUrl: "https://liquipedia.net/rocketleague/Lethamyr",
  imageUrl: "/pro-photos/Lethamyr.webp",
  camera: { fov: 110, height: 110, angle: -4.0, distance: 270, stiffness: 0.55, swivelSpeed: 5.0, transitionSpeed: 1.5, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2026-03-12" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.10, dodgeDeadzone: 0.80, aerialSensitivity: 1.00, steeringSensitivity: 1.00, lastUpdated: "2020-11-22" },
  hardware: { controller: "Thrustmaster H.E.A.R.T", monitor: "Asus ROG Strix XG258Q", headset: "beyer dynamic DT 990 Pro" },
};

const chicago: ProPlayer = {
  name: "Chicago", fullName: "Reed Wilen", nationality: "United States", continent: "North America",
  team: "Sin Club", liquipediaUrl: "https://liquipedia.net/rocketleague/Chicago",
  imageUrl: "/pro-photos/Chicago.webp",
  camera: { fov: 110, height: 100, angle: -3.0, distance: 270, stiffness: 0.40, swivelSpeed: 4.7, transitionSpeed: 1.3, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2025-01-19" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.05, dodgeDeadzone: 0.63, aerialSensitivity: 2.00, steeringSensitivity: 2.00, lastUpdated: "2023-12-15" },
  hardware: { controller: "Sony DualShock 4 (Red)", monitor: "Unknown", headset: "SteelSeries Arctis" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MENA
// ═══════════════════════════════════════════════════════════════════════════════

const rw9: ProPlayer = {
  name: "Rw9", fullName: "Saleh Abdullah Bakhashwin", nationality: "Saudi Arabia", continent: "MENA",
  team: "Team Falcons", liquipediaUrl: "https://liquipedia.net/rocketleague/Rw9",
  imageUrl: "/pro-photos/Rw9.webp",
  camera: { fov: 110, height: 100, angle: -5.0, distance: 270, stiffness: 0.35, swivelSpeed: 3.5, transitionSpeed: 1.1, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2025-12-30" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.07, dodgeDeadzone: 0.80, aerialSensitivity: 1.50, steeringSensitivity: 1.50, lastUpdated: "2025-12-30" },
  hardware: { controller: "Sony DualShock 4 (Black)", monitor: "Acer Nitro", headset: "Beyerdynamic DT 990 Pro" },
};

const kiileerrz: ProPlayer = {
  name: "Kiileerrz", fullName: "Yazeed Abdullah Bakhashwin", nationality: "Saudi Arabia", continent: "MENA",
  team: "Team Falcons", liquipediaUrl: "https://liquipedia.net/rocketleague/Kiileerrz",
  imageUrl: "/pro-photos/Kiileerrz.webp",
  camera: { fov: 110, height: 100, angle: -5.0, distance: 270, stiffness: 0.40, swivelSpeed: 10.0, transitionSpeed: 1.5, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2025-06-29" },
  deadzone: { deadzoneShape: "Circle", deadzone: 0.07, dodgeDeadzone: 0.80, aerialSensitivity: 2.00, steeringSensitivity: 2.00, lastUpdated: "2025-10-19" },
};

const dralii: ProPlayer = {
  name: "dralii", fullName: "Samy Hajji", nationality: "Morocco", continent: "MENA",
  team: "Team Falcons", liquipediaUrl: "https://liquipedia.net/rocketleague/Dralii",
  imageUrl: "/pro-photos/dralii.webp",
  camera: { fov: 110, height: 90, angle: -6.0, distance: 260, stiffness: 0.45, swivelSpeed: 4.2, transitionSpeed: 1.4, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2025-12-21" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.07, dodgeDeadzone: 0.77, aerialSensitivity: 1.77, steeringSensitivity: 1.77, lastUpdated: "2025-12-21" },
  hardware: { controller: "Sony DualShock 4 (Black)", monitor: "Unknown", headset: "Logitech G PRO X 2 LIGHTSPEED (White)" },
};

const nwpo: ProPlayer = {
  name: "Nwpo", fullName: "Hisham Ali Alqadi", nationality: "Saudi Arabia", continent: "MENA",
  team: "Twisted Minds", liquipediaUrl: "https://liquipedia.net/rocketleague/Nwpo",
  imageUrl: "/pro-photos/Nwpo.webp",
  camera: { fov: 110, height: 100, angle: -5.0, distance: 270, stiffness: 0.40, swivelSpeed: 5.1, transitionSpeed: 1.5, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2026-04-19" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.07, dodgeDeadzone: 0.65, aerialSensitivity: 1.40, steeringSensitivity: 1.40, lastUpdated: "2026-04-19" },
};

const trk511: ProPlayer = {
  name: "trk511", fullName: "Mohammed Khalid Alotaibi", nationality: "Saudi Arabia", continent: "MENA",
  team: "Twisted Minds", liquipediaUrl: "https://liquipedia.net/rocketleague/Trk511",
  imageUrl: "/pro-photos/trk511.webp",
  camera: { fov: 110, height: 100, angle: -5.0, distance: 270, stiffness: 0.40, swivelSpeed: 5.7, transitionSpeed: 1.0, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2024-12-08" },
  deadzone: { deadzoneShape: "Circle", deadzone: 0.09, dodgeDeadzone: 0.20, aerialSensitivity: 2.70, steeringSensitivity: 2.90, lastUpdated: "2025-03-14" },
  hardware: { controller: "Sony DualShock 4 (Black)", monitor: "Unknown", headset: "Unknown" },
};

const monkeyMoon: ProPlayer = {
  name: "M0nkey M00n", fullName: "Evan Rogez", nationality: "France", continent: "MENA",
  team: "Twisted Minds", liquipediaUrl: "https://liquipedia.net/rocketleague/M0nkey_M00n",
  imageUrl: "/pro-photos/M0nkey_M00n.webp",
  camera: { fov: 110, height: 100, angle: -3.0, distance: 270, stiffness: 0.50, swivelSpeed: 4.0, transitionSpeed: 1.1, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2025-12-20" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.07, dodgeDeadzone: 0.60, aerialSensitivity: 2.93, steeringSensitivity: 2.93, lastUpdated: "2025-12-20" },
  hardware: { controller: "Sony DualSense (Sterling Silver)", monitor: "Zowie xl2546", headset: "HyperX Cloud II" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SOUTH AMERICA
// ═══════════════════════════════════════════════════════════════════════════════

const aztro: ProPlayer = {
  name: "Aztro", fullName: "Luiz Fellipe Lopes Gomes", nationality: "Brazil", continent: "South America",
  team: "MIBR", liquipediaUrl: "https://liquipedia.net/rocketleague/Aztro",
  imageUrl: "/pro-photos/Aztro.webp",
  camera: { fov: 110, height: 100, angle: -5.0, distance: 270, stiffness: 0.40, swivelSpeed: 4.0, transitionSpeed: 1.0, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2024-10-20" },
  deadzone: { deadzoneShape: "Cross", deadzone: 0.05, dodgeDeadzone: 0.63, aerialSensitivity: 2.00, steeringSensitivity: 2.00, lastUpdated: "2023-09-08" },
  hardware: { controller: "Sony DualShock 4", monitor: "Alienware AW2521H (360hz)", headset: "ASTRO A40" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// OCEANIA
// ═══════════════════════════════════════════════════════════════════════════════

const torsos: ProPlayer = {
  name: "Torsos", fullName: "Daniel Parsons", nationality: "Australia", continent: "Oceania",
  team: "Wildcard", liquipediaUrl: "https://liquipedia.net/rocketleague/Torsos",
  imageUrl: "/pro-photos/Torsos.webp",
  camera: { fov: 110, height: 100, angle: -3.0, distance: 270, stiffness: 0.40, swivelSpeed: 10.0, transitionSpeed: 1.4, ballCamera: "Toggle", cameraShake: "No", lastUpdated: "2025-02-16" },
  controls: { powerslide: "Left Shift", airRollLeft: "Left Shift", airRollRight: "MB4", boost: "LMB", jump: "Space", ballCam: "RMB", brake: "S", throttle: "W" },
  hardware: { controller: "Logitech G PRO Keyboard + G502 Mouse (KBM)", monitor: "Unknown", headset: "HyperX Cloud II" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MASTER PLAYER LIST
// ═══════════════════════════════════════════════════════════════════════════════

export const proPlayers: ProPlayer[] = [
  // Europe - active
  zen, exotiik, stizzy,
  vatira, extra,
  archie, nass, oski,
  joreuz, crr,
  seikoo,
  joyo, apparentlyJack, fairyPeak,
  alpha54, kaydop,
  // Europe - historical
  kuxir97, scrubKilla,
  // North America - active
  atomic, beastmode, daniel,
  firstkiller, lj,
  jstn,
  // North America - historical / content creators
  kronovi, turbopolsa, squishy, garrettG, jknaps, rizzo, lethamyr, chicago,
  // MENA
  rw9, kiileerrz, dralii,
  nwpo, trk511, monkeyMoon,
  // South America
  aztro,
  // Oceania
  torsos,
];

export const proPlayersByTeam: Record<string, ProPlayer[]> = {
  "Team Vitality": [zen, exotiik, stizzy],
  "Karmine Corp": [vatira, extra],
  "Gentle Mates": [archie, nass, oski],
  "Ninjas in Pyjamas": [joreuz, crr],
  "Man City Esports": [seikoo],
  "Geekay Esports": [joyo, apparentlyJack, fairyPeak],
  "NRG": [atomic, beastmode, daniel],
  "Shopify Rebellion": [firstkiller, lj],
  "FUT Esports": [jstn],
  "Team Falcons": [rw9, kiileerrz, dralii],
  "Twisted Minds": [nwpo, trk511, monkeyMoon],
  "MIBR": [aztro],
  "Wildcard": [torsos],
  "Kaydop Corp": [alpha54],
  "The Last Last Dance": [kaydop],
  "GHT": [kuxir97],
  "Sin Club": [kronovi, turbopolsa, squishy, garrettG, jknaps, rizzo, lethamyr, chicago, scrubKilla],
};
