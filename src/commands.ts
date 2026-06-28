import type { AppState } from "./state.js";
import { LAUNCHES } from "./templates.js";

export interface Command {
  id: string;
  label: string;
  shortcut?: string;
  group?: string;
  action: () => void;
}

export type CommandRegistry = Map<string, Command>;

let _registry: CommandRegistry | null = null;

export function initCommands(state: AppState): CommandRegistry {
  const registry: CommandRegistry = new Map();

  const register = (cmd: Command): void => {
    registry.set(cmd.id, cmd);
  };

  register({
    id: "toggle-theme",
    label: "Toggle theme (light/dark)",
    shortcut: "T",
    group: "Appearance",
    action: () => {
      state.toggleTheme();
      document.getElementById("app") && rerenderApp(state);
    },
  });

  register({
    id: "toggle-layout",
    label: "Toggle layout (grid/list)",
    shortcut: "L",
    group: "Appearance",
    action: () => {
      state.toggleLayout();
      rerenderApp(state);
    },
  });

  register({
    id: "filter-all",
    label: "Show all launches",
    group: "Filter",
    action: () => {
      state.setFilter("all");
      rerenderApp(state);
    },
  });

  register({
    id: "filter-live",
    label: "Filter: live launches",
    group: "Filter",
    action: () => {
      state.setFilter("live");
      rerenderApp(state);
    },
  });

  register({
    id: "filter-beta",
    label: "Filter: beta launches",
    group: "Filter",
    action: () => {
      state.setFilter("beta");
      rerenderApp(state);
    },
  });

  register({
    id: "filter-preview",
    label: "Filter: preview launches",
    group: "Filter",
    action: () => {
      state.setFilter("preview");
      rerenderApp(state);
    },
  });

  for (const launch of LAUNCHES) {
    register({
      id: `open-${launch.id}`,
      label: `Open: ${launch.name}`,
      group: "Launches",
      action: () => {
        state.setActiveLaunch(launch.id);
        rerenderApp(state);
      },
    });
  }

  register({
    id: "close-detail",
    label: "Close detail panel",
    group: "Navigation",
    action: () => {
      state.setActiveLaunch(null);
      rerenderApp(state);
    },
  });

  _registry = registry;

  bindGlobalShortcuts(state, registry);
  mountPaletteCallback(state, registry);

  return registry;
}

export function getRegistry(): CommandRegistry {
  return _registry ?? new Map();
}

export function searchCommands(registry: CommandRegistry, query: string): Command[] {
  const q = query.toLowerCase().trim();
  const results: Command[] = [];
  for (const cmd of registry.values()) {
    if (!q || cmd.label.toLowerCase().includes(q) || cmd.group?.toLowerCase().includes(q)) {
      results.push(cmd);
    }
  }
  return results;
}

function bindGlobalShortcuts(state: AppState, registry: CommandRegistry): void {
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      if (state.commandPaletteOpen) {
        state.closeCommandPalette();
      } else {
        state.openCommandPalette();
      }
      return;
    }
    if (e.key === "Escape" && state.commandPaletteOpen) {
      state.closeCommandPalette();
      return;
    }
    if (e.key === "l" && !e.ctrlKey && !e.metaKey) {
      const active = document.activeElement;
      const isInput =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement;
      if (!isInput) {
        registry.get("toggle-layout")?.action();
      }
    }
  });
}

function mountPaletteCallback(state: AppState, registry: CommandRegistry): void {
  const stateWithCallback = state as AppState & {
    _setPaletteCallback?: (cb: () => void) => void;
  };
  stateWithCallback._setPaletteCallback?.(() => {
    renderCommandPalette(state, registry);
  });
}

function renderCommandPalette(state: AppState, registry: CommandRegistry): void {
  const palette = document.getElementById("cmd-palette");
  if (!palette) return;

  if (!state.commandPaletteOpen) {
    palette.setAttribute("aria-hidden", "true");
    palette.innerHTML = "";
    document.body.style.overflow = "";
    return;
  }

  document.body.style.overflow = "hidden";
  palette.setAttribute("aria-hidden", "false");

  palette.innerHTML = `
    <div class="palette-backdrop" data-action="close-palette"></div>
    <div class="palette-modal" role="dialog" aria-modal="true" aria-label="Command palette">
      <div class="palette-search-wrap">
        <span class="palette-icon" aria-hidden="true">⌘</span>
        <input
          id="palette-input"
          class="palette-input"
          type="search"
          placeholder="Search commands…"
          autocomplete="off"
          aria-label="Search commands"
        />
        <kbd class="palette-esc-hint">ESC</kbd>
      </div>
      <ul class="palette-list" id="palette-list" role="listbox" aria-label="Commands">
        ${buildPaletteItems(searchCommands(registry, ""))}
      </ul>
    </div>
  `;

  const input = palette.querySelector<HTMLInputElement>("#palette-input");
  const list = palette.querySelector<HTMLUListElement>("#palette-list");

  input?.focus();

  input?.addEventListener("input", () => {
    if (list) {
      list.innerHTML = buildPaletteItems(searchCommands(registry, input.value));
    }
  });

  palette.querySelector("[data-action='close-palette']")?.addEventListener("click", () => {
    state.closeCommandPalette();
  });

  list?.addEventListener("click", (e) => {
    const item = (e.target as HTMLElement).closest("[data-cmd-id]") as HTMLElement | null;
    if (item?.dataset.cmdId) {
      const cmd = registry.get(item.dataset.cmdId);
      if (cmd) {
        state.closeCommandPalette();
        cmd.action();
      }
    }
  });
}

function buildPaletteItems(commands: Command[]): string {
  if (commands.length === 0) {
    return `<li class="palette-empty">No commands found</li>`;
  }

  const groups: Record<string, Command[]> = {};
  for (const cmd of commands) {
    const g = cmd.group ?? "General";
    if (!groups[g]) groups[g] = [];
    groups[g].push(cmd);
  }

  return Object.entries(groups)
    .map(
      ([group, cmds]) => `
    <li class="palette-group-label" role="presentation">${group}</li>
    ${cmds
      .map(
        (c) => `
      <li class="palette-item" data-cmd-id="${c.id}" role="option" tabindex="-1">
        <span class="palette-item-label">${c.label}</span>
        ${c.shortcut ? `<kbd class="palette-shortcut">${c.shortcut}</kbd>` : ""}
      </li>`
      )
      .join("")}
  `
    )
    .join("");
}

function rerenderApp(state: AppState): void {
  const root = document.getElementById("app");
  if (root) {
    import("./templates.js").then(({ renderApp }) => renderApp(root, state));
  }
}
