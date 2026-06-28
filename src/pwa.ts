export function initPWA(): void {
  if ("serviceWorker" in navigator) {
    registerServiceWorker();
  }
  watchInstallPrompt();
}

async function registerServiceWorker(): Promise<void> {
  try {
    const reg = await navigator.serviceWorker.register("./sw.js", { scope: "./" });
    reg.addEventListener("updatefound", () => {
      const newWorker = reg.installing;
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            showUpdateToast();
          }
        });
      }
    });
  } catch {
    // SW registration non-critical — silently skip
  }
}

function watchInstallPrompt(): void {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    (window as Window & { _vfInstallPrompt?: Event })._vfInstallPrompt = e;
  });
}

export async function triggerInstallPrompt(): Promise<boolean> {
  const prompt = (window as Window & { _vfInstallPrompt?: BeforeInstallPromptEvent })
    ._vfInstallPrompt;
  if (!prompt) return false;
  await prompt.prompt();
  const { outcome } = await prompt.userChoice;
  return outcome === "accepted";
}

function showUpdateToast(): void {
  const region = document.getElementById("toast-region");
  if (!region) return;
  region.innerHTML = `
    <div class="toast">
      App updated — <button class="btn-link" onclick="location.reload()">Reload</button>
    </div>
  `;
  setTimeout(() => {
    region.innerHTML = "";
  }, 8000);
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
