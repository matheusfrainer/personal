/**
 * WhatsApp's inline text formatting:
 *   *negrito*  _itálico_  ~tachado~  ```mono```
 * plus bare-URL autolinking.
 *
 * Returns a flat token list so the renderer can emit React nodes without ever
 * using dangerouslySetInnerHTML.
 */

export type Token =
  | { kind: "text"; value: string }
  | { kind: "bold"; value: string }
  | { kind: "italic"; value: string }
  | { kind: "strike"; value: string }
  | { kind: "mono"; value: string }
  | { kind: "link"; value: string; href: string }

const URL_RE = /https?:\/\/[^\s<]+[^\s<.,:;"')\]]/gi

// Order matters: mono first so ``` wins over the single-char markers.
const MARKERS: { kind: Token["kind"]; re: RegExp }[] = [
  { kind: "mono", re: /```([\s\S]+?)```/ },
  { kind: "bold", re: /(?<![\w*])\*(?!\s)([^*\n]+?)(?<!\s)\*(?![\w*])/ },
  { kind: "italic", re: /(?<![\w_])_(?!\s)([^_\n]+?)(?<!\s)_(?![\w_])/ },
  { kind: "strike", re: /(?<![\w~])~(?!\s)([^~\n]+?)(?<!\s)~(?![\w~])/ },
]

function linkify(text: string): Token[] {
  const out: Token[] = []
  let last = 0
  for (const m of text.matchAll(URL_RE)) {
    const start = m.index ?? 0
    if (start > last) out.push({ kind: "text", value: text.slice(last, start) })
    out.push({ kind: "link", value: m[0], href: m[0] })
    last = start + m[0].length
  }
  if (last < text.length) out.push({ kind: "text", value: text.slice(last) })
  return out
}

export function parseRichText(input: string): Token[] {
  if (!input) return []

  // Find the earliest marker match; everything before it is plain text.
  let best: { kind: Token["kind"]; index: number; length: number; inner: string } | null =
    null

  for (const { kind, re } of MARKERS) {
    const m = re.exec(input)
    if (m && (best === null || m.index < best.index)) {
      best = { kind, index: m.index, length: m[0].length, inner: m[1] }
    }
  }

  if (!best) return linkify(input)

  const before = input.slice(0, best.index)
  const after = input.slice(best.index + best.length)

  return [
    ...linkify(before),
    // Mono is literal; the others may still contain nested formatting.
    ...(best.kind === "mono"
      ? [{ kind: "mono" as const, value: best.inner }]
      : parseRichText(best.inner).map((t) =>
          t.kind === "text"
            ? ({ kind: best!.kind, value: t.value } as Token)
            : t
        )),
    ...parseRichText(after),
  ]
}

/** Plain-text version, used for chat-list previews and search. */
export function stripFormatting(input: string) {
  return parseRichText(input)
    .map((t) => t.value)
    .join("")
}

/** First URL in a message, used to decide whether to show a link preview. */
export function firstUrl(input: string) {
  const m = input.match(URL_RE)
  return m ? m[0] : null
}
