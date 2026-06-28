import type { Command, CommandRegistry } from "./commands.js";

export interface PaletteGroup {
  label: string;
  commands: Command[];
}

export function groupCommands(commands: Command[]): PaletteGroup[] {
  const map = new Map<string, Command[]>();
  for (const cmd of commands) {
    const g = cmd.group ?? "General";
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(cmd);
  }
  return Array.from(map.entries()).map(([label, cmds]) => ({ label, commands: cmds }));
}

export function buildPaletteHTML(groups: PaletteGroup[]): string {
  if (groups.length === 0) {
    return `<li class="palette-empty" role="option">No commands found</li>`;
  }
  return groups
    .map(
      ({ label, commands }) => `
    <li class="palette-group-label" role="presentation">${label}</li>
    ${commands
      .map(
        (c) => `
      <li class="palette-item" data-cmd-id="${c.id}" role="option" tabindex="-1">
        <span class="palette-item-label">${c.label}</span>
        ${c.shortcut ? `<kbd class="palette-shortcut">${c.shortcut}</kbd>` : ""}
      </li>`
      )
      .join("")}`
    )
    .join("");
}

export function highlightMatch(text: string, query: string): string {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    text.slice(0, idx) +
    `<mark>${text.slice(idx, idx + query.length)}</mark>` +
    text.slice(idx + query.length)
  );
}

export function navigatePalette(
  list: HTMLElement,
  direction: "up" | "down"
): void {
  const items = Array.from(
    list.querySelectorAll<HTMLElement>(".palette-item")
  );
  if (items.length === 0) return;

  const current = document.activeElement as HTMLElement | null;
  const idx = current ? items.indexOf(current) : -1;

  if (direction === "down") {
    const next = idx === -1 || idx >= items.length - 1 ? 0 : idx + 1;
    items[next]?.focus();
  } else {
    const prev = idx <= 0 ? items.length - 1 : idx - 1;
    items[prev]?.focus();
  }
}
