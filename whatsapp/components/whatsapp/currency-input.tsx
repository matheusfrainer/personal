"use client"

import * as React from "react"

import { formatCurrency } from "@/lib/crm"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

/**
 * Money field that reads as currency and edits as a number. Kept as a text
 * input rather than `type="number"`: a number input can't render "R$ 1.250,00"
 * and its spinner is noise on amounts this large.
 */
export function CurrencyInput({
  value,
  onCommit,
  placeholder = "R$ 0,00",
  className,
  "aria-label": ariaLabel,
}: {
  value?: number
  onCommit: (value: number | undefined) => void
  placeholder?: string
  className?: string
  "aria-label"?: string
}) {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState("")

  const display = value != null ? formatCurrency(value) : ""

  function commit() {
    setEditing(false)
    const cleaned = draft.replace(/[^\d,.-]/g, "").replace(",", ".")
    const parsed = Number(cleaned)
    if (!cleaned) return onCommit(undefined)
    if (Number.isFinite(parsed)) onCommit(parsed)
  }

  return (
    <Input
      inputMode="decimal"
      aria-label={ariaLabel}
      value={editing ? draft : display}
      placeholder={placeholder}
      onFocus={() => {
        setDraft(value != null ? String(value) : "")
        setEditing(true)
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur()
        if (e.key === "Escape") {
          setEditing(false)
          e.currentTarget.blur()
        }
      }}
      className={cn("h-7 text-xs tabular-nums", className)}
    />
  )
}
