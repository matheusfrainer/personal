"use client"

import * as React from "react"

const subscribe = () => () => {}

/**
 * True only after client hydration.
 *
 * Uses useSyncExternalStore rather than the setState-in-effect trick so the
 * server and first client render agree without triggering a cascading render.
 * Needed wherever we read client-only state (e.g. the resolved theme) that
 * would otherwise cause a hydration mismatch.
 */
export function useHydrated() {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
