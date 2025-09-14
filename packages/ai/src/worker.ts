import { expose } from 'comlink'
import { createAIPlayer } from './ai'
import { GameState, Difficulty } from '@archon/core'

export class AIWorker {
  private aiPlayer: ReturnType<typeof createAIPlayer> | null = null

  init(difficulty: Difficulty) {
    this.aiPlayer = createAIPlayer(difficulty)
  }

  calculateBestMove(gameState: GameState) {
    if (!this.aiPlayer) {
      throw new Error('AI not initialized')
    }

    // Mock game object for AI calculation
    const mockGame = {
      getState: () => gameState,
      getLegalMoves: (piece: any) => {
        // Simple movement calculation (placeholder)
        const moves = []
        for (let dx = -3; dx <= 3; dx++) {
          for (let dy = -3; dy <= 3; dy++) {
            if (dx === 0 && dy === 0) continue
            const newX = piece.position.x + dx
            const newY = piece.position.y + dy
            if (newX >= 0 && newX < 9 && newY >= 0 && newY < 9) {
              moves.push({ x: newX, y: newY })
            }
          }
        }
        return moves
      }
    }

    return this.aiPlayer.calculateBestMove(mockGame as any, gameState)
  }
}

const aiWorker = new AIWorker()
expose(aiWorker)
