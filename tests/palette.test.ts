import { describe, it, expect, beforeEach } from "vitest";
import {
  groupCommands,
  buildPaletteHTML,
  highlightMatch,
  navigatePalette,
} from "../src/palette.js";
import type { Command } from "../src/commands.js";

const makeCmd = (overrides: { id: string; label: string; group?: string; shortcut?: string }): Command => ({
  action: () => {},
  ...overrides,
});

// ---------------------------------------------------------------------------
// groupCommands
// ---------------------------------------------------------------------------

describe("groupCommands", () => {
  it("returns empty array for empty input", () => {
    expect(groupCommands([])).toEqual([]);
  });

  it("groups commands by their group label", () => {
    const cmds = [
      makeCmd({ id: "a", label: "A", group: "Appearance" }),
      makeCmd({ id: "b", label: "B", group: "Filter" }),
      makeCmd({ id: "c", label: "C", group: "Appearance" }),
    ];
    const groups = groupCommands(cmds);
    expect(groups).toHaveLength(2);
    expect(groups[0].label).toBe("Appearance");
    expect(groups[0].commands).toHaveLength(2);
    expect(groups[1].label).toBe("Filter");
    expect(groups[1].commands).toHaveLength(1);
  });

  it("uses 'General' as fallback group for ungrouped commands", () => {
    const cmds = [makeCmd({ id: "x", label: "X" })];
    const groups = groupCommands(cmds);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe("General");
  });

  it("preserves insertion order of groups", () => {
    const cmds = [
      makeCmd({ id: "f", label: "F", group: "Filter" }),
      makeCmd({ id: "a", label: "A", group: "Appearance" }),
    ];
    const groups = groupCommands(cmds);
    expect(groups[0].label).toBe("Filter");
    expect(groups[1].label).toBe("Appearance");
  });

  it("preserves command order within a group", () => {
    const cmds = [
      makeCmd({ id: "first", label: "First", group: "Nav" }),
      makeCmd({ id: "second", label: "Second", group: "Nav" }),
    ];
    const [group] = groupCommands(cmds);
    expect(group.commands[0].id).toBe("first");
    expect(group.commands[1].id).toBe("second");
  });
});

// ---------------------------------------------------------------------------
// buildPaletteHTML
// ---------------------------------------------------------------------------

describe("buildPaletteHTML", () => {
  it("returns a no-result item when groups array is empty", () => {
    const html = buildPaletteHTML([]);
    expect(html).toContain("No commands found");
    expect(html).toContain('role="option"');
  });

  it("renders group labels with role=presentation", () => {
    const groups = [{ label: "Appearance", commands: [makeCmd({ id: "t", label: "Toggle theme" })] }];
    const html = buildPaletteHTML(groups);
    expect(html).toContain("Appearance");
    expect(html).toContain('role="presentation"');
  });

  it("sets data-cmd-id attribute on each command item", () => {
    const groups = [{ label: "G", commands: [makeCmd({ id: "toggle-theme", label: "Toggle theme" })] }];
    const html = buildPaletteHTML(groups);
    expect(html).toContain('data-cmd-id="toggle-theme"');
  });

  it("renders kbd shortcut when command has shortcut", () => {
    const groups = [{ label: "G", commands: [makeCmd({ id: "s", label: "Save", shortcut: "T" })] }];
    const html = buildPaletteHTML(groups);
    expect(html).toContain("<kbd");
    expect(html).toContain(">T<");
  });

  it("omits kbd element when command has no shortcut", () => {
    const groups = [{ label: "G", commands: [makeCmd({ id: "s", label: "No shortcut" })] }];
    const html = buildPaletteHTML(groups);
    expect(html).not.toContain("<kbd");
  });

  it("assigns role=option to each command list item", () => {
    const groups = [
      { label: "G", commands: [makeCmd({ id: "x", label: "X" }), makeCmd({ id: "y", label: "Y" })] },
    ];
    const html = buildPaletteHTML(groups);
    expect((html.match(/role="option"/g) ?? []).length).toBe(2);
  });

  it("renders command label text in each item", () => {
    const groups = [{ label: "G", commands: [makeCmd({ id: "z", label: "Close detail panel" })] }];
    const html = buildPaletteHTML(groups);
    expect(html).toContain("Close detail panel");
  });
});

