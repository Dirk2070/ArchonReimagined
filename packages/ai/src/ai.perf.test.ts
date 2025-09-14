import { describe, it, expect } from "vitest"
import { createAIPlayer } from "./ai"
import { Game } from "@archon/core"

describe("KI Performance", () => {
  it("Normal unter 80ms", () => {
    const game = new Game()
    // Setze KI am Zug (Dark)
    const state = game.getState()
    state.active = 'dark'

    const ai = createAIPlayer('normal')
    const t0 = performance.now()
    const move = ai.calculateBestMove(game, state)
    const dt = performance.now() - t0

    expect(dt).toBeLessThan(80)
    expect(move).toBeDefined()
  })

  it("Expert unter 200ms", () => {
    const game = new Game()
    // Setze KI am Zug (Dark)
    const state = game.getState()
    state.active = 'dark'

    const ai = createAIPlayer('expert')
    const t0 = performance.now()
    const move = ai.calculateBestMove(game, state)
    const dt = performance.now() - t0

    expect(dt).toBeLessThan(200)
    expect(move).toBeDefined()
  })

  it("keine Endlosschleife", () => {
    const game = new Game()
    const state = game.getState()
    state.active = 'dark'

    const ai = createAIPlayer('normal')

    // Test mit Timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Timeout")), 5000)
    })

    const aiPromise = new Promise((resolve) => {
      const move = ai.calculateBestMove(game, state)
      resolve(move)
    })

    return Promise.race([aiPromise, timeoutPromise])
  })

  it("100 Züge ohne Exception", () => {
    const game = new Game()
    const ai = createAIPlayer('normal')

    for (let i = 0; i < 100; i++) {
      const state = game.getState()
      if (state.active === 'dark') {
        expect(() => {
          ai.calculateBestMove(game, state)
        }).not.toThrow()
      }
      // Simuliere Zug-Ende
      game['endTurn']()
    }
  })
})
