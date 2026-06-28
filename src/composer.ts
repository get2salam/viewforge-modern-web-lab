import type { AppState } from "./state.js";
import { LAUNCHES, getFilteredLaunches } from "./templates.js";

export type ComposerMode = "browse" | "compose" | "preview";

export interface ComposerState {
  mode: ComposerMode;
  selectedIds: Set<string>;
  layoutDensity: "comfortable" | "compact";
}

export function createComposerState(): ComposerState {
  return {
    mode: "browse",
    selectedIds: new Set(),
    layoutDensity: "comfortable",
  };
}

export function getComposerStats(appState: AppState): {
  total: number;
  visible: number;
  live: number;
  beta: number;
  preview: number;
} {
  const visible = getFilteredLaunches(appState);
  return {
    total: LAUNCHES.length,
    visible: visible.length,
    live: visible.filter((l) => l.status === "live").length,
    beta: visible.filter((l) => l.status === "beta").length,
    preview: visible.filter((l) => l.status === "preview").length,
  };
}

export function buildStatsBar(appState: AppState): string {
  const stats = getComposerStats(appState);
  return `
    <div class="stats-bar" aria-label="Launch statistics">
      <span class="stat">
        <span class="stat-value">${stats.total}</span>
        <span class="stat-label">Total</span>
      </span>
      <span class="stat">
        <span class="stat-value">${stats.visible}</span>
        <span class="stat-label">Visible</span>
      </span>
      <span class="stat stat--live">
        <span class="stat-value">${stats.live}</span>
        <span class="stat-label">Live</span>
      </span>
      <span class="stat stat--beta">
        <span class="stat-value">${stats.beta}</span>
        <span class="stat-label">Beta</span>
      </span>
      <span class="stat stat--preview">
        <span class="stat-value">${stats.preview}</span>
        <span class="stat-label">Preview</span>
      </span>
    </div>
  `;
}

export function sortLaunches(
  launches: ReturnType<typeof getFilteredLaunches>,
  by: "name" | "status" | "category" = "name"
): ReturnType<typeof getFilteredLaunches> {
  return [...launches].sort((a, b) => {
    if (by === "status") {
      const order = { live: 0, beta: 1, preview: 2 };
      return order[a.status] - order[b.status];
    }
    return a[by].localeCompare(b[by]);
  });
}
