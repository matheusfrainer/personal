import { expect, type Page } from "@playwright/test"

/**
 * Opens the app in deterministic mode with a clean slate.
 *
 * `?e2e=1` disables the simulated reply (timers + random text), and clearing
 * localStorage guarantees every test starts from the seed data.
 */
export async function openApp(page: Page) {
  await page.goto("/?e2e=1")
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await expect(page.getByRole("heading", { name: "Conversas" })).toBeVisible()
}

/** The conversation panel — scoped so selectors don't match the sidebar. */
export function conversation(page: Page) {
  return page.locator("main")
}

/**
 * On narrow viewports the conversation replaces the list and hides the nav
 * rail, so anything that starts from the sidebar has to go back first.
 */
export async function showSidebar(page: Page) {
  const back = page.getByRole("button", { name: "Voltar" }).first()
  if (await back.isVisible().catch(() => false)) {
    await back.click()
  }
}

/** Switches to one of the primary areas in the nav rail. */
export async function openArea(page: Page, name: string) {
  await showSidebar(page)
  // The chats control appends the unread count to its accessible name,
  // so match on the label prefix rather than the whole string.
  await page.getByRole("button", { name: new RegExp(`^${name}`) }).first().click()
}

export async function openChat(page: Page, name: string) {
  await showSidebar(page)
  await page.getByRole("button", { name: new RegExp(name) }).first().click()
  // Assert the header actually shows this chat. Waiting for a generic control
  // would pass for *any* open conversation and hide navigation failures.
  await expect(
    conversation(page).getByRole("button", { name: new RegExp(name) })
  ).toBeVisible()
}

/** The message row containing the given text. */
export function messageRow(page: Page, text: string) {
  return conversation(page)
    .locator('[data-slot="message"]')
    .filter({ hasText: text })
    .last()
}

/**
 * Reveals the hover-only action menu for a message and picks an item.
 * Scoped to the row: every message keeps its buttons in the DOM (they are just
 * transparent), so picking the first match would target the wrong message.
 */
export async function messageAction(page: Page, text: string, item: string) {
  const row = messageRow(page, text)
  await row.hover()
  await row.getByRole("button", { name: "Opções da mensagem" }).click()
  await page.getByRole("menuitem", { name: item }).click()
}

export async function sendMessage(page: Page, text: string) {
  const box = page.getByRole("textbox", { name: "Digite uma mensagem" })
  await box.fill(text)
  await box.press("Enter")
}
