import { describe, expect, it } from "vitest";

import {
  APP_NAME,
  DEFAULT_DATA_RETENTION_DAYS,
  MAX_EVENT_FEED_ITEMS,
  QUERY_STALE_TIME,
  ROUTES,
} from "@/lib/constants";

describe("constants", () => {
  it("exposes the expected app metadata and defaults", () => {
    expect(APP_NAME).toBe("RL Stats Companion");
    expect(MAX_EVENT_FEED_ITEMS).toBe(100);
    expect(DEFAULT_DATA_RETENTION_DAYS).toBe(90);
  });

  it("keeps the core route map stable", () => {
    expect(ROUTES.live).toBe("/");
    expect(ROUTES.history).toBe("/history");
    expect(ROUTES.proConfigs).toBe("/pro-configs");
    expect(ROUTES.settings).toBe("/settings");
  });

  it("uses non-negative stale times", () => {
    expect(QUERY_STALE_TIME.settings).toBe(Infinity);
    expect(QUERY_STALE_TIME.matches).toBeGreaterThan(0);
    expect(QUERY_STALE_TIME.matchDetail).toBeGreaterThan(QUERY_STALE_TIME.matches);
    expect(QUERY_STALE_TIME.analytics).toBeGreaterThan(0);
    expect(QUERY_STALE_TIME.live).toBe(0);
  });
});
