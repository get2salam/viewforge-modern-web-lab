import type { AppState } from "./state.js";

export function initTheme(state: AppState): void {
  document.documentElement.setAttribute("data-theme", state.theme);
  listenSystemPreference(state);
  bindKeyboardShortcut(state);
}

function listenSystemPreference(state: AppState): void {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const savedTheme = localStorage.getItem("vf-lab-state-v1");
  if (!savedTheme) {
    state.theme = mq.matches ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", state.theme);
  }
}

function bindKeyboardShortcut(state: AppState): void {
  document.addEventListener("keydown", (e) => {
    if (e.key === "t" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const active = document.activeElement;
      const isInputActive =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLSelectElement;
      if (!isInputActive) {
        state.toggleTheme();
        document.getElementById("btn-theme")?.dispatchEvent(new CustomEvent("vf:theme-toggled"));
      }
    }
  });
}

export function applyThemeTransition(): void {
  document.documentElement.classList.add("theme-transitioning");
  setTimeout(() => {
    document.documentElement.classList.remove("theme-transitioning");
  }, 400);
}