// ---------------------------------------------------------------------------
// highlightMatch
// ---------------------------------------------------------------------------

describe("highlightMatch", () => {
  it("returns text unchanged for empty query", () => {
    expect(highlightMatch("Toggle theme", "")).toBe("Toggle theme");
  });

  it("wraps matched substring in <mark> tag", () => {
    expect(highlightMatch("Toggle theme", "theme")).toBe("Toggle <mark>theme</mark>");
  });

  it("is case-insensitive when matching", () => {
    const result = highlightMatch("Toggle Theme", "theme");
    expect(result).toContain("<mark>");
  });

  it("preserves original casing of the matched text inside <mark>", () => {
    const result = highlightMatch("Toggle Theme", "theme");
    expect(result).toContain("<mark>Theme</mark>");
  });

  it("returns text unchanged when query has no match", () => {
    expect(highlightMatch("Toggle theme", "xyz")).toBe("Toggle theme");
  });

  it("handles match at the start of the string", () => {
    expect(highlightMatch("theme toggle", "theme")).toBe("<mark>theme</mark> toggle");
  });

  it("handles match at the end of the string", () => {
    const result = highlightMatch("Toggle theme", "theme");
    expect(result.endsWith("<mark>theme</mark>")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// navigatePalette
// ---------------------------------------------------------------------------

describe("navigatePalette", () => {
  function makeList(count: number): HTMLElement {
    const ul = document.createElement("ul");
    for (let i = 0; i < count; i++) {
      const li = document.createElement("li");
      li.className = "palette-item";
      li.setAttribute("tabindex", "-1");
      ul.appendChild(li);
    }
    document.body.appendChild(ul);
    return ul;
  }

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("does nothing and does not throw when list has no items", () => {
    const ul = makeList(0);
    expect(() => navigatePalette(ul, "down")).not.toThrow();
  });

  it("focuses the first item on 'down' when nothing is active", () => {
    const ul = makeList(3);
    navigatePalette(ul, "down");
    expect(document.activeElement).toBe(ul.querySelectorAll(".palette-item")[0]);
  });

  it("advances to the next item on 'down'", () => {
    const ul = makeList(3);
    const items = ul.querySelectorAll<HTMLElement>(".palette-item");
    items[0].focus();
    navigatePalette(ul, "down");
    expect(document.activeElement).toBe(items[1]);
  });

  it("wraps from last to first item on 'down'", () => {
    const ul = makeList(3);
    const items = ul.querySelectorAll<HTMLElement>(".palette-item");
    items[2].focus();
    navigatePalette(ul, "down");
    expect(document.activeElement).toBe(items[0]);
  });

  it("focuses the last item on 'up' when nothing is active", () => {
    const ul = makeList(3);
    const items = ul.querySelectorAll<HTMLElement>(".palette-item");
    navigatePalette(ul, "up");
    expect(document.activeElement).toBe(items[2]);
  });

  it("moves to the previous item on 'up'", () => {
    const ul = makeList(3);
    const items = ul.querySelectorAll<HTMLElement>(".palette-item");
    items[2].focus();
    navigatePalette(ul, "up");
    expect(document.activeElement).toBe(items[1]);
  });

  it("wraps from first to last item on 'up'", () => {
    const ul = makeList(3);
    const items = ul.querySelectorAll<HTMLElement>(".palette-item");
    items[0].focus();
    navigatePalette(ul, "up");
    expect(document.activeElement).toBe(items[2]);
  });
});
