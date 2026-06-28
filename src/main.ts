import "./style.css";
import { initState } from "./state.js";
import { renderApp } from "./templates.js";
import { initTheme } from "./theme.js";
import { initCommands } from "./commands.js";
import { initPWA } from "./pwa.js";

function mount(): void {
  const root = document.getElementById("app");
  if (!root) throw new Error("Mount point #app not found");

  const state = initState();
  initTheme(state);
  initCommands(state);
  initPWA();
  renderApp(root, state);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
