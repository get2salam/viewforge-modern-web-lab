import { describe, it, expect, beforeEach, vi } from "vitest";
import { initCommands, searchCommands, getRegistry } from "../src/commands.js";
import { initState } from "../src/state.js";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.body.innerHTML = '<div id="app"></div><div id="cmd-palette" aria-hidden="true"></div>';
});

describe("initCommands", () => {
  it("returns a non-empty registry", () => {
    const state = initState();
    const registry = initCommands(state);
    expect(registry.size).toBeGreaterThan(0);
  });

  it("registers toggle-theme command", () => {
    const state = initState();
    const registry = initCommands(state);
    expect(registry.has("toggle-theme")).toBe(true);
  });

  it("registers toggle-layout command", () => {
    const state = initState();
    const registry = initCommands(state);
    expect(registry.has("toggle-layout")).toBe(true);
  });

  it("registers filter commands", () => {
    const state = initState();
    const registry = initCommands(state);
    expect(registry.has("filter-all")).toBe(true);
    expect(registry.has("filter-live")).toBe(true);
    expect(registry.has("filter-beta")).toBe(true);
    expect(registry.has("filter-preview")).toBe(true);
  });

  it("registers open commands for all 3 launches", () => {
    const state = initState();
    const registry = initCommands(state);
    expect(registry.has("open-orbit-notes")).toBe(true);
    expect(registry.has("open-pixel-pantry")).toBe(true);
    expect(registry.has("open-garden-grid")).toBe(true);
  });

  it("each command has a label and action", () => {
    const state = initState();
    const registry = initCommands(state);
    for (const [, cmd] of registry) {
      expect(cmd.label).toBeTruthy();
      expect(typeof cmd.action).toBe("function");
    }
  });
});

describe("searchCommands", () => {
  it("returns all commands for empty query", () => {
    const state = initState();
    const registry = initCommands(state);
    const results = searchCommands(registry, "");
    expect(results.length).toBe(registry.size);
  });

  it("filters by label text", () => {
    const state = initState();
    const registry = initCommands(state);
    const results = searchCommands(registry, "theme");
    expect(results.some((c) => c.id === "toggle-theme")).toBe(true);
  });

  it("filters by group text", () => {
    const state = initState();
    const registry = initCommands(state);
    const results = searchCommands(registry, "Filter");
    expect(results.every((c) => c.group === "Filter")).toBe(true);
    expect(results.length).toBeGreaterThanOrEqual(4);
  });

  it("returns empty array for no match", () => {
    const state = initState();
    const registry = initCommands(state);
    const results = searchCommands(registry, "xyzunmatchedquery");
    expect(results).toHaveLength(0);
  });

  it("search is case-insensitive", () => {
    const state = initState();
    const registry = initCommands(state);
    const upper = searchCommands(registry, "THEME");
    const lower = searchCommands(registry, "theme");
    expect(upper.length).toBe(lower.length);
  });
});

describe("command actions", () => {
  it("toggle-theme action flips state.theme", () => {
    const state = initState();
    const registry = initCommands(state);
    expect(state.theme).toBe("light");
    registry.get("toggle-theme")!.action();
    expect(state.theme).toBe("dark");
  });

  it("toggle-layout action flips state.layout", () => {
    const state = initState();
    const registry = initCommands(state);
    expect(state.layout).toBe("grid");
    registry.get("toggle-layout")!.action();
    expect(state.layout).toBe("list");
  });

  it("filter-live sets state.filter", () => {
    const state = initState();
    const registry = initCommands(state);
    registry.get("filter-live")!.action();
    expect(state.filter).toBe("live");
  });

  it("open-orbit-notes sets activeLaunchId", () => {
    const state = initState();
    const registry = initCommands(state);
    registry.get("open-orbit-notes")!.action();
    expect(state.activeLaunchId).toBe("orbit-notes");
  });

  it("close-detail clears activeLaunchId", () => {
    const state = initState();
    state.setActiveLaunch("orbit-notes");
    const registry = initCommands(state);
    registry.get("close-detail")!.action();
    expect(state.activeLaunchId).toBeNull();
  });
});

describe("getRegistry", () => {
  it("returns the last initialized registry", () => {
    const state = initState();
    initCommands(state);
    const reg = getRegistry();
    expect(reg.size).toBeGreaterThan(0);
  });
});
