type TransitionCallback = () => void | Promise<void>;

export async function withViewTransition(
  callback: TransitionCallback,
  options: { types?: string[] } = {}
): Promise<void> {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void | Promise<void>) => { finished: Promise<void> };
  };

  if (!doc.startViewTransition) {
    await callback();
    return;
  }

  const transition = doc.startViewTransition(async () => {
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
  return typeof (
    document as Document & { startViewTransition?: unknown }
  ).startViewTransition === "function";
}

export function setViewTransitionName(element: HTMLElement, name: string): void {
  element.style.viewTransitionName = name;
}

export function clearViewTransitionName(element: HTMLElement): void {
  element.style.viewTransitionName = "none";
}
