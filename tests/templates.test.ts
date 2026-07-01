import { describe, it, expect } from "vitest";
import {
  LAUNCHES,
  SMOKE_LAUNCH_NAMES,
  getFilteredLaunches,
  buildDetailPanel,
  escapeHtml,
  sanitizeCssColor,
} from "../src/templates.js";
import { initState } from "../src/state.js";
import type { Launch } from "../src/state.js";
import { buildPreviewCard, renderPreviewCardHTML } from "../src/preview.js";
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

describe("security: escapeHtml", () => {
  it("escapes angle brackets", () => {
    expect(escapeHtml("<script>alert(1)</script>")).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('"value"')).toBe("&quot;value&quot;");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's here")).toBe("it&#x27;s here");
  });

  it("escapes ampersands before other replacements", () => {
    expect(escapeHtml("a&b")).toBe("a&amp;b");
  });

  it("leaves ordinary text unchanged", () => {
    expect(escapeHtml("Orbit Notes")).toBe("Orbit Notes");
  });

  it("neutralises attribute break-out payload by escaping quotes", () => {
    const payload = '" onmouseover="alert(1)';
    const escaped = escapeHtml(payload);
    // The double-quotes are encoded as entities, closing the attribute context is impossible.
    expect(escaped).not.toContain('"');
    expect(escaped).toContain("&quot;");
  });

  it("handles empty string", () => {
    expect(escapeHtml("")).toBe("");
  });
});

describe("security: sanitizeCssColor", () => {
  it("accepts a valid 6-digit hex color", () => {
    expect(sanitizeCssColor("#6c63ff")).toBe("#6c63ff");
  });

  it("accepts a valid 3-digit hex color", () => {
    expect(sanitizeCssColor("#f00")).toBe("#f00");
  });

  it("accepts uppercase hex digits", () => {
    expect(sanitizeCssColor("#FF0000")).toBe("#FF0000");
  });

  it("rejects named colors (no leading hash)", () => {
    expect(sanitizeCssColor("red")).toBe("#888888");
  });

  it("rejects CSS injection attempt", () => {
    expect(sanitizeCssColor("#fff; background:url(x)")).toBe("#888888");
  });

  it("rejects an empty string", () => {
    expect(sanitizeCssColor("")).toBe("#888888");
  });

  it("rejects 8-digit hex (non-standard length)", () => {
    expect(sanitizeCssColor("#6c63ff00")).toBe("#888888");
  });
});

describe("security: renderPreviewCardHTML XSS hardening", () => {
  const xssLaunch: Launch = {
    id: "xss-test",
    name: '<script>alert("xss")</script>',
    tagline: '"><img src=x onerror=alert(1)>',
    description: "<marquee>injected</marquee>",
    category: "Hacking & Injection",
    color: "#ff0000",
    emoji: "🔐",
    status: "live",
  };

  it("does not emit raw script tags in rendered HTML", () => {
    const html = renderPreviewCardHTML(buildPreviewCard(xssLaunch));
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("</script>");
  });

  it("does not emit a parseable <img> tag from the tagline payload", () => {
    const html = renderPreviewCardHTML(buildPreviewCard(xssLaunch));
    // The attack relies on an unescaped <img> breaking out of text context.
    // After escaping, only the entity form should appear.
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });

  it("emits escaped entities for the name field", () => {
    const html = renderPreviewCardHTML(buildPreviewCard(xssLaunch));
    expect(html).toContain("&lt;script&gt;");
  });

  it("escapes the tagline attribute break-out payload", () => {
    const html = renderPreviewCardHTML(buildPreviewCard(xssLaunch));
    expect(html).not.toContain('"><img');
  });

  it("sanitises an invalid CSS color to the safe fallback", () => {
    const badColor: Launch = { ...xssLaunch, color: "red; background:url(evil)" };
    const html = renderPreviewCardHTML(buildPreviewCard(badColor));
    expect(html).not.toContain("background:url(evil)");
    expect(html).toContain("--card-color: #888888");
  });
});
