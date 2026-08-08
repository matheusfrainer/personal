"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

import { Icon } from "./icon"
import { TagIcon } from "./icons"

/**
 * The panel's unit of layout. The project styles grouped content as a plain
 * section with a separator rather than a Card, so this keeps that idiom in one
 * place instead of repeating the header markup in every tab.
 */
export function PanelSection({
  icon,
  title,
  action,
  className,
  children,
}: {
  icon: typeof TagIcon
  title: string
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn("px-4 py-4", className)}>
      <div className="mb-2.5 flex items-center gap-2">
        <Icon icon={icon} className="size-3.5 text-muted-foreground" />
        <h3 className="flex-1 text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  )
}

/** Label + value row, for read-only facts. */
export function PanelRow({
  icon,
  label,
  children,
}: {
  icon?: typeof TagIcon
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      {icon ? (
        <Icon icon={icon} className="size-4 shrink-0 text-muted-foreground" />
      ) : null}
      <span className="w-24 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>
      <span className="min-w-0 flex-1 text-xs">{children}</span>
    </div>
  )
}

/** A headline number, used for the portfolio totals. */
export function PanelStat({
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
    <div className="min-w-0">
      <p className="truncate text-[0.625rem] tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          "truncate text-sm tabular-nums",
          emphasis ? "font-semibold" : "font-medium"
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="truncate text-[0.625rem] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}
