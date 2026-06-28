import type { AppState, Launch } from "./state.js";

export const LAUNCHES: Launch[] = [
  {
    id: "orbit-notes",
    name: "Orbit Notes",
    tagline: "Capture ideas at the speed of thought",
    description:
      "A minimal, distraction-free note-taking app that syncs across all your devices using the Web Storage API.",
    category: "Productivity",
    color: "#6c63ff",
    emoji: "🪐",
    status: "live",
  },
  {
    id: "pixel-pantry",
    name: "Pixel Pantry",
    tagline: "Your digital pantry, beautifully organized",
    description:
      "Track your kitchen inventory with visual cards, expiry reminders, and smart shopping-list generation.",
    category: "Lifestyle",
    color: "#f97316",
    emoji: "🥑",
    status: "beta",
  },
  {
    id: "garden-grid",
    name: "Garden Grid",
    tagline: "Plan, plant, and grow — season after season",
    description:
      "An interactive garden planner with companion-planting guides, seasonal calendars, and harvest tracking.",
    category: "Outdoor",
    color: "#22c55e",
    emoji: "🌱",
    status: "preview",
  },
];

export const SMOKE_LAUNCH_NAMES = LAUNCHES.map((l) => l.name);

export function renderApp(root: HTMLElement, state: AppState): void {
  root.innerHTML = buildAppShell(state);
  attachInteractivity(root, state);
}

function buildAppShell(state: AppState): string {
  return `
    <header class="site-header">
      <div class="header-brand">
        <span class="brand-icon" aria-hidden="true">V</span>
        <span class="brand-name">ViewForge Lab</span>
      </div>
      <nav class="header-actions" aria-label="App controls">
        <button id="btn-theme" class="btn btn-ghost" aria-label="Toggle theme" title="Toggle theme (T)">
          <span aria-hidden="true">${state.theme === "dark" ? "☀️" : "🌙"}</span>
        </button>
        <button id="btn-layout" class="btn btn-ghost" aria-label="Toggle layout" title="Toggle layout (L)">
          <span aria-hidden="true">${state.layout === "grid" ? "⊟" : "⊞"}</span>
        </button>
        <button id="btn-cmd" class="btn btn-primary" aria-label="Open command palette (Ctrl+K)" title="Ctrl+K">
          <span aria-hidden="true">⌘</span> Commands
        </button>
      </nav>
    </header>

    <main class="site-main">
      <section class="hero" aria-labelledby="hero-title">
        <h1 id="hero-title">Launch Composer</h1>
        <p class="hero-sub">Explore three product launches built on native Web Platform APIs.</p>
      </section>

      <section class="composer" aria-label="Launch composer controls">
        ${buildComposer(state)}
      </section>

      <section class="launches ${state.layout === "grid" ? "launches--grid" : "launches--list"}"
               aria-label="Product launches">
        ${buildLaunchCards(state)}
      </section>

      <section class="detail-panel" id="detail-panel" aria-label="Launch detail" aria-live="polite">
        ${state.activeLaunchId ? buildDetailPanel(state) : ""}
      </section>
    </main>

    <footer class="site-footer">
      <p>ViewForge Modern Web Lab · Built with Vite + TypeScript + View Transitions</p>
    </footer>
  `;
}

function buildComposer(state: AppState): string {
  const filters = ["all", "live", "beta", "preview"];
  return `
    <div class="composer-inner">
      <label class="sr-only" for="filter-select">Filter by status</label>
      <div class="filter-pills" role="group" aria-label="Filter launches by status">
        ${filters
          .map(
            (f) =>
              `<button class="pill ${state.filter === f ? "pill--active" : ""}"
                data-filter="${f}"
                aria-pressed="${state.filter === f}">${f}</button>`
          )
          .join("")}
      </div>
      <div class="search-wrap">
        <label class="sr-only" for="search-input">Search launches</label>
        <input id="search-input" class="search-input" type="search"
               placeholder="Search launches…" value="${state.searchQuery}"
               aria-label="Search launches" />
      </div>
    </div>
  `;
}

