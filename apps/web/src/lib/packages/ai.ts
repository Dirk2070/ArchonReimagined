import { Game, GameState, Move, Piece, Position, Difficulty, Side } from './index';

export class AIPlayer {
  private difficulty: Difficulty;

  constructor(difficulty: Difficulty) {
    this.difficulty = difficulty;
  }

  calculateBestMove(game: Game, state: GameState): Move | null {
    const availablePieces = state.units.filter(
      (piece: Piece) => piece.side === state.active && !piece.hasMoved
    );

    if (availablePieces.length === 0) return null;

    const movesWithScores = availablePieces.flatMap((piece: Piece) => {
      const legalMoves = game.getLegalMoves(piece);
      return legalMoves.map((move: Position) => ({
        move: { from: piece.position, to: move, piece },
        score: this.evaluateMove(piece, move, state)
      }));
    });

    if (movesWithScores.length === 0) return null;

    // Sort by score descending
    movesWithScores.sort((a: any, b: any) => b.score - a.score);

    // Apply difficulty randomness
    const randomFactor = this.getRandomFactor();
    const selectedIndex = Math.min(
      Math.floor(Math.random() * (movesWithScores.length * randomFactor)),
      movesWithScores.length - 1
    );

    return movesWithScores[selectedIndex].move;
  }

  private evaluateMove(piece: Piece, target: Position, state: GameState): number {
    let score = 0;

    // Base movement score
    score += 10;

    // Check if attacking enemy
    const enemyPiece = state.units.find((p: Piece) =>
      p.position.x === target.x && p.position.y === target.y && p.side !== piece.side
    );

    if (enemyPiece) {
      // Combat evaluation
      score += this.evaluateCombat(piece, enemyPiece, target, state) * 100;
    } else {
      // Strategic positioning
      score += this.evaluatePosition(piece, target, state);
    }

    // Power point control
    // Check if target is a power point (simplified)
    const isPowerPoint = target.x === 4 && target.y === 4; // Center is power point
    if (isPowerPoint) {
      score += 50;
    }

    // Light cycle consideration
    score += this.evaluateLightCycle(piece, target, state);

    return score;
  }

  private evaluateCombat(attacker: Piece, defender: Piece, position: Position, state: GameState): number {
    const field = state.board.tiles[position.y][position.x];

    let attackerScore = attacker.health;
    let defenderScore = defender.health;

    // Field advantage
    if (field.currentSide === attacker.side) {
      attackerScore *= 1.25;
    } else if (field.currentSide && field.currentSide !== attacker.side) {
      attackerScore *= 0.85;
    }

    // Piece type advantages (simplified)
    if (attacker.type === 'dragon' && defender.type === 'knight') attackerScore *= 1.2;
    if (attacker.type === 'knight' && defender.type === 'wizard') attackerScore *= 1.2;
    if (attacker.type === 'wizard' && defender.type === 'dragon') attackerScore *= 1.2;

    return attackerScore > defenderScore ? 1 : -1;
  }

  private evaluatePosition(piece: Piece, position: Position, state: GameState): number {
    let score = 0;

    // Prefer center positions
    const centerDistance = Math.abs(4 - position.x) + Math.abs(4 - position.y);
    score += (8 - centerDistance) * 2;

    // Avoid own pieces clustering
    const nearbyAllies = state.units.filter((p: Piece) =>
      p.side === piece.side &&
      Math.abs(p.position.x - position.x) <= 1 &&
      Math.abs(p.position.y - position.y) <= 1 &&
      !(p.position.x === position.x && p.position.y === position.y)
    ).length;
    score -= nearbyAllies * 5;

    return score;
  }

  private evaluateLightCycle(piece: Piece, position: Position, state: GameState): number {
    state.board.tiles[position.y][position.x];

    // Future light cycle prediction (simplified)
    const futureCycle = (state.cycle.step + 3) % 20;
    let futureSide: Side | 'neutral' = 'neutral';

    if (futureCycle >= 0 && futureCycle < 5) futureSide = 'light';
    else if (futureCycle >= 10 && futureCycle < 15) futureSide = 'dark';

    if (futureSide === piece.side) return 20;
    if (futureSide !== 'neutral' && futureSide !== piece.side) return -10;

    return 0;
  }

  private getRandomFactor(): number {
    switch (this.difficulty) {
      case 'beginner': return 0.6; // More random
      case 'normal': return 0.9;   // Some randomness
      case 'expert': return 0.95;  // Mostly optimal
      default: return 0.9;
    }
  }
}

export function createAIPlayer(difficulty: Difficulty): AIPlayer {
  return new AIPlayer(difficulty);
}
