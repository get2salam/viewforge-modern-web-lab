import type { Launch } from "./state.js";
import { escapeHtml, sanitizeCssColor } from "./templates.js";

export interface PreviewCard {
  launch: Launch;
  highlightColor: string;
  accentText: string;
  ctaLabel: string;
}

export function buildPreviewCard(launch: Launch): PreviewCard {
  return {
    launch,
    highlightColor: launch.color,
    accentText: launch.tagline,
    ctaLabel: ctaForStatus(launch.status),
  };
}

function ctaForStatus(status: Launch["status"]): string {
  const labels: Record<Launch["status"], string> = {
    live: "Get started →",
    beta: "Join beta →",
    preview: "Request early access →",
  };
  return labels[status];
}

export function renderPreviewCardHTML(card: PreviewCard): string {
  const { launch, highlightColor, ctaLabel } = card;
  return `
    <div class="preview-card" style="--card-color: ${sanitizeCssColor(highlightColor)}" aria-label="Preview: ${escapeHtml(launch.name)}">
      <div class="preview-card-glow" aria-hidden="true"></div>
      <header class="preview-card-header">
        <div class="preview-card-emoji" aria-hidden="true">${launch.emoji}</div>
        <span class="badge badge--${launch.status}">${launch.status}</span>
      </header>
      <div class="preview-card-body">
        <h3 class="preview-card-title">${escapeHtml(launch.name)}</h3>
        <p class="preview-card-tagline">${escapeHtml(launch.tagline)}</p>
        <p class="preview-card-desc">${escapeHtml(launch.description)}</p>
      </div>
      <footer class="preview-card-footer">
        <button class="btn btn-primary" aria-label="${escapeHtml(ctaLabel)} for ${escapeHtml(launch.name)}">
          ${escapeHtml(ctaLabel)}
        </button>
        <span class="preview-card-category">${escapeHtml(launch.category)}</span>
      </footer>
    </div>
  `;
}

export function extractTextContent(launch: Launch): string {
  return [launch.name, launch.tagline, launch.description, launch.category].join(" ");
}
