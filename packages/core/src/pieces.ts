import { Piece, PieceType, Side, Position } from './types';

export class PieceFactory {
  static createPiece(type: PieceType, side: Side, position: Position, id?: string): Piece {
    const stats = this.getPieceStats(type);
    return {
      id: id || `${side}-${type}-${Date.now()}`,
      type,
      side,
      position,
      health: stats.health,
      maxHealth: stats.health,
      hasMoved: false,
    };
  }

  static getPieceStats(type: PieceType) {
    const stats = {
      wizard: { health: 120, range: 3, damage: 40 },
      dragon: { health: 200, range: 4, damage: 80 },
      unicorn: { health: 150, range: 5, damage: 60 },
      golem: { health: 250, range: 2, damage: 50 },
      knight: { health: 180, range: 3, damage: 70 },
    };
    return stats[type];
  }

  static getMovementRange(piece: Piece): Position[] {
    const { range } = this.getPieceStats(piece.type);
    const positions: Position[] = [];

    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        if (dx === 0 && dy === 0) continue; // can't move to same position
        if (Math.abs(dx) + Math.abs(dy) > range) continue; // chebyshev distance

        const newX = piece.position.x + dx;
        const newY = piece.position.y + dy;

        if (newX >= 0 && newX < 9 && newY >= 0 && newY < 9) {
          positions.push({ x: newX, y: newY });
        }
      }
    }

    return positions;
  }

  static canMoveTo(piece: Piece, target: Position, occupiedPositions: Position[]): boolean {
    const possibleMoves = this.getMovementRange(piece);
    const isValidMove = possibleMoves.some(pos => pos.x === target.x && pos.y === target.y);
    const isOccupied = occupiedPositions.some(pos => pos.x === target.x && pos.y === target.y);

    return isValidMove && !isOccupied;
  }

  static canAttack(piece: Piece, target: Position): boolean {
    return this.getMovementRange(piece).some(pos => pos.x === target.x && pos.y === target.y);
  }
}

export function initializePieces(): Piece[] {
  const pieces: Piece[] = [];

  // Light pieces (top)
  const lightPositions = [
    { x: 0, y: 0, type: 'wizard' as PieceType },
    { x: 1, y: 0, type: 'dragon' as PieceType },
    { x: 2, y: 0, type: 'unicorn' as PieceType },
    { x: 3, y: 0, type: 'golem' as PieceType },
    { x: 4, y: 0, type: 'knight' as PieceType },
    { x: 5, y: 0, type: 'golem' as PieceType },
    { x: 6, y: 0, type: 'unicorn' as PieceType },
    { x: 7, y: 0, type: 'dragon' as PieceType },
    { x: 8, y: 0, type: 'wizard' as PieceType },
    { x: 1, y: 1, type: 'knight' as PieceType },
    { x: 3, y: 1, type: 'dragon' as PieceType },
    { x: 5, y: 1, type: 'dragon' as PieceType },
    { x: 7, y: 1, type: 'knight' as PieceType },
    { x: 2, y: 2, type: 'wizard' as PieceType },
    { x: 4, y: 2, type: 'unicorn' as PieceType },
    { x: 6, y: 2, type: 'wizard' as PieceType },
    { x: 0, y: 3, type: 'golem' as PieceType },
    { x: 8, y: 3, type: 'golem' as PieceType },
  ];

  // Dark pieces (bottom)
  const darkPositions = [
    { x: 0, y: 8, type: 'wizard' as PieceType },
    { x: 1, y: 8, type: 'dragon' as PieceType },
    { x: 2, y: 8, type: 'unicorn' as PieceType },
    { x: 3, y: 8, type: 'golem' as PieceType },
    { x: 4, y: 8, type: 'knight' as PieceType },
    { x: 5, y: 8, type: 'golem' as PieceType },
    { x: 6, y: 8, type: 'unicorn' as PieceType },
    { x: 7, y: 8, type: 'dragon' as PieceType },
    { x: 8, y: 8, type: 'wizard' as PieceType },
    { x: 1, y: 7, type: 'knight' as PieceType },
    { x: 3, y: 7, type: 'dragon' as PieceType },
    { x: 5, y: 7, type: 'dragon' as PieceType },
    { x: 7, y: 7, type: 'knight' as PieceType },
    { x: 2, y: 6, type: 'wizard' as PieceType },
    { x: 4, y: 6, type: 'unicorn' as PieceType },
    { x: 6, y: 6, type: 'wizard' as PieceType },
    { x: 0, y: 5, type: 'golem' as PieceType },
    { x: 8, y: 5, type: 'golem' as PieceType },
  ];

  lightPositions.forEach(({ x, y, type }) => {
    pieces.push(PieceFactory.createPiece(type, 'light', { x, y }));
  });

  darkPositions.forEach(({ x, y, type }) => {
    pieces.push(PieceFactory.createPiece(type, 'dark', { x, y }));
  });

  return pieces;
}
