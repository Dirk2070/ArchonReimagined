import { GameState, Move, Position, Piece, Side, CombatResult } from './types';
import { Board } from './board';
import { PieceFactory, initializePieces } from './pieces';

export class Game {
  private state: GameState;
  private board: Board;

  constructor() {
    this.board = new Board();
    this.state = this.initializeGame();
  }

  private initializeGame(): GameState {
    const pieces = initializePieces();
    this.board.getPowerPoints();

    return {
      board: {
        size: 9,
        tiles: this.board.getAllFields(),
      },
      units: pieces,
      turn: 1,
      cycle: {
        step: 0,
        of: 20,
      },
      effects: [],
      rngSeed: Math.floor(Math.random() * 1000000),
      active: 'light',
      gameMode: 'strategy',
    };
  }

  getState(): GameState {
    return { ...this.state };
  }

  getLegalMoves(piece: Piece): Position[] {
    const occupiedPositions = this.state.units
      .filter(p => p.id !== piece.id)
      .map(p => p.position);

    return PieceFactory.getMovementRange(piece)
      .filter(pos => PieceFactory.canMoveTo(piece, pos, occupiedPositions));
  }

  makeMove(move: Move): boolean {
    const piece = this.state.units.find(p => p.id === move.piece.id);
    if (!piece || piece.side !== this.state.active || piece.hasMoved) {
      return false;
    }

    const legalMoves = this.getLegalMoves(piece);
    const isLegal = legalMoves.some(pos => pos.x === move.to.x && pos.y === move.to.y);

    if (!isLegal) {
      return false;
    }

    // Check if there's an enemy piece at target position
    const targetPiece = this.state.units.find(p =>
      p.position.x === move.to.x && p.position.y === move.to.y && p.side !== piece.side
    );

    if (targetPiece) {
      // Combat triggered
      this.state.gameMode = 'combat';
      this.state.combat = {
        attacker: piece,
        defender: targetPiece,
        fieldType: this.board.getField(move.to)?.type || 'neutral',
      };
      return true;
    }

    // Normal move
    piece.position = move.to;
    piece.hasMoved = true;

    this.endTurn();
    return true;
  }

  resolveCombatAutoresolve(): CombatResult {
    if (!this.state.combat) {
      throw new Error('No combat in progress');
    }

    const { attacker, defender } = this.state.combat;

    // Simple damage calculation
    let attackerDamage = PieceFactory.getPieceStats(attacker.type).damage;
    let defenderDamage = PieceFactory.getPieceStats(defender.type).damage;

    // Field advantage
    const field = this.board.getField(attacker.position);
    if (field?.currentSide === attacker.side) {
      attackerDamage *= 1.25;
    } else if (field?.currentSide && field.currentSide !== attacker.side) {
      attackerDamage *= 0.85;
    }

    // Apply damage
    defender.health -= attackerDamage;
    attacker.health -= defenderDamage;

    let winner: Piece;
    let loser: Piece;
    let damageDealt: number;

    if (defender.health <= 0 && attacker.health <= 0) {
      // Both die - attacker wins by initiative
      winner = attacker;
      loser = defender;
      damageDealt = attackerDamage;
    } else if (defender.health <= 0) {
      winner = attacker;
      loser = defender;
      damageDealt = attackerDamage;
    } else if (attacker.health <= 0) {
      winner = defender;
      loser = attacker;
      damageDealt = defenderDamage;
    } else {
      // Both survive - higher health wins
      winner = attacker.health > defender.health ? attacker : defender;
      loser = attacker.health > defender.health ? defender : attacker;
      damageDealt = Math.max(attackerDamage, defenderDamage);
    }

    // Remove loser from board
    this.state.units = this.state.units.filter(p => p.id !== loser.id);

    // Move winner to position if attacker won
    if (winner.id === attacker.id) {
      winner.position = defender.position;
    }

    this.state.gameMode = 'strategy';
    this.state.combat = undefined;

    this.endTurn();

    return { winner, loser, damageDealt };
  }

  private endTurn(): void {
    // Reset moved flags
    this.state.units.forEach(piece => {
      if (piece.side === this.state.active) {
        piece.hasMoved = false;
      }
    });

    // Switch player
    this.state.active = this.state.active === 'light' ? 'dark' : 'light';
    this.state.turn++;

    // Update light cycle
    this.state.cycle.step = (this.state.cycle.step + 1) % 20;
    this.board.updateLightCycle(this.state.cycle.step);
  }

  checkWinCondition(): Side | null {
    const lightPieces = this.state.units.filter(p => p.side === 'light');
    const darkPieces = this.state.units.filter(p => p.side === 'dark');

    // Total elimination
    if (lightPieces.length === 0) return 'dark';
    if (darkPieces.length === 0) return 'light';

    // Power point control
    const powerPoints = this.board.getPowerPoints();
    const controlledByLight = powerPoints.filter(pos =>
      lightPieces.some(p => p.position.x === pos.x && p.position.y === pos.y)
    ).length;

    const controlledByDark = powerPoints.filter(pos =>
      darkPieces.some(p => p.position.x === pos.x && p.position.y === pos.y)
    ).length;

    if (controlledByLight >= 3) return 'light';
    if (controlledByDark >= 3) return 'dark';

    return null;
  }

  getSelectedPiece(position: Position): Piece | null {
    return this.state.units.find(p =>
      p.position.x === position.x && p.position.y === position.y
    ) || null;
  }
}
