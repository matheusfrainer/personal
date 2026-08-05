import { expect, test } from "@playwright/test"

import {
  conversation,
  openApp,
  openArea,
  openChat,
  sendMessage,
} from "./helpers"

test.beforeEach(async ({ page }) => {
  await openApp(page)
})

test("keeps drafts isolated per conversation", async ({ page }) => {
  // Regression: the composer used to carry text across chats and stamp it as
  // the next chat's draft.
  await openChat(page, "Ana Beatriz")
  const box = page.getByRole("textbox", { name: "Digite uma mensagem" })
  await box.fill("rascunho da Ana")
  await page.waitForTimeout(600)

  await openChat(page, "Carlos Eduardo")
  await expect(page.getByRole("textbox", { name: "Digite uma mensagem" })).toHaveValue("")

  await openChat(page, "Ana Beatriz")
  await expect(page.getByRole("textbox", { name: "Digite uma mensagem" })).toHaveValue(
    "rascunho da Ana"
  )
})

test("persists messages across a reload", async ({ page }) => {
  await openChat(page, "Ana Beatriz")
  await sendMessage(page, "sobrevive ao reload")

  await page.reload()
  await openChat(page, "Ana Beatriz")
  await expect(conversation(page).getByText("sobrevive ao reload")).toBeVisible()
})

test("never restores a stuck typing indicator", async ({ page }) => {
  // Regression: `typing` used to be persisted, so reloading mid-simulation left
  // a chat stuck on "digitando…" forever. Seed storage with the broken shape so
  // the test actually exercises hydration instead of only reading the seed.
  await page.goto("/?e2e=1")
  await page.evaluate(() => {
    window.localStorage.setItem(
      "whatsapp-shadcn:state:v2",
      JSON.stringify({
        chats: [
          {
            id: "stuck",
            name: "Contato Travado",
            tint: "neutral",
            time: "09:00",
            typing: true,
            conversation: [
              {
                label: "Hoje",
                messages: [
                  {
                    id: "m1",
                    type: "text",
                    fromMe: false,
                    text: "oi",
                    time: "09:00",
                  },
                ],
              },
            ],
          },
        ],
        calls: [],
        communities: [],
        blocked: [],
        preferences: { notifications: true, readReceipts: true },
      })
    )
  })
  await page.reload()

  // The chat hydrates, but the transient flag must not survive into the UI…
  await expect(page.getByRole("button", { name: /Contato Travado/ })).toBeVisible()
  await expect(page.getByText("digitando…")).toHaveCount(0)

  // …nor be written back to storage.
  await expect(async () => {
    const stored = await page.evaluate(() =>
      window.localStorage.getItem("whatsapp-shadcn:state:v2")
    )
    expect(stored ?? "").not.toContain('"typing":true')
  }).toPass({ timeout: 5000 })
})

test("searches across the whole transcript", async ({ page }) => {
  const search = page.getByRole("textbox", { name: "Pesquisar conversas" })
  // A phrase that only appears deep in a transcript, not in the last message.
  await search.fill("protótipo")
  await expect(page.getByRole("button", { name: /Ana Beatriz/ })).toBeVisible()

  await search.fill("zzzz-nao-existe")
  await expect(page.getByText("Nenhuma conversa encontrada.")).toBeVisible()
})

test("runs a simulated call and records it in the history", async ({ page }) => {
  await openChat(page, "Ana Beatriz")
  await conversation(page).getByRole("button", { name: "Chamada de voz" }).click()

  const dialog = page.getByRole("dialog", { name: /Chamada com Ana Beatriz/ })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText("chamando…")).toBeVisible()
  // Picks up, then the timer starts.
  await expect(dialog.getByText(/^\d+:\d\d$/)).toBeVisible({ timeout: 6000 })

  await dialog.getByRole("button", { name: "Encerrar chamada" }).click()
  await expect(dialog).toBeHidden()

  await openArea(page, "Chamadas")
  await expect(page.getByText(/Realizada · Hoje/).first()).toBeVisible()
})

test("blocking a contact disables the composer", async ({ page }) => {
  await openChat(page, "Carlos Eduardo")
  await conversation(page).getByRole("button", { name: /Carlos Eduardo/ }).click()
  await page.getByRole("button", { name: /^Bloquear/ }).click()
  // Close the info panel: while a Radix sheet is open the rest of the page is
  // aria-hidden, so role-based queries can't reach the composer behind it.
  await page.keyboard.press("Escape")

  await expect(
    page.getByText("Você bloqueou este contato. Não é possível enviar mensagens.")
  ).toBeVisible()
  await page.getByRole("button", { name: "Desbloquear" }).click()
  await expect(page.getByRole("textbox", { name: "Digite uma mensagem" })).toBeVisible()
})

test("read-receipt preference hides the blue tick", async ({ page }) => {
  await openChat(page, "Ana Beatriz")
  await expect(async () => {
    expect(await conversation(page).innerHTML()).toContain("text-sky-500")
  }).toPass({ timeout: 5000 })

  await openArea(page, "Configurações")
  await page.getByRole("switch").nth(2).click() // confirmações de leitura

  await openArea(page, "Conversas")
  await openChat(page, "Ana Beatriz")
  expect(await conversation(page).innerHTML()).not.toContain("text-sky-500")
})

test("navigates between the primary areas", async ({ page }) => {
  await openArea(page, "Chamadas")
  await expect(page.getByRole("heading", { name: "Chamadas" })).toBeVisible()

  await openArea(page, "Comunidades")
  await expect(page.getByRole("heading", { name: "Comunidades" })).toBeVisible()

  await openArea(page, "Configurações")
  await expect(page.getByRole("heading", { name: "Configurações" })).toBeVisible()

  await openArea(page, "Conversas")
  await expect(page.getByRole("heading", { name: "Conversas" })).toBeVisible()
})

test("deleting a chat also drops its call history", async ({ page }) => {
  await openArea(page, "Chamadas")
  await expect(page.getByText("Mariana Costa")).toBeVisible()

  await openArea(page, "Conversas")
  await page.getByRole("button", { name: /Mariana Costa/ }).click({ button: "right" })
  await page.getByRole("menuitem", { name: "Apagar conversa" }).click()

  await openArea(page, "Chamadas")
  await expect(page.getByText("Mariana Costa")).toHaveCount(0)
})

test("sends media from the attach menu", async ({ page }) => {
  await openChat(page, "Ana Beatriz")
  await page.getByRole("button", { name: "Anexar" }).click()
  await page.getByRole("menuitem", { name: "Documento" }).click()

  await expect(conversation(page).getByText("documento.pdf").last()).toBeVisible()
})
