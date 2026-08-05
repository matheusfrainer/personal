import type { Chat } from "./types"

const KEY = "whatsapp-shadcn:chats:v1"

/**
 * Reads persisted chats. Always returns null on the server so the statically
 * prerendered markup matches the first client render; the store hydrates from
 * here in an effect after mount.
 */
export function loadChats(): Chat[] | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length ? (parsed as Chat[]) : null
  } catch {
    // Corrupt or unavailable storage (private mode, quota) — fall back to seed.
    return null
  }
}

export function saveChats(chats: Chat[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(KEY, JSON.stringify(chats))
  } catch {
    // Quota exceeded — the app keeps working from memory.
  }
}

export function clearChats() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
