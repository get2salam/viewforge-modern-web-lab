export interface Launch {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  color: string;
  emoji: string;
  status: "live" | "beta" | "preview";
}

export interface AppState {
  theme: "light" | "dark";
  layout: "grid" | "list";
  filter: "all" | "live" | "beta" | "preview";
  searchQuery: string;
  activeLaunchId: string | null;
  commandPaletteOpen: boolean;

  toggleTheme(): void;
  toggleLayout(): void;
  setFilter(f: AppState["filter"]): void;
  setActiveLaunch(id: string | null): void;
  openCommandPalette(): void;
  closeCommandPalette(): void;
  persist(): void;
}

const STORAGE_KEY = "vf-lab-state-v1";

interface PersistedState {
  theme: "light" | "dark";
  layout: "grid" | "list";
}

function loadPersisted(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { theme: "light", layout: "grid" };
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      theme: parsed.theme === "dark" ? "dark" : "light",
      layout: parsed.layout === "list" ? "list" : "grid",
    };
  } catch {
    return { theme: "light", layout: "grid" };
  }
}

export function initState(): AppState {
  const saved = loadPersisted();

  let _commandPaletteOpen = false;
  let _onPaletteChange: (() => void) | null = null;

  const state: AppState = {
    theme: saved.theme,
    layout: saved.layout,
    filter: "all",
    searchQuery: "",
    activeLaunchId: null,
    get commandPaletteOpen() {
      return _commandPaletteOpen;
    },

    toggleTheme() {
      this.theme = this.theme === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", this.theme);
      this.persist();
    },

    toggleLayout() {
      this.layout = this.layout === "grid" ? "list" : "grid";
      this.persist();
    },

    setFilter(f) {
      this.filter = f;
    },

    setActiveLaunch(id) {
      this.activeLaunchId = id;
    },

    openCommandPalette() {
      _commandPaletteOpen = true;
      _onPaletteChange?.();
    },

    closeCommandPalette() {
      _commandPaletteOpen = false;
      _onPaletteChange?.();
    },

    persist() {
      try {
        const data: PersistedState = { theme: this.theme, layout: this.layout };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // storage unavailable
      }
    },
  };

  document.documentElement.setAttribute("data-theme", state.theme);

  (state as AppState & { _setPaletteCallback: (cb: () => void) => void })._setPaletteCallback = (
    cb: () => void
  ) => {
    _onPaletteChange = cb;
  };

  return state;
}

export function getPersistedTheme(): "light" | "dark" {
  return loadPersisted().theme;
}
