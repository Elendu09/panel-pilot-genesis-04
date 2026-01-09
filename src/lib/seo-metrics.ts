export const SEO_TITLE_PX_RANGE = { min: 300, max: 580 } as const;
export const SEO_DESC_PX_RANGE = { min: 450, max: 1000 } as const;

let canvas: HTMLCanvasElement | null = null;

export function measureTextPx(text: string, font = '16px Arial'): number {
  if (typeof document === 'undefined') return text.length * 8; // SSR-safe fallback
  if (!canvas) canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return text.length * 8;
  ctx.font = font;
  return ctx.measureText(text).width;
}

export function isInRange(value: number, range: { min: number; max: number }) {
  return value >= range.min && value <= range.max;
}

export function clampToPx(text: string, maxPx: number, font = '16px Arial') {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  if (measureTextPx(trimmed, font) <= maxPx) return trimmed;

  // Fast-ish truncation loop (kept simple; strings are short)
  let out = trimmed;
  while (out.length > 10 && measureTextPx(out + '…', font) > maxPx) {
    out = out.slice(0, -1);
  }
  return (out.trimEnd() + '…').trim();
}

export function generateSeoMeta(input: {
  panelName: string;
  domain?: string;
  offeringHint?: string;
}) {
  const panelName = (input.panelName || 'Panel').trim();
  const offeringHint = (input.offeringHint || '').trim();

  // Generate SEO-optimized title WITHOUT domain name (cleaner for search results)
  const rawTitle = `${panelName} - #1 SMM Panel | Buy Followers, Likes & Views`;

  // Description uses offeringHint when available, focuses on value proposition
  const baseDesc = offeringHint
    ? `${offeringHint} — Get real followers, likes, views & more from ${panelName}. Instant delivery, 24/7 support, best prices guaranteed.`
    : `Get real followers, likes, views & more from ${panelName}. Instant delivery, 24/7 support, best prices guaranteed.`;

  const rawDescription = baseDesc;

  const title = clampToPx(rawTitle, SEO_TITLE_PX_RANGE.max);
  const description = clampToPx(rawDescription, SEO_DESC_PX_RANGE.max);

  return { title, description };
}
