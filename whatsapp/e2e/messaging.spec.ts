import { expect, test } from "@playwright/test"

import {
  conversation,
  messageAction,
  messageRow,
  openApp,
  openChat,
  sendMessage,
} from "./helpers"

test.beforeEach(async ({ page }) => {
  await openApp(page)
})

test("sends a message and shows delivery receipts", async ({ page }) => {
  await openChat(page, "Ana Beatriz")
  await sendMessage(page, "Mensagem de teste")

  const bubble = conversation(page).getByText("Mensagem de teste")
  await expect(bubble).toBeVisible()

  // "sent" ticks over to "delivered" then "read" on a timer.
  await expect(async () => {
    const html = await conversation(page).innerHTML()
    expect(html).toContain("text-sky-500")
  }).toPass({ timeout: 5000 })
})

test("renders inline formatting instead of raw markers", async ({ page }) => {
  await openChat(page, "Ana Beatriz")
  await sendMessage(page, "isto é *negrito* e _itálico_")

  await expect(conversation(page).locator("strong", { hasText: "negrito" })).toBeVisible()
  await expect(conversation(page).locator("em", { hasText: "itálico" })).toBeVisible()
  // The asterisks must be consumed, not displayed.
  await expect(conversation(page).getByText("*negrito*")).toHaveCount(0)
})

test("replies to a message and jumps back to the original", async ({ page }) => {
  await openChat(page, "Ana Beatriz")
  await messageAction(page, "Bom dia", "Responder")

  await expect(page.getByRole("button", { name: "Cancelar resposta" })).toBeVisible()
  await sendMessage(page, "Respondendo agora")

  // The quote block is rendered inside the new bubble.
  const quoted = conversation(page).getByRole("button", { name: /Bom dia/ })
  await expect(quoted.first()).toBeVisible()
})

test("reacts to a message", async ({ page }) => {
  await openChat(page, "Ana Beatriz")
  const row = messageRow(page, "Bom dia")
  await row.hover()
  await row.getByRole("button", { name: "Reagir" }).click()
  await page.getByRole("button", { name: "😂", exact: true }).click()

  await expect(conversation(page).getByText("😂")).toBeVisible()
})

test("edits an own message and marks it edited", async ({ page }) => {
  await openChat(page, "Ana Beatriz")
  await sendMessage(page, "texto original")

  await messageAction(page, "texto original", "Editar")
  const box = page.getByRole("textbox", { name: "Digite uma mensagem" })
  await expect(box).toHaveValue("texto original")
  await box.fill("texto corrigido")
  await box.press("Enter")

  await expect(conversation(page).getByText("texto corrigido")).toBeVisible()
  await expect(conversation(page).getByText("editada")).toBeVisible()
})

test("deletes a message leaving a tombstone", async ({ page }) => {
  await openChat(page, "Ana Beatriz")
  await sendMessage(page, "para apagar")
  await messageAction(page, "para apagar", "Apagar")

  await expect(conversation(page).getByText("Esta mensagem foi apagada")).toBeVisible()
  await expect(conversation(page).getByText("para apagar")).toHaveCount(0)
})

test("pins a message and shows the banner", async ({ page }) => {
  await openChat(page, "Ana Beatriz")
  await sendMessage(page, "mensagem fixada")
  await messageAction(page, "mensagem fixada", "Fixar")

  await expect(page.getByRole("button", { name: "Desafixar" })).toBeVisible()
})

test("forwards a message to another chat", async ({ page }) => {
  await openChat(page, "Ana Beatriz")
  await sendMessage(page, "encaminhe isto")
  await messageAction(page, "encaminhe isto", "Encaminhar")

  const dialog = page.getByRole("dialog", { name: "Encaminhar mensagem" })
  await dialog.getByRole("button", { name: /Carlos Eduardo/ }).click()
  await dialog.getByRole("button", { name: /^Encaminhar/ }).click()
  // Wait for the modal to go before navigating, or the click lands on it.
  await expect(dialog).toBeHidden()

  await openChat(page, "Carlos Eduardo")
  await expect(conversation(page).getByText("encaminhe isto")).toBeVisible()
  await expect(conversation(page).getByText("Encaminhada")).toBeVisible()
})

test("selects several messages and acts on them", async ({ page }) => {
  await openChat(page, "Ana Beatriz")
  await sendMessage(page, "primeira")
  await sendMessage(page, "segunda")

  await messageAction(page, "primeira", "Selecionar")
  await conversation(page).getByText("segunda").click()

  await expect(page.getByText("2 selecionadas")).toBeVisible()
  await page.getByRole("button", { name: "Apagar" }).click()
  await expect(conversation(page).getByText("Esta mensagem foi apagada")).toHaveCount(2)
})
