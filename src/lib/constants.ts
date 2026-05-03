export const APP_NAME = "RL Stats Companion";
export const APP_VERSION = import.meta.env.PACKAGE_VERSION ?? "0.1.3";

export const MAX_EVENT_FEED_ITEMS = 100;
export const DEFAULT_DATA_RETENTION_DAYS = 90;

export const QUERY_STALE_TIME = {
  settings: Infinity,
  matches: 5 * 60 * 1000,
  matchDetail: 10 * 60 * 1000,
  analytics: 5 * 60 * 1000,
  live: 0,
} as const;

export const ROUTES = {
  live: "/",
  history: "/history",
  matchDetail: "/history/:matchId",
  analytics: "/analytics",
  proConfigs: "/pro-configs",
  settings: "/settings",
} as const;
