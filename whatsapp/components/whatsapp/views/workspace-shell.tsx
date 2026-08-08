"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Chrome shared by every full-width workspace: the same `h-14` header the
 * conversation and settings screens use, plus a thin-scroll body.
 */
export function WorkspaceShell({
  title,
  description,
  actions,
  tabs,
  children,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  tabs?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold">{title}</h1>
          {description ? (
            <p className="truncate text-[0.6875rem] text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        <div className="flex-1" />
        {actions}
      </header>
      {tabs ? (
        <div className="shrink-0 border-b border-border px-4 py-2">{tabs}</div>
      ) : null}
      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

/** Headline figure for the dashboards. */
export function StatCard({
  label,
  value,
  hint,
  emphasis,
}: {
  label: string
  value: string
  hint?: string
  emphasis?: boolean
}) {
  return (
    <div className="rounded-lg border border-border px-4 py-3">
      <p className="text-[0.625rem] tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 truncate tabular-nums",
          emphasis ? "text-xl font-semibold" : "text-lg font-medium"
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 truncate text-[0.625rem] text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Horizontal bar for distribution charts. The theme is fully neutral, so the
 * series use the --chart-* ramp (which is a grey scale) instead of hues.
 */
export function BarRow({
  label,
  value,
  ratio,
  index = 0,
}: {
  label: string
  value: string
  ratio: number
  index?: number
}) {
  const shade = [
    "bg-chart-5",
    "bg-chart-4",
    "bg-chart-3",
    "bg-chart-2",
    "bg-chart-1",
  ][Math.min(index, 4)]
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-32 shrink-0 truncate text-xs">{label}</span>
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", shade)}
          style={{ width: `${Math.max(2, ratio * 100)}%` }}
        />
      </div>
      <span className="w-28 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
        {value}
      </span>
    </div>
  )
}
