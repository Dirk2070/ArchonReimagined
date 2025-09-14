import "@testing-library/jest-dom"
import { vi } from "vitest"

// Mock für @archon/core, @archon/ai, @archon/arena
vi.mock('@archon/core', () => ({
  Game: vi.fn(() => ({
    getState: vi.fn(() => ({
      board: { size: 9, tiles: Array(9).fill(null).map(() => Array(9).fill({ type: 'neutral' })) },
      units: [],
      turn: 1,
      cycle: { step: 0, of: 20 },
      effects: [],
      rngSeed: 123,
      active: 'light'
    })),
    getLegalMoves: vi.fn(() => []),
    makeMove: vi.fn(() => true),
    checkWinCondition: vi.fn(() => null),
    getSelectedPiece: vi.fn(() => null)
  }))
}));

vi.mock('@archon/ai', () => ({
  createAIPlayer: vi.fn(() => ({
    calculateBestMove: vi.fn(() => null)
  }))
}));

vi.mock('@archon/arena', () => ({
  Arena: vi.fn(() => null)
}));
