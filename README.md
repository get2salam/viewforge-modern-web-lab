# ViewForge Modern Web Lab

A polished demo of modern Web Platform capabilities using TypeScript + Vite. Three sample product launches — **Orbit Notes**, **Pixel Pantry**, and **Garden Grid** — are composed and browsed through a command-palette–driven UI.

## Features

| Feature | Implementation |
|---------|---------------|
| **View Transitions API** | `src/viewTransitions.ts` — graceful fallback for unsupported browsers |
| **Command palette** | `src/commands.ts` — registerable command system + `Ctrl+K` shortcut |
| **Local-first state** | `src/state.ts` — theme & layout persist to `localStorage` |
| **Modern CSS** | `src/style.css` — `@layer`, CSS nesting, container queries, `color-mix`, custom props |
| **PWA shell** | `public/sw.js` + `public/manifest.webmanifest` + `src/pwa.ts` |
| **Accessibility** | `src/a11y.ts` — focus trap, arrow-key navigation, `aria-live` announcements |
| **Deterministic tests** | `tests/` — Vitest + jsdom, 70 unit tests |
| **Build smoke** | `scripts/smoke.mjs` — verifies `dist/` content after build |
| **CI** | `.github/workflows/ci.yml` — install → test → build → smoke |

## Quick start

```bash
npm install
npm run dev       # http://localhost:5173
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm test` | Run Vitest unit tests (70 tests) |
| `npm run build` | TypeScript check + Vite production build |
| `npm run smoke` | Verify `dist/` after build |
| `npm run preview` | Preview the production build |

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+K` / `⌘K` | Open command palette |
| `Esc` | Close command palette |
| `T` | Toggle light/dark theme |
| `L` | Toggle grid/list layout |
| `↑ ↓ ← →` | Navigate launch cards |

## Project structure

```
src/
  main.ts          — app entry point
  state.ts         — local-first state with localStorage persistence
  templates.ts     — launch data + HTML rendering
  commands.ts      — command registry + palette renderer
  theme.ts         — theme management + system-preference detection
  viewTransitions.ts — View Transitions API wrapper with fallback
  pwa.ts           — service worker registration + install prompt
  composer.ts      — launch composer controls and statistics
  preview.ts       — preview card rendering helpers
  a11y.ts          — focus trap, keyboard navigation, announcements
  smokeExpectations.ts — shared constants used in smoke tests
  style.css        — modern CSS using @layer, nesting, color-mix, container queries

tests/
  state.test.ts          — 23 tests for state management
  templates.test.ts      — 19 tests for launch data + filtering
  commands.test.ts       — 17 tests for command registry
  viewTransitions.test.ts — 11 tests for transitions + preview rendering

public/
  manifest.webmanifest   — PWA manifest
  sw.js                  — service worker (cache-first)
  favicon.svg

scripts/
  smoke.mjs              — post-build verification script
```

## CSS architecture

```css
@layer reset, tokens, base, layout, components, utilities;
```

- **tokens** — custom properties for color, spacing, type scale, radii, shadows
- **base** — minimal element resets + focus styles
- **layout** — sticky header, max-width main, footer
- **components** — cards, badges, command palette, composer, detail panel
- **utilities** — single-purpose helpers

Color mixing via `color-mix(in oklch, ...)` for tinted backgrounds and hover states.
Container queries on `.launches` enable the grid↔list card reflow.

## Browser support

Targets modern browsers (ES2022+). View Transitions degrade gracefully on unsupported browsers. PWA install is opt-in.

## License

[MIT](LICENSE)
