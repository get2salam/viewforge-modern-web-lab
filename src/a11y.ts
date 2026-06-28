export function trapFocus(container: HTMLElement): () => void {
  const focusable = getFocusableElements(container);
  if (focusable.length === 0) return () => {};

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  function onKeyDown(e: KeyboardEvent): void {
    if (e.key !== "Tab") return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  container.addEventListener("keydown", onKeyDown);
  return () => container.removeEventListener("keydown", onKeyDown);
}

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
}

export function announce(message: string, priority: "polite" | "assertive" = "polite"): void {
  const region = document.createElement("div");
  region.setAttribute("aria-live", priority);
  region.setAttribute("aria-atomic", "true");
  region.className = "sr-only";
  document.body.appendChild(region);

  requestAnimationFrame(() => {
    region.textContent = message;
    setTimeout(() => region.remove(), 3000);
  });
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function prefersHighContrast(): boolean {
  return window.matchMedia("(forced-colors: active)").matches;
}

export function enhanceKeyboardNavigation(list: HTMLElement): void {
  const items = () =>
    Array.from(list.querySelectorAll<HTMLElement>("[data-launch-id]"));

  list.addEventListener("keydown", (e) => {
    const ke = e as KeyboardEvent;
    const current = document.activeElement as HTMLElement | null;
    const all = items();
    const idx = current ? all.indexOf(current) : -1;

    if (ke.key === "ArrowDown" || ke.key === "ArrowRight") {
      ke.preventDefault();
      const next = all[(idx + 1) % all.length];
      next?.focus();
    } else if (ke.key === "ArrowUp" || ke.key === "ArrowLeft") {
      ke.preventDefault();
      const prev = all[(idx - 1 + all.length) % all.length];
      prev?.focus();
    } else if (ke.key === "Home") {
      ke.preventDefault();
      all[0]?.focus();
    } else if (ke.key === "End") {
      ke.preventDefault();
      all[all.length - 1]?.focus();
    }
  });
}
