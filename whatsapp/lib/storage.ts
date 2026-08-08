import { DEFAULT_MONTHLY_GOAL } from "./types"
import type { PersistedState } from "./store"

/**
 * Bumped to v3 with the advisory CRM model. `CrmData` changed shape
 * incompatibly and is not validated on read, so a v2 payload would hydrate
 * with the old fields and break the panel rather than fall back to the seed.
 */
const KEY = "whatsapp-shadcn:state:v3"

/**
 * Transient UI state must never cross the storage boundary — in either
 * direction. `typing` is set by the reply simulation; persisting it leaves a
 * chat stuck on "digitando…" forever. Guarding only the write is not enough:
 * a payload that already carries the flag (an older build, a hand-edited
 * value) would hydrate straight into the UI, so reads are sanitised too.
 */
function sanitize(state: PersistedState): PersistedState {
  return {
    ...state,
    chats: state.chats.map((chat) => {
      const copy = { ...chat }
      delete copy.typing
      return copy
    }),
    // Approved-but-unsent actions are re-evaluated on load; a "sent" flag is
    // history and stays. Nothing pending survives a reload as pending, so a
    // rule whose trigger no longer holds doesn't fire from a stale queue.
    pending: (state.pending ?? []).filter((p) => p.status !== "pending"),
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
    // payload falls back to the seed instead of rendering a broken app. Each
    // entry is checked: one malformed chat is enough to crash the renderer.
    const isChat = (c: unknown): c is PersistedState["chats"][number] =>
      typeof c === "object" &&
      c !== null &&
      typeof (c as { id?: unknown }).id === "string" &&
      Array.isArray((c as { conversation?: unknown }).conversation)
    if (
      !parsed ||
      !Array.isArray(parsed.chats) ||
      !parsed.chats.length ||
      !parsed.chats.every(isChat)
    ) {
      return null
    }
    return sanitize({
      chats: parsed.chats,
      calls: parsed.calls ?? [],
      communities: parsed.communities ?? [],
      automations: parsed.automations ?? [],
      pending: parsed.pending ?? [],
      campaigns: parsed.campaigns ?? [],
      monthlyGoal: parsed.monthlyGoal ?? DEFAULT_MONTHLY_GOAL,
      insights: parsed.insights ?? {},
      blocked: parsed.blocked ?? [],
      preferences: {
        notifications: parsed.preferences?.notifications ?? true,
        readReceipts: parsed.preferences?.readReceipts ?? true,
        crmPanel: parsed.preferences?.crmPanel ?? true,
      },
    })
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