function buildLaunchCards(state: AppState): string {
  const visible = getFilteredLaunches(state);
  if (visible.length === 0) {
    return `<p class="empty-state">No launches match your filter.</p>`;
  }
  return visible.map((l) => buildCard(l, state)).join("");
}

function buildCard(launch: Launch, state: AppState): string {
  const isActive = state.activeLaunchId === launch.id;
  return `
    <article class="launch-card ${isActive ? "launch-card--active" : ""}"
             data-launch-id="${launch.id}"
             style="--card-color: ${launch.color}"
             tabindex="0"
             role="button"
             aria-pressed="${isActive}"
             aria-label="View ${launch.name} details">
      <div class="card-emoji" aria-hidden="true">${launch.emoji}</div>
      <div class="card-body">
        <div class="card-meta">
          <span class="badge badge--${launch.status}">${launch.status}</span>
          <span class="card-category">${launch.category}</span>
        </div>
        <h2 class="card-title">${launch.name}</h2>
        <p class="card-tagline">${launch.tagline}</p>
      </div>
      <div class="card-footer">
        <span class="card-cta">View details →</span>
      </div>
    </article>
  `;
}

export function buildDetailPanel(state: AppState): string {
  const launch = LAUNCHES.find((l) => l.id === state.activeLaunchId);
  if (!launch) return "";
  return `
    <div class="detail-inner" style="--card-color: ${launch.color}">
      <button class="btn btn-ghost detail-close" data-action="close-detail" aria-label="Close detail panel">✕</button>
      <div class="detail-header">
        <span class="detail-emoji" aria-hidden="true">${launch.emoji}</span>
        <div>
          <h2 class="detail-title">${launch.name}</h2>
          <span class="badge badge--${launch.status}">${launch.status}</span>
        </div>
      </div>
      <p class="detail-tagline">${launch.tagline}</p>
      <p class="detail-description">${launch.description}</p>
      <dl class="detail-meta">
        <dt>Category</dt><dd>${launch.category}</dd>
        <dt>Status</dt><dd>${launch.status}</dd>
      </dl>
    </div>
  `;
}

export function getFilteredLaunches(state: AppState): Launch[] {
  return LAUNCHES.filter((l) => {
    const matchesFilter = state.filter === "all" || l.status === state.filter;
    const q = state.searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      l.name.toLowerCase().includes(q) ||
      l.tagline.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });
}

function attachInteractivity(root: HTMLElement, state: AppState): void {
  root.querySelector("#btn-theme")?.addEventListener("click", () => {
    state.toggleTheme();
    renderApp(root, state);
  });

  root.querySelector("#btn-layout")?.addEventListener("click", () => {
    state.toggleLayout();
    renderApp(root, state);
  });

  root.querySelector("#btn-cmd")?.addEventListener("click", () => {
    state.openCommandPalette();
  });

  root.querySelector(".filter-pills")?.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest("[data-filter]") as HTMLElement | null;
    if (btn?.dataset.filter) {
      state.setFilter(btn.dataset.filter as AppState["filter"]);
      renderApp(root, state);
    }
  });

  const searchInput = root.querySelector<HTMLInputElement>("#search-input");
  searchInput?.addEventListener("input", () => {
    state.searchQuery = searchInput.value;
    renderApp(root, state);
  });

  root.querySelector(".launches")?.addEventListener("click", (e) => {
    const card = (e.target as HTMLElement).closest("[data-launch-id]") as HTMLElement | null;
    if (card?.dataset.launchId) {
      state.setActiveLaunch(card.dataset.launchId);
      renderApp(root, state);
    }
  });

  root.querySelector(".launches")?.addEventListener("keydown", (e) => {
    const ke = e as KeyboardEvent;
    if (ke.key === "Enter" || ke.key === " ") {
      const card = (ke.target as HTMLElement).closest("[data-launch-id]") as HTMLElement | null;
      if (card?.dataset.launchId) {
        ke.preventDefault();
        state.setActiveLaunch(card.dataset.launchId);
        renderApp(root, state);
      }
    }
  });

  root.querySelector("[data-action='close-detail']")?.addEventListener("click", () => {
    state.setActiveLaunch(null);
    renderApp(root, state);
  });
}
