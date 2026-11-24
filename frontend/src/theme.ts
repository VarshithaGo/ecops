// ─────────────────────────────────────────────────────────────────────────
// e-Cops design system — single source of truth for colour & type.
//
// `C` keeps the same five token NAMES the whole app already uses
// (angst / kite / bark / charcoal / ashes) but remaps them to a clean,
// high-contrast, government-grade LIGHT palette. Because every screen imports
// these tokens, changing them here re-skins the entire app.
//
//   angst    → app background (page canvas)
//   kite     → card / panel surface
//   bark     → hairline borders & dividers
//   charcoal → secondary / muted text and strong borders
//   ashes    → primary text (near-black)
// ─────────────────────────────────────────────────────────────────────────

import type { CSSProperties } from 'react'

export const C = {
  angst: '#EDF1F6',   // page background (cool near-white)
  kite:  '#FFFFFF',   // surface / cards
  bark:  '#DDE3EA',   // hairline borders / dividers
  charcoal: '#5A6676',// secondary text + strong borders (AA on white)
  ashes: '#16202C',   // primary text (near-black slate)
}

// Brand + state colours (not part of the legacy 5 tokens).
export const A = {
  accent:      '#1C4E80',  // police blue — primary actions, header
  accentHover: '#16406A',
  accentSoft:  '#E8EEF6',   // tinted background for selected/hover
  onAccent:    '#FFFFFF',
}

// Status palette — darker than the old neon values so it passes contrast on
// white. Always paired with a text label in the UI, never colour alone.
export const S = {
  info:    '#1C4E80',
  good:    '#1A7F44',
  warn:    '#B45309',
  danger:  '#B91C1C',
  neutral: '#5A6676',
}

export const FONT = {
  // One clean UI typeface everywhere. Space Grotesk kept as a secondary fallback.
  ui: "'Inter', 'Space Grotesk', system-ui, -apple-system, sans-serif",
}

export const RADIUS = 8

// Shared form-field styling so every input/select/table looks identical.
export const FIELD_BORDER = '#9FB3CC'        // visible soft blue-grey border
export const FIELD_BORDER_ERR = '#B91C1C'

// ── Reusable inline-style helpers for the redesigned screens ──────────────

export const card: CSSProperties = {
  background: C.kite,
  border: `1px solid ${C.bark}`,
  borderRadius: RADIUS,
  boxShadow: '0 1px 2px rgba(16,32,44,0.04), 0 1px 3px rgba(16,32,44,0.06)',
}

export const pageTitle: CSSProperties = {
  fontFamily: FONT.ui,
  fontSize: 24,
  fontWeight: 700,
  letterSpacing: '-0.01em',
  color: C.ashes,
  margin: 0,
}

export const pageSubtitle: CSSProperties = {
  fontFamily: FONT.ui,
  fontSize: 14,
  fontWeight: 400,
  color: C.charcoal,
  margin: '6px 0 0',
}

export const label: CSSProperties = {
  display: 'block',
  fontFamily: FONT.ui,
  fontSize: 13,
  fontWeight: 600,
  color: C.ashes,
  marginBottom: 6,
}

export const input: CSSProperties = {
  padding: '10px 12px',
  border: `1px solid ${C.charcoal}55`,
  borderRadius: 6,
  fontFamily: FONT.ui,
  fontSize: 14,
  width: '100%',
  boxSizing: 'border-box',
  background: '#fff',
  color: C.ashes,
  outline: 'none',
}

export const btnPrimary: CSSProperties = {
  fontFamily: FONT.ui,
  fontSize: 14,
  fontWeight: 600,
  padding: '10px 18px',
  background: A.accent,
  color: A.onAccent,
  border: `1px solid ${A.accent}`,
  borderRadius: 6,
  cursor: 'pointer',
}

export const btnSecondary: CSSProperties = {
  fontFamily: FONT.ui,
  fontSize: 14,
  fontWeight: 600,
  padding: '10px 18px',
  background: '#fff',
  color: C.ashes,
  border: `1px solid ${C.charcoal}66`,
  borderRadius: 6,
  cursor: 'pointer',
}
