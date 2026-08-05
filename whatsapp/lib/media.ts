/**
 * Inline placeholder media.
 *
 * The app ships no binary assets and makes no network requests, so "photos"
 * are generated as neutral SVG data URIs. Staying greyscale keeps them inside
 * the Neutral theme instead of dropping colour into an otherwise neutral UI.
 */

function svgToDataUri(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`
}

/** Deterministic pseudo-random in [0,1) so renders are stable across reloads. */
function rand(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

/**
 * An abstract greyscale "photo" — layered arcs and circles over a gradient.
 * Same seed always yields the same image.
 */
export function placeholderPhoto(seed: number, w = 480, h = 320) {
  const a = 18 + Math.floor(rand(seed) * 22)
  const b = 55 + Math.floor(rand(seed + 1) * 25)
  const shapes = Array.from({ length: 5 }, (_, i) => {
    const r = 40 + rand(seed + i * 3) * 110
    const cx = rand(seed + i * 5) * w
    const cy = rand(seed + i * 7) * h
    const o = (0.06 + rand(seed + i * 11) * 0.16).toFixed(2)
    return `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${r.toFixed(0)}" fill="#fff" opacity="${o}"/>`
  }).join("")

  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="hsl(0 0% ${b}%)"/>
          <stop offset="100%" stop-color="hsl(0 0% ${a}%)"/>
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#g)"/>
      ${shapes}
    </svg>
  `)
}

/** Deterministic waveform bar heights (0..1) for a voice note. */
export function waveform(seed: number, bars = 34) {
  return Array.from({ length: bars }, (_, i) => {
    const v = rand(seed + i * 13)
    // Bias toward the middle so it reads like speech rather than noise.
    const envelope = Math.sin((i / bars) * Math.PI) * 0.6 + 0.4
    return Math.max(0.12, Math.min(1, v * envelope + 0.15))
  })
}

/** "mm:ss" from a duration in seconds. */
export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}
