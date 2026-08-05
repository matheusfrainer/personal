import type { PersistedState } from "./store"

const KEY = "whatsapp-shadcn:state:v2"

/**
 * Transient UI state must never reach storage. `typing` in particular is set
 * by the reply simulation — persisting it leaves a chat stuck on "digitando…"
 * forever if the page is reloaded mid-simulation.
 */
function sanitize(state: PersistedState): PersistedState {
  return {
    ...state,
    chats: state.chats.map((chat) => {
      const copy = { ...chat }
      delete copy.typing
      return copy
    }),
  }
}

/**
 * Reads persisted state. Always returns null on the server so the statically
 * prerendered markup matches the first client render; the store hydrates from
 * here in an effect after mount.
 */
export function loadState(): PersistedState | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PersistedState>
    // Reject anything that isn't the shape we wrote, so an older or corrupt
    // payload falls back to the seed instead of rendering a broken app.
    if (!parsed || !Array.isArray(parsed.chats) || !parsed.chats.length) {
      return null
    }
    return {
      chats: parsed.chats,
      calls: parsed.calls ?? [],
      communities: parsed.communities ?? [],
      blocked: parsed.blocked ?? [],
      preferences: {
        notifications: parsed.preferences?.notifications ?? true,
        readReceipts: parsed.preferences?.readReceipts ?? true,
      },
    }
  } catch {
    // Corrupt or unavailable storage (private mode, quota) — fall back to seed.
    return null
  }
}

export function saveState(state: PersistedState) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(sanitize(state)))
  } catch {
    // Quota exceeded — the app keeps working from memory.
  }
}

export function clearStored() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
