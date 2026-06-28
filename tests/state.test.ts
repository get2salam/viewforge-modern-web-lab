import { describe, it, expect, beforeEach, vi } from "vitest";
import { initState, getPersistedTheme } from "../src/state.js";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("initState", () => {
  it("defaults to light theme", () => {
    const state = initState();
    expect(state.theme).toBe("light");
  });

  it("defaults to grid layout", () => {
    const state = initState();
    expect(state.layout).toBe("grid");
  });

  it("defaults filter to all", () => {
    const state = initState();
    expect(state.filter).toBe("all");
  });

  it("defaults searchQuery to empty string", () => {
    const state = initState();
    expect(state.searchQuery).toBe("");
  });

  it("defaults activeLaunchId to null", () => {
    const state = initState();
    expect(state.activeLaunchId).toBeNull();
  });

  it("sets data-theme attribute on html element", () => {
    initState();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});

describe("toggleTheme", () => {
  it("switches light to dark", () => {
    const state = initState();
    expect(state.theme).toBe("light");
    state.toggleTheme();
    expect(state.theme).toBe("dark");
  });

  it("switches dark to light", () => {
    localStorage.setItem("vf-lab-state-v1", JSON.stringify({ theme: "dark", layout: "grid" }));
    const state = initState();
    state.toggleTheme();
    expect(state.theme).toBe("light");
  });

  it("updates data-theme attribute", () => {
    const state = initState();
    state.toggleTheme();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("persists to localStorage", () => {
    const state = initState();
    state.toggleTheme();
    const raw = localStorage.getItem("vf-lab-state-v1");
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.theme).toBe("dark");
  });
});

describe("toggleLayout", () => {
  it("switches grid to list", () => {
    const state = initState();
    expect(state.layout).toBe("grid");
    state.toggleLayout();
    expect(state.layout).toBe("list");
  });

  it("switches list to grid", () => {
    const state = initState();
    state.toggleLayout();
    state.toggleLayout();
    expect(state.layout).toBe("grid");
  });

  it("persists layout", () => {
    const state = initState();
    state.toggleLayout();
    const parsed = JSON.parse(localStorage.getItem("vf-lab-state-v1")!);
    expect(parsed.layout).toBe("list");
  });
});

describe("setFilter", () => {
  it("updates the filter", () => {
    const state = initState();
    state.setFilter("beta");
    expect(state.filter).toBe("beta");
  });
});

describe("setActiveLaunch", () => {
  it("sets an active launch by id", () => {
    const state = initState();
    state.setActiveLaunch("orbit-notes");
    expect(state.activeLaunchId).toBe("orbit-notes");
  });

  it("clears with null", () => {
    const state = initState();
    state.setActiveLaunch("orbit-notes");
    state.setActiveLaunch(null);
    expect(state.activeLaunchId).toBeNull();
  });
});

describe("persist / load", () => {
  it("restores theme and layout from localStorage", () => {
    localStorage.setItem(
      "vf-lab-state-v1",
      JSON.stringify({ theme: "dark", layout: "list" })
    );
    const state = initState();
    expect(state.theme).toBe("dark");
    expect(state.layout).toBe("list");
  });

  it("handles malformed JSON gracefully", () => {
    localStorage.setItem("vf-lab-state-v1", "not-json");
    expect(() => initState()).not.toThrow();
  });
});

describe("getPersistedTheme", () => {
  it("returns light when nothing stored", () => {
    expect(getPersistedTheme()).toBe("light");
  });

  it("returns stored theme", () => {
    localStorage.setItem("vf-lab-state-v1", JSON.stringify({ theme: "dark" }));
    expect(getPersistedTheme()).toBe("dark");
  });
});

describe("commandPalette", () => {
  it("defaults to closed", () => {
    const state = initState();
    expect(state.commandPaletteOpen).toBe(false);
  });

  it("opens via openCommandPalette", () => {
    const state = initState();
    state.openCommandPalette();
    expect(state.commandPaletteOpen).toBe(true);
  });

  it("closes via closeCommandPalette", () => {
    const state = initState();
    state.openCommandPalette();
    state.closeCommandPalette();
    expect(state.commandPaletteOpen).toBe(false);
  });
});
