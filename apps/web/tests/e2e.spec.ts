import { test, expect } from "@playwright/test"

test("Spielzug, möglicher Kampf, KI antwortet", async ({ page }) => {
  await page.goto("http://localhost:3000")
  await page.waitForSelector("text=Archon Reimagined")

  // Figur wählen
  await page.getByText("🧙", { exact: false }).first().click()

  // Ersten grünen Move ausführen (falls verfügbar)
  const moveCell = page.locator(".ring-green-400").first()
  const moveCellCount = await moveCell.count()

  if (moveCellCount > 0) {
    await moveCell.click()

    // Warten auf mögliche Kampf-Resolution oder Zug-Ende
    await page.waitForTimeout(1000)

    // Prüfen ob KI-Reaktion erfolgt
    await expect(page.getByText(/Dark to move|Computer am Zug/i)).toBeVisible({
      timeout: 10000
    })
  } else {
    // Keine legalen Züge verfügbar - prüfen ob Spiel korrekt läuft
    expect(await page.getByText(/Turn \d+/)).toBeVisible()
  }
})

test("Settings Panel funktioniert", async ({ page }) => {
  await page.goto("http://localhost:3000")

  // Settings öffnen
  await page.getByRole("button", { name: /settings/i }).click()

  // Schwierigkeitsgrad ändern
  await page.selectOption("select", "expert")

  // Auto-resolve aktivieren
  await page.getByLabel(/auto-resolve/i).check()

  // Settings schließen
  await page.getByRole("button", { name: /close/i }).click()

  // Prüfen ob Settings geschlossen wurden
  await expect(page.getByText(/Game Settings/i)).not.toBeVisible()
})

test("New Game funktioniert", async ({ page }) => {
  await page.goto("http://localhost:3000")

  const initialTurn = await page.textContent("text=/Turn \\d+/")

  // New Game klicken
  await page.getByRole("button", { name: /new game/i }).click()

  // Prüfen ob Spiel zurückgesetzt wurde
  const newTurn = await page.textContent("text=/Turn \\d+/")
  expect(newTurn).toBe("Turn 1")
})
