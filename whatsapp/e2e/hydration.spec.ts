import { expect, test } from "@playwright/test"

/**
 * The store lives in localStorage, which the server cannot read. So anything
 * the server renders is a guess, and a wrong guess paints first and rewrites
 * itself a beat later — the list reorders, badges pop, counts change.
 *
 * These tests pin the contract that prevents it: the prerender carries no
 * persisted data at all, and the seed only arrives on the client.
 */

/** Names seeded into the chat list — none may reach the server render. */
const SEEDED = [
  "Ana Beatriz",
  "Mariana Costa",
  "Carlos Eduardo",
  "Suporte Técnico",
]

test("the server render carries no data localStorage could contradict", async ({
  request,
}) => {
  const html = await (await request.get("/")).text()

  for (const name of SEEDED) {
    expect(html, `"${name}" vazou para o HTML pré-renderizado`).not.toContain(
      name
    )
  }
  // The monthly goal and the client panel are both persisted, so the server
  // can only guess at them. They used to carry plausible defaults that simply
  // happened never to be on the opening screen — an invariant of the layout,
  // not a property of the store. These pin it down.
  expect(html, "a meta mensal padrão vazou para o pré-render").not.toContain(
    "500.000"
  )
  expect(html, "o painel do cliente vazou para o pré-render").not.toContain(
    "Painel do cliente"
  )

  // Placeholder rows stand in for the list until the real state lands.
  expect(html).toContain("animate-pulse")
})

test("nothing that decides the opening screen is persisted", async ({
  page,
}) => {
  // `monthlyGoal` and `preferences` still carry hardcoded defaults that
  // localStorage overwrites, so they would flash if they were ever on screen
  // at first paint. They aren't, because the app always opens on Conversas
  // with no chat selected — persisting `view` or `selectedId` would break
  // that. This guards the invariant rather than leaving it implicit.
  await page.goto("/?e2e=1")
  await page.waitForTimeout(600)

  const keys = await page.evaluate(() => {
    const raw = window.localStorage.getItem("whatsapp-shadcn:state:v3")
    return Object.keys(JSON.parse(raw ?? "{}")).sort()
  })

  expect(keys).toEqual([
    "automations",
    "blocked",
    "calls",
    "campaigns",
    "chats",
    "communities",
    "insights",
    "monthlyGoal",
    "pending",
    "preferences",
  ])
})

test("no counter renders before the store knows the real numbers", async ({
  page,
}) => {
  // Block the JS so the pre-hydration paint is the only thing on screen.
  await page.route("**/*.js", (route) => route.abort())
  await page.goto("/")

  // Guard the guard: if the shell itself didn't render, the assertions below
  // would pass for the wrong reason.
  await expect(page.getByRole("heading", { name: "Conversas" })).toBeVisible()
  await expect(page.locator("nav")).toBeVisible()

  // The archived row and the rail badges are both derived from persisted
  // state; showing either now means showing a number that may be wrong.
  await expect(page.getByText("Arquivadas")).toHaveCount(0)
  await expect(page.locator("nav").getByText(/^\d+$/)).toHaveCount(0)
})
