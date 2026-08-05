"use client"

import * as React from "react"

import { Input } from "@/components/ui/input"

const GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: "Recentes",
    emojis: ["😀", "😂", "🥰", "👍", "🙏", "🎉", "❤️", "🔥"],
  },
  {
    label: "Sorrisos e pessoas",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "🙂", "🙃", "😉", "😊",
      "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😋", "😜", "🤪", "🤗", "🤔",
      "🤐", "😐", "😴", "😪", "😢", "😭", "😤", "😠", "🥳", "😎", "🤓", "🫡",
    ],
  },
  {
    label: "Gestos",
    emojis: ["👍", "👎", "👏", "🙌", "🤝", "🙏", "💪", "✌️", "🤞", "👌", "👋", "🫶"],
  },
  {
    label: "Objetos e símbolos",
    emojis: ["❤️", "🔥", "⭐", "🎉", "🎂", "☕", "🍕", "⚽", "✈️", "💡", "📌", "✅"],
  },
]

/** Emoji keyboard for the composer. */
export function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const [query, setQuery] = React.useState("")

  const groups = React.useMemo(() => {
    const q = query.trim()
    if (!q) return GROUPS
    // No emoji names to match on, so filter by the glyph itself.
    const all = [...new Set(GROUPS.flatMap((g) => g.emojis))].filter((e) =>
      e.includes(q)
    )
    return all.length ? [{ label: "Resultados", emojis: all }] : []
  }, [query])

  return (
    <div className="flex w-72 flex-col gap-2">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Pesquisar emoji"
        aria-label="Pesquisar emoji"
      />
      <div className="thin-scroll max-h-64 overflow-y-auto pr-1">
        {groups.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            Nenhum emoji encontrado.
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="mb-2">
              <p className="mb-1 text-[0.625rem] font-medium text-muted-foreground">
                {group.label}
              </p>
              <div className="grid grid-cols-8 gap-0.5">
                {group.emojis.map((emoji, i) => (
                  <button
                    key={`${emoji}-${i}`}
                    type="button"
                    onClick={() => onPick(emoji)}
                    className="rounded p-1 text-lg leading-none transition-transform hover:scale-110 hover:bg-muted"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
