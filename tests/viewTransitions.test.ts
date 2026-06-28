import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  withViewTransition,
  supportsViewTransitions,
  setViewTransitionName,
  clearViewTransitionName,
} from "../src/viewTransitions.js";

type DocWithVT = Document & { startViewTransition?: unknown };

describe("supportsViewTransitions", () => {
  it("returns false when document.startViewTransition is absent", () => {
    const original = (document as DocWithVT).startViewTransition;
    delete (document as DocWithVT).startViewTransition;
    expect(supportsViewTransitions()).toBe(false);
    if (original !== undefined) {
      (document as DocWithVT).startViewTransition = original;
    }
  });

  it("returns true when document.startViewTransition is a function", () => {
    (document as DocWithVT).startViewTransition = vi.fn(() => ({
      ready: Promise.resolve(),
      finished: Promise.resolve(),
      updateCallbackDone: Promise.resolve(),
    }));
    expect(supportsViewTransitions()).toBe(true);
    delete (document as DocWithVT).startViewTransition;
  });
});

describe("withViewTransition (no API)", () => {
  beforeEach(() => {
    delete (document as DocWithVT).startViewTransition;
  });

  it("executes callback when API is absent", async () => {
    const cb = vi.fn();
    await withViewTransition(cb);
    expect(cb).toHaveBeenCalledOnce();
  });

  it("resolves even without View Transitions API", async () => {
    await expect(withViewTransition(async () => {})).resolves.toBeUndefined();
  });
});

describe("withViewTransition (with API)", () => {
  it("calls startViewTransition and awaits finished", async () => {
    const mockTransition = {
      ready: Promise.resolve(),
      finished: Promise.resolve(),
      updateCallbackDone: Promise.resolve(),
    };
    const startVT = vi.fn(async (cb: () => void | Promise<void>) => {
      await cb();
      return mockTransition;
    });
    (document as DocWithVT).startViewTransition = startVT;

    const cb = vi.fn();
    await withViewTransition(cb);
    expect(cb).toHaveBeenCalledOnce();
    expect(startVT).toHaveBeenCalledOnce();

    delete (document as DocWithVT).startViewTransition;
  });
});

describe("setViewTransitionName / clearViewTransitionName", () => {
  it("sets view-transition-name style", () => {
    const el = document.createElement("div");
    setViewTransitionName(el, "card-orbit");
    expect(el.style.viewTransitionName).toBe("card-orbit");
  });

  it("clears view-transition-name to none", () => {
    const el = document.createElement("div");
    setViewTransitionName(el, "card-orbit");
    clearViewTransitionName(el);
    expect(el.style.viewTransitionName).toBe("none");
  });
});

describe("preview rendering", () => {
  it("buildPreviewCard constructs a card object", async () => {
    const { buildPreviewCard } = await import("../src/preview.js");
    const { LAUNCHES } = await import("../src/templates.js");
    const card = buildPreviewCard(LAUNCHES[0]);
    expect(card.launch.name).toBe("Orbit Notes");
    expect(card.ctaLabel).toBe("Get started →");
  });

  it("buildPreviewCard for beta uses join beta CTA", async () => {
    const { buildPreviewCard } = await import("../src/preview.js");
    const { LAUNCHES } = await import("../src/templates.js");
    const card = buildPreviewCard(LAUNCHES[1]);
    expect(card.ctaLabel).toBe("Join beta →");
  });

  it("buildPreviewCard for preview uses early access CTA", async () => {
    const { buildPreviewCard } = await import("../src/preview.js");
    const { LAUNCHES } = await import("../src/templates.js");
    const card = buildPreviewCard(LAUNCHES[2]);
    expect(card.ctaLabel).toBe("Request early access →");
  });

  it("renderPreviewCardHTML returns HTML containing launch name", async () => {
    const { buildPreviewCard, renderPreviewCardHTML } = await import("../src/preview.js");
    const { LAUNCHES } = await import("../src/templates.js");
    const card = buildPreviewCard(LAUNCHES[0]);
    const html = renderPreviewCardHTML(card);
    expect(html).toContain("Orbit Notes");
  });
});
