import { expect, test, type Page } from "@playwright/test"

import { conversation, openApp, openChat, sendMessage } from "./helpers"

/**
 * Makes the client panel visible. On wide viewports it is a docked column
 * that is already open; on narrow ones the same button opens a sheet.
 */
async function openClientPanel(page: Page) {
  const tab = page.getByRole("tab", { name: "Perfil" })
  if (!(await tab.isVisible().catch(() => false))) {
    await conversation(page)
      .getByRole("button", { name: "Painel do cliente" })
      .click()
  }
  await expect(tab).toBeVisible()
}

/**
 * Dismisses whatever overlay is open so the conversation list is reachable
 * again. A dropdown inside the sheet needs its own Escape before the sheet
 * itself takes one, hence the loop.
 */
async function closeClientSheet(page: Page) {
  for (let i = 0; i < 3; i++) {
    const overlay = page.getByRole("dialog").or(page.getByRole("menu"))
    if (
      !(await overlay
        .first()
        .isVisible()
        .catch(() => false))
    )
      return
    await page.keyboard.press("Escape")
    await page.waitForTimeout(150)
  }
}

test("orders a sent message by its clock time, not by arrival", async ({
  page,
}) => {
  // The seed carries fixed clock times, so a message sent earlier in the day
  // than the last seeded one must slot in above it rather than land at the
  // end. 23:59 is later than any wall clock the test can run at.
  const seeded = JSON.stringify({
    chats: [
      {
        id: "ordem",
        name: "Contato Ordenado",
        tint: "neutral",
        time: "23:59",
        conversation: [
          {
            label: "Hoje",
            messages: [
              {
                id: "m1",
                type: "text",
                fromMe: false,
                text: "primeira da manhã",
                time: "00:01",
              },
              {
                id: "m2",
                type: "text",
                fromMe: false,
                text: "última da noite",
                time: "23:59",
              },
            ],
          },
        ],
      },
    ],
    calls: [],
    communities: [],
    automations: [],
    pending: [],
    campaigns: [],
    monthlyGoal: 500000,
    insights: {},
    blocked: [],
    preferences: { notifications: true, readReceipts: true, crmPanel: true },
  })
  await page.addInitScript((payload) => {
    window.localStorage.setItem("whatsapp-shadcn:state:v3", payload as string)
  }, seeded)
  await page.goto("/?e2e=1")

  await openChat(page, "Contato Ordenado")
  await sendMessage(page, "enviada agora")

  const texts = await conversation(page)
    .locator('[data-slot="message"]')
    .allInnerTexts()
  const sent = texts.findIndex((t) => t.includes("enviada agora"))
  const night = texts.findIndex((t) => t.includes("última da noite"))
  const morning = texts.findIndex((t) => t.includes("primeira da manhã"))

  expect(sent).toBeGreaterThan(morning)
  expect(sent).toBeLessThan(night)
})

test("anchors a short transcript to the bottom", async ({ page }) => {
  // Regression: the scroller content stacked from the top whenever the
  // transcript was shorter than the viewport, which is every seeded chat.
  await openApp(page)
  await openChat(page, "Ana Beatriz")

  const viewport = conversation(page).locator(
    '[data-slot="message-scroller-viewport"]'
  )
  const last = conversation(page).locator('[data-slot="message"]').last()

  const viewportBox = await viewport.boundingBox()
  const lastBox = await last.boundingBox()
  expect(viewportBox).not.toBeNull()
  expect(lastBox).not.toBeNull()

  // The last message should sit near the bottom edge, not near the top.
  const gap =
    viewportBox!.y + viewportBox!.height - (lastBox!.y + lastBox!.height)
  expect(gap).toBeLessThan(80)
})

