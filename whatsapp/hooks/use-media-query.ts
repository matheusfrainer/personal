"use client"

import * as React from "react"

/**
 * Tracks a CSS media query from JS.
 *
 * The rest of the app switches layouts with Tailwind classes alone, which is
 * the right default. This exists for the one case that classes cannot cover:
 * a panel that must exist as a docked column *or* as a sheet, never both —
 * `hidden` still mounts the element, which would duplicate its content in the
 * accessibility tree.
 *
 * Returns false during SSR and the first client render so the markup matches.
 */
export function useMediaQuery(query: string) {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener("change", onChange)
      return () => list.removeEventListener("change", onChange)
    },
    [query]
  )

  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  )
}
