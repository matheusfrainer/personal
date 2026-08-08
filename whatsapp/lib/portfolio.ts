import type { Chat, Position } from "./types"

import { crmOf } from "./crm"

export interface PortfolioTotals {
  /** everything the investor holds, wherever it sits */
  netWorth: number
  /** assets under your custody */
  auc: number
  /** what exists and isn't yours yet — the number that drives prospecting */
  pipe: number
}

/**
 * Derived, never stored. `declaredNetWorth` wins when present because some
 * investors state a total without opening every position; the pipe is then
 * the part of that total the positions don't account for.
 */
export function totalsOf(chat: Chat): PortfolioTotals {
  const positions = crmOf(chat).positions
  const declared = crmOf(chat).declaredNetWorth
  const held = sum(positions)
  const auc = sum(positions.filter((p) => p.underManagement))
  const netWorth = declared ?? held
  return { netWorth, auc, pipe: Math.max(0, netWorth - auc) }
}

export function sum(positions: Position[]): number {
  return positions.reduce((total, p) => total + p.amount, 0)
}

/** Totals across every non-archived contact, for the Carteiras workspace. */
export function totalsAcross(chats: Chat[]): PortfolioTotals {
  return chats
    .filter((c) => !c.archived && !c.isGroup)
    .reduce<PortfolioTotals>(
      (acc, chat) => {
        const t = totalsOf(chat)
        return {
          netWorth: acc.netWorth + t.netWorth,
          auc: acc.auc + t.auc,
          pipe: acc.pipe + t.pipe,
        }
      },
      { netWorth: 0, auc: 0, pipe: 0 }
    )
}

export interface Slice {
  label: string
  amount: number
  /** 0–1, relative to the largest slice — drives the bar width */
  ratio: number
}

/** Groups positions by an arbitrary key, sorted by amount. */
function group(
  chats: Chat[],
  key: (p: Position) => string | undefined,
  filter?: (p: Position) => boolean
): Slice[] {
  const totals = new Map<string, number>()
  for (const chat of chats) {
    if (chat.archived || chat.isGroup) continue
    for (const p of crmOf(chat).positions) {
      if (filter && !filter(p)) continue
      const label = key(p)
      if (!label) continue
      totals.set(label, (totals.get(label) ?? 0) + p.amount)
    }
  }
  const entries = [...totals.entries()].sort((a, b) => b[1] - a[1])
  const largest = entries[0]?.[1] ?? 0
  return entries.map(([label, amount]) => ({
    label,
    amount,
    ratio: largest > 0 ? amount / largest : 0,
  }))
}

/** Where the money that isn't yours is parked. */
export function byInstitution(chats: Chat[], onlyOutside = false): Slice[] {
  return group(
    chats,
    (p) => p.institution,
    onlyOutside ? (p) => !p.underManagement : undefined
  )
}

export function byProduct(chats: Chat[]): Slice[] {
  return group(chats, (p) => p.product)
}

/** Contacts ranked by assets under management — surfaces concentration risk. */
export function concentration(
  chats: Chat[]
): { chat: Chat; auc: number; share: number }[] {
  const rows = chats
    .filter((c) => !c.archived && !c.isGroup)
    .map((chat) => ({ chat, auc: totalsOf(chat).auc }))
    .filter((r) => r.auc > 0)
    .sort((a, b) => b.auc - a.auc)
  const total = rows.reduce((n, r) => n + r.auc, 0)
  return rows.map((r) => ({ ...r, share: total > 0 ? r.auc / total : 0 }))
}
