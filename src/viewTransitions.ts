type TransitionCallback = () => void | Promise<void>;

interface ViewTransitionLike {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
}

declare global {
  interface Document {
    startViewTransition?: (cb: () => void | Promise<void>) => ViewTransitionLike;
  }
}

export async function withViewTransition(
  callback: TransitionCallback,
  options: { types?: string[] } = {}
): Promise<void> {
  if (!document.startViewTransition) {
    await callback();
    return;
  }

  const transition = document.startViewTransition(async () => {
    await callback();
  });

  if (options.types?.length) {
    document.documentElement.setAttribute("data-vt-type", options.types[0]);
  }

  try {
    await transition.finished;
  } finally {
    if (options.types?.length) {
      document.documentElement.removeAttribute("data-vt-type");
    }
  }
}

export function supportsViewTransitions(): boolean {
  return typeof document.startViewTransition === "function";
}

export function setViewTransitionName(element: HTMLElement, name: string): void {
  element.style.viewTransitionName = name;
}

export function clearViewTransitionName(element: HTMLElement): void {
  element.style.viewTransitionName = "none";
}
