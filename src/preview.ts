import type { Launch } from "./state.js";

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
    <div class="preview-card" style="--card-color: ${highlightColor}" aria-label="Preview: ${launch.name}">
      <div class="preview-card-glow" aria-hidden="true"></div>
      <header class="preview-card-header">
        <div class="preview-card-emoji" aria-hidden="true">${launch.emoji}</div>
        <span class="badge badge--${launch.status}">${launch.status}</span>
      </header>
      <div class="preview-card-body">
        <h3 class="preview-card-title">${launch.name}</h3>
        <p class="preview-card-tagline">${launch.tagline}</p>
        <p class="preview-card-desc">${launch.description}</p>
      </div>
      <footer class="preview-card-footer">
        <button class="btn btn-primary" aria-label="${ctaLabel} for ${launch.name}">
          ${ctaLabel}
        </button>
        <span class="preview-card-category">${launch.category}</span>
      </footer>
    </div>
  `;
}

export function extractTextContent(launch: Launch): string {
  return [launch.name, launch.tagline, launch.description, launch.category].join(" ");
}
