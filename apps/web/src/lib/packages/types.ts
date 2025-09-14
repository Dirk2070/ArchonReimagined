export type Side = 'light' | 'dark';
export type PieceType = 'wizard' | 'dragon' | 'unicorn' | 'golem' | 'knight';
export type FieldType = 'permanent-light' | 'permanent-dark' | 'neutral' | 'power-point';
export type Difficulty = 'beginner' | 'normal' | 'expert';

export interface Position {
  x: number;
  y: number;
}

export interface Piece {
  id: string;
  type: PieceType;
  side: Side;
  position: Position;
  health: number;
  maxHealth: number;
  hasMoved: boolean;
}

export interface Field {
  position: Position;
  type: FieldType;
  currentSide?: Side | 'neutral'; // for neutral fields during light cycle
}

export interface GameState {
  board: {
    size: 9;
    tiles: Field[][];
  };
  units: Piece[];
  turn: number;
  cycle: {
    step: number;
    of: 20;
  };
  effects: any[]; // For future extensions
  rngSeed: number;
  active: Side;
  gameMode?: 'strategy' | 'combat';
  combat?: {
    attacker: Piece;
    defender: Piece;
    fieldType: FieldType;
  };
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
}

export interface CombatResult {
  winner: Piece;
  loser: Piece;
  damageDealt: number;
}

export interface GameAction {
  type: 'MOVE' | 'ATTACK' | 'SPELL' | 'END_TURN';
  unitId: string;
  from?: [number, number];
  to?: [number, number];
  payload?: any;
  cost?: {
    ap?: number;
    mp?: number;
  };
}
