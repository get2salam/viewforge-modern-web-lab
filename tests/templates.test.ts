import { describe, it, expect } from "vitest";
import {
  LAUNCHES,
  SMOKE_LAUNCH_NAMES,
  getFilteredLaunches,
  buildDetailPanel,
} from "../src/templates.js";
import { initState } from "../src/state.js";
import {
  EXPECTED_LAUNCH_NAMES,
  EXPECTED_LAUNCH_IDS,
  EXPECTED_CATEGORIES,
  EXPECTED_STATUSES,
} from "../src/smokeExpectations.js";

describe("LAUNCHES data", () => {
  it("has exactly 3 launches", () => {
    expect(LAUNCHES).toHaveLength(3);
  });

  it("has correct names", () => {
    const names = LAUNCHES.map((l) => l.name);
    expect(names).toEqual(Array.from(EXPECTED_LAUNCH_NAMES));
  });

  it("has correct ids", () => {
    const ids = LAUNCHES.map((l) => l.id);
    expect(ids).toEqual(Array.from(EXPECTED_LAUNCH_IDS));
  });

  it("has correct categories", () => {
    const cats = LAUNCHES.map((l) => l.category);
    expect(cats).toEqual(Array.from(EXPECTED_CATEGORIES));
  });

  it("has correct statuses", () => {
    const statuses = LAUNCHES.map((l) => l.status);
    expect(statuses).toEqual(Array.from(EXPECTED_STATUSES));
  });

  it("each launch has a non-empty emoji", () => {
    for (const l of LAUNCHES) {
      expect(l.emoji.length).toBeGreaterThan(0);
    }
  });

  it("each launch has a valid color hex", () => {
    for (const l of LAUNCHES) {
      expect(l.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe("SMOKE_LAUNCH_NAMES", () => {
  it("matches LAUNCHES names in order", () => {
    expect(SMOKE_LAUNCH_NAMES).toEqual(LAUNCHES.map((l) => l.name));
  });
});

describe("getFilteredLaunches", () => {
  it("returns all launches for filter=all", () => {
    const state = initState();
    expect(getFilteredLaunches(state)).toHaveLength(3);
  });

  it("filters by status=live", () => {
    const state = initState();
    state.setFilter("live");
    const results = getFilteredLaunches(state);
    expect(results.every((l) => l.status === "live")).toBe(true);
    expect(results).toHaveLength(1);
  });

  it("filters by status=beta", () => {
    const state = initState();
    state.setFilter("beta");
    const results = getFilteredLaunches(state);
    expect(results.every((l) => l.status === "beta")).toBe(true);
    expect(results).toHaveLength(1);
  });

  it("filters by status=preview", () => {
    const state = initState();
    state.setFilter("preview");
    const results = getFilteredLaunches(state);
    expect(results.every((l) => l.status === "preview")).toBe(true);
    expect(results).toHaveLength(1);
  });

  it("filters by search query (case-insensitive name match)", () => {
    const state = initState();
    state.searchQuery = "orbit";
    const results = getFilteredLaunches(state);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Orbit Notes");
  });

  it("filters by search query (tagline match)", () => {
    const state = initState();
    state.searchQuery = "pantry";
    const results = getFilteredLaunches(state);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("pixel-pantry");
  });

  it("returns empty array when no match", () => {
    const state = initState();
    state.searchQuery = "xyznonexistent";
    expect(getFilteredLaunches(state)).toHaveLength(0);
  });

  it("combines filter and search", () => {
    const state = initState();
    state.setFilter("live");
    state.searchQuery = "orbit";
    const results = getFilteredLaunches(state);
    expect(results).toHaveLength(1);
  });
});

describe("buildDetailPanel", () => {
  it("returns empty string when no activeLaunchId", () => {
    const state = initState();
    expect(buildDetailPanel(state)).toBe("");
  });

  it("returns HTML with launch name when activeLaunchId is set", () => {
    const state = initState();
    state.setActiveLaunch("orbit-notes");
    const html = buildDetailPanel(state);
    expect(html).toContain("Orbit Notes");
    expect(html).toContain("live");
  });

  it("includes the category in the detail panel", () => {
    const state = initState();
    state.setActiveLaunch("pixel-pantry");
    const html = buildDetailPanel(state);
    expect(html).toContain("Lifestyle");
  });
});
