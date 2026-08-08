import { expect, test, type Page } from "@playwright/test"

import { openApp } from "./helpers"

/** Workspaces take over the full width, so they're reached from the rail. */
async function openWorkspace(page: Page, name: string) {
  await page
    .getByRole("button", { name: new RegExp(`^${name}`) })
    .first()
    .click()
  await expect(page.getByRole("heading", { name })).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  await openApp(page)
})

test("the funnel shows leads by stage and moves them", async ({ page }) => {
  await openWorkspace(page, "Funil")

  // Ana is seeded at "proposta" and Carlos at "reuniao".
  await expect(page.getByRole("heading", { name: "Proposta" })).toBeVisible()
  await page.getByRole("button", { name: "Mover Ana Beatriz" }).click()
  await page.getByRole("menuitem", { name: "Abertura" }).click()

  // The card followed the stage change into the new column.
  const abertura = page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: "Abertura" }) })
  await expect(abertura.getByText("Ana Beatriz")).toBeVisible()
})

test("the client table filters and opens a conversation", async ({ page }) => {
  await openWorkspace(page, "Funil")
  await page.getByRole("tab", { name: "Clientes" }).click()

  await page.getByRole("textbox", { name: "Buscar clientes" }).fill("Vértice")
  // Anchored: the row's checkbox is labelled "Selecionar Carlos Eduardo", so an
  // unanchored match would hit two cells.
  await expect(
    page.getByRole("cell", { name: /^Carlos Eduardo/ })
  ).toBeVisible()
  await expect(page.getByRole("cell", { name: /^Mariana/ })).toHaveCount(0)

  await page.getByRole("button", { name: "Carlos Eduardo" }).click()
  await expect(
    page.getByRole("textbox", { name: "Digite uma mensagem" })
  ).toBeVisible()
})

test("bulk selection moves every picked contact at once", async ({ page }) => {
  await openWorkspace(page, "Funil")
  await page.getByRole("tab", { name: "Clientes" }).click()

  await page
    .getByRole("checkbox", { name: "Selecionar todos os visíveis" })
    .click()
  await expect(page.getByText("5 selecionados")).toBeVisible()

  // Bulk actions are commands, so they live in a menu, not a combobox.
  await page.getByRole("button", { name: "Mover etapa" }).click()
  await page.getByRole("menuitem", { name: "Abertura" }).click()

  // The bar clears itself once the batch lands.
  await expect(page.getByText("5 selecionados")).toHaveCount(0)
  // Every visible contact now reads the same stage.
  await expect(page.getByRole("cell", { name: "Abertura" })).toHaveCount(5)
})

test("carteiras totals AuC against what is still outside", async ({ page }) => {
  await openWorkspace(page, "Carteiras")

  // Seed under management: 60k (Ana) + 1.15M (Mariana) = 1.21M.
  // Still outside: 600k (Ana) + 380k (Mariana) + 320k (Carlos) + 90k declared
  // by João = 1.39M.
  // Exact match: the header repeats both figures in a single sentence.
  await expect(page.getByText("R$ 1.210.000,00", { exact: true })).toBeVisible()
  await expect(page.getByText("R$ 1.390.000,00", { exact: true })).toBeVisible()
  // The institutions holding what isn't ours are listed.
  await expect(page.getByText("Itaú", { exact: true })).toBeVisible()
  await expect(page.getByText("Bradesco", { exact: true })).toBeVisible()
})

test("the automation library reports per-contact adoption", async ({
  page,
}) => {
  await openWorkspace(page, "Automações")

  await expect(page.getByText("Parabéns de aniversário")).toBeVisible()
  // Every seeded rule reports how many contacts it's switched on for.
  await expect(page.getByText(/ligada em \d+\/\d+/).first()).toBeVisible()
})

test("a campaign previews its recipients before sending", async ({ page }) => {
  await openWorkspace(page, "Automações")
  await page.getByRole("tab", { name: "Campanhas" }).click()

  await page.getByRole("combobox", { name: "Vínculo" }).click()
  await page.getByRole("option", { name: "Cliente" }).click()
  // Mariana is the only seeded client.
  await expect(
    page.getByRole("button", { name: /Enviar para 1$/ })
  ).toBeVisible()
  await expect(page.getByText(/Prévia para Mariana/)).toBeVisible()
})

test("escape leaves a workspace back to the chats", async ({ page }) => {
  await openWorkspace(page, "Agenda")
  await page.keyboard.press("Escape")
  await expect(page.getByRole("heading", { name: "Conversas" })).toBeVisible()
})
