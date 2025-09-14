import { Field, Position, FieldType, Side } from './types';

export class Board {
  private fields: Field[][];

  constructor() {
    this.fields = this.initializeBoard();
  }

  private initializeBoard(): Field[][] {
    const board: Field[][] = [];
    for (let y = 0; y < 9; y++) {
      board[y] = [];
      for (let x = 0; x < 9; x++) {
        board[y][x] = {
          position: { x, y },
          type: this.getFieldType(x, y),
        };
      }
    }
    return board;
  }

  private getFieldType(x: number, y: number): FieldType {
    // Power points at strategic positions
    const powerPoints = [
      { x: 0, y: 0 }, { x: 4, y: 0 }, { x: 8, y: 0 },
      { x: 4, y: 4 }, { x: 4, y: 8 }
    ];

    if (powerPoints.some(p => p.x === x && p.y === y)) {
      return 'power-point';
    }

    // Permanent light fields (top 3 rows, alternating)
    if (y < 3) {
      return (x + y) % 2 === 0 ? 'permanent-light' : 'neutral';
    }

    // Permanent dark fields (bottom 3 rows, alternating)
    if (y > 5) {
      return (x + y) % 2 === 0 ? 'permanent-dark' : 'neutral';
    }

    // Middle rows are neutral
    return 'neutral';
  }

  getField(position: Position): Field | null {
    if (position.x < 0 || position.x > 8 || position.y < 0 || position.y > 8) {
      return null;
    }
    return this.fields[position.y][position.x];
  }

  updateLightCycle(cycle: number): void {
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const field = this.fields[y][x];
        if (field.type === 'neutral') {
          field.currentSide = this.getNeutralFieldSide(cycle);
        }
      }
    }
  }

  private getNeutralFieldSide(cycle: number): Side | 'neutral' {
    // 20-turn cycle: 1-5 neutral->light, 6-10 light->neutral, 11-15 neutral->dark, 16-20 dark->neutral
    const phase = cycle % 20;
    if (phase >= 0 && phase < 5) return 'light';
    if (phase >= 5 && phase < 10) return 'neutral';
    if (phase >= 10 && phase < 15) return 'dark';
    return 'neutral';
  }

  getAllFields(): Field[][] {
    return this.fields;
  }

  getPowerPoints(): Position[] {
    const powerPoints: Position[] = [];
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (this.fields[y][x].type === 'power-point') {
          powerPoints.push({ x, y });
        }
      }
    }
    return powerPoints;
  }
}
