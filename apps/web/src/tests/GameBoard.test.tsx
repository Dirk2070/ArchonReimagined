import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import { GameBoard } from "../components/GameBoard"
import { Position, Piece } from "@archon/core"

const mockGame = {
  getState: vi.fn(),
  getLegalMoves: vi.fn(),
  getSelectedPiece: vi.fn()
}

mockGame.getState.mockReturnValue({
  board: {
    size: 9,
    tiles: Array(9).fill(null).map(() => Array(9).fill({ type: 'neutral' }))
  },
  units: [
    {
      id: 'light-wizard',
      type: 'wizard' as const,
      side: 'light' as const,
      position: { x: 0, y: 0 },
      health: 120,
      maxHealth: 120,
      hasMoved: false
    }
  ],
  turn: 1,
  cycle: { step: 0, of: 20 },
  effects: [],
  rngSeed: 123,
  active: 'light' as const
})

mockGame.getLegalMoves.mockReturnValue([
  { x: 1, y: 0 },
  { x: 0, y: 1 }
])

mockGame.getSelectedPiece.mockImplementation((pos: Position) => {
  if (pos.x === 0 && pos.y === 0) {
    return {
      id: 'light-wizard',
      type: 'wizard' as const,
      side: 'light' as const,
      position: { x: 0, y: 0 },
      health: 120,
      maxHealth: 120,
      hasMoved: false
    }
  }
  return null
})

describe("GameBoard", () => {
  const defaultProps = {
    game: mockGame as any,
    onMove: vi.fn(),
    onCombatStart: vi.fn(),
    selectedPiece: null as Piece | null,
    onPieceSelect: vi.fn(),
    legalMoves: [] as Position[]
  }

  it("renders 9x9 board", () => {
    render(<GameBoard {...defaultProps} />)
    const cells = document.querySelectorAll('[data-testid="board-cell"], .w-8.h-8')
    expect(cells.length).toBeGreaterThan(80) // At least 81 cells
  })

  it("displays game status", () => {
    render(<GameBoard {...defaultProps} />)
    expect(screen.getByText(/Turn 1/)).toBeInTheDocument()
    expect(screen.getByText(/Light to move/)).toBeInTheDocument()
    expect(screen.getByText(/Cycle: 0\/20/)).toBeInTheDocument()
  })

  it("shows piece symbols", () => {
    render(<GameBoard {...defaultProps} />)
    expect(screen.getByText("🧙")).toBeInTheDocument()
  })

  it("highlights legal moves when piece is selected", () => {
    const props = {
      ...defaultProps,
      selectedPiece: {
        id: 'light-wizard',
        type: 'wizard' as const,
        side: 'light' as const,
        position: { x: 0, y: 0 },
        health: 120,
        maxHealth: 120,
        hasMoved: false
      },
      legalMoves: [
        { x: 1, y: 0 },
        { x: 0, y: 1 }
      ]
    }

    render(<GameBoard {...props} />)

    // Check if legal move cells have green highlighting
    const greenCells = document.querySelectorAll('.ring-green-400')
    expect(greenCells.length).toBeGreaterThan(0)
  })

  it("calls onPieceSelect when clicking on own piece", async () => {
    const user = userEvent.setup()
    const mockOnPieceSelect = vi.fn()

    render(<GameBoard {...defaultProps} onPieceSelect={mockOnPieceSelect} />)

    const wizardCell = screen.getByText("🧙")
    await user.click(wizardCell)

    expect(mockOnPieceSelect).toHaveBeenCalledWith(expect.objectContaining({
      id: 'light-wizard',
      type: 'wizard'
    }))
  })

  it("calls onMove when clicking legal move", async () => {
    const user = userEvent.setup()
    const mockOnMove = vi.fn()

    const props = {
      ...defaultProps,
      selectedPiece: {
        id: 'light-wizard',
        type: 'wizard' as const,
        side: 'light' as const,
        position: { x: 0, y: 0 },
        health: 120,
        maxHealth: 120,
        hasMoved: false
      },
      legalMoves: [{ x: 1, y: 0 }],
      onMove: mockOnMove
    }

    render(<GameBoard {...props} />)

    // Find the legal move cell (should be highlighted green)
    const moveCells = document.querySelectorAll('.ring-green-400')
    expect(moveCells.length).toBeGreaterThan(0)

    await user.click(moveCells[0])

    expect(mockOnMove).toHaveBeenCalledWith(
      { x: 0, y: 0 }, // from
      { x: 1, y: 0 }  // to
    )
  })

  it("shows piece health when selected", () => {
    const props = {
      ...defaultProps,
      selectedPiece: {
        id: 'light-wizard',
        type: 'wizard' as const,
        side: 'light' as const,
        position: { x: 0, y: 0 },
        health: 100,
        maxHealth: 120,
        hasMoved: false
      }
    }

    render(<GameBoard {...props} />)

    expect(screen.getByText("Selected: wizard at (0, 0)")).toBeInTheDocument()
    expect(screen.getByText("Health: 100/120")).toBeInTheDocument()
  })
})