test("edits CRM data and keeps it across a reload", async ({ page }) => {
  await openApp(page)
  await openChat(page, "Ana Beatriz")
  await openClientPanel(page)

  const panel = page.getByRole("tabpanel")
  await panel.getByRole("button", { name: "Cliente", exact: true }).click()
  await expect(panel.getByText(/Cliente desde/)).toBeVisible()

  // Give the store's debounced write a chance to land before reloading.
  await page.waitForTimeout(600)
  await page.reload()
  await openChat(page, "Ana Beatriz")
  await openClientPanel(page)

  await expect(
    page.getByRole("tabpanel").getByText(/Cliente desde/)
  ).toBeVisible()
})

test("derives net worth, AuC and pipe from positions", async ({ page }) => {
  await openApp(page)
  await openChat(page, "Ana Beatriz")
  await openClientPanel(page)
  await page.getByRole("tab", { name: "Carteira" }).click()

  // Seed: 420k + 180k outside, 60k under management → 660k total, 600k pipe.
  // Scoped to the totals row, since the same figures repeat in the position
  // list below it.
  const totals = page.getByRole("tabpanel").locator("section").first()
  await expect(totals.getByText("R$ 660.000,00", { exact: true })).toBeVisible()
  await expect(totals.getByText("R$ 60.000,00", { exact: true })).toBeVisible()
  await expect(totals.getByText("R$ 600.000,00", { exact: true })).toBeVisible()
})

test("suggests existing tags from other contacts", async ({ page }) => {
  await openApp(page)
  await openChat(page, "João Pedro")
  await openClientPanel(page)

  await page
    .getByRole("tabpanel")
    .getByRole("button", { name: "Adicionar tag" })
    .click()
  // "Alta renda" is seeded on other contacts, so it must be offered here.
  await expect(page.getByRole("option", { name: "Alta renda" })).toBeVisible()
})

test("publishes a contact rule into the shared library", async ({ page }) => {
  await openApp(page)
  await openChat(page, "Ana Beatriz")
  await openClientPanel(page)
  await page.getByRole("tab", { name: "Autom." }).click()

  const panel = page.getByRole("tabpanel")
  await panel
    .getByRole("button", { name: "Opções de Follow-up de proposta" })
    .click()
  await page
    .getByRole("menuitem", { name: "Tornar geral", exact: true })
    .click()

  // It now shows up for a different contact, switched off by default.
  await closeClientSheet(page)
  await openChat(page, "Carlos Eduardo")
  await openClientPanel(page)
  await page.getByRole("tab", { name: "Autom." }).click()
  await expect(
    page.getByRole("tabpanel").getByText("Follow-up de proposta")
  ).toBeVisible()
})

test("the panel follows the open conversation", async ({ page }) => {
  await openApp(page)
  await openChat(page, "Ana Beatriz")
  await openClientPanel(page)
  const company = page.getByRole("tabpanel").getByRole("textbox", {
    name: "Empresa",
  })
  await expect(company).toHaveValue("Estúdio Nove")

  await closeClientSheet(page)
  await openChat(page, "Carlos Eduardo")
  await openClientPanel(page)
  await expect(
    page.getByRole("tabpanel").getByRole("textbox", { name: "Empresa" })
  ).toHaveValue("Vértice Consultoria")
})

test("an AI suggestion lands in the composer", async ({ page }) => {
  await openApp(page)
  await openChat(page, "Carlos Eduardo")
  await openClientPanel(page)
  await page.getByRole("tab", { name: "IA" }).click()

  // Under ?e2e=1 this is always the local heuristic, so it never spends a
  // request and the text is deterministic.
  await expect(page.getByText("Análise local")).toBeVisible()

  const suggestion = page
    .getByRole("tabpanel")
    .getByRole("button")
    .filter({ hasText: /Carlos/ })
    .first()
  const text = (await suggestion.innerText()).trim().split("\n")[0]
  await suggestion.click()
  await closeClientSheet(page)

  await expect(
    page.getByRole("textbox", { name: "Digite uma mensagem" })
  ).toHaveValue(text)
})
