import { parseRichText } from "@/lib/format"

/**
 * Renders WhatsApp inline formatting (*bold*, _italic_, ~strike~, ```mono```)
 * and autolinks URLs. Builds React nodes from tokens — no raw HTML injection.
 */
export function RichText({ children }: { children: string }) {
  const tokens = parseRichText(children)

  return (
    <>
      {tokens.map((token, i) => {
        switch (token.kind) {
          case "bold":
            return <strong key={i}>{token.value}</strong>
          case "italic":
            return <em key={i}>{token.value}</em>
          case "strike":
            return <s key={i}>{token.value}</s>
          case "mono":
            return (
              <code
                key={i}
                className="rounded bg-foreground/10 px-1 font-mono text-[0.9em]"
              >
                {token.value}
              </code>
            )
          case "link":
            return (
              <a
                key={i}
                href={token.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:opacity-80"
              >
                {token.value}
              </a>
            )
          default:
            return <span key={i}>{token.value}</span>
        }
      })}
    </>
  )
}
