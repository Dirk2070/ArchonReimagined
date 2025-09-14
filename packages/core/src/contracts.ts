import { GameState, GameAction, Position, Piece } from './types';
import { PieceFactory } from './pieces';

export class GameStateValidator {
  static validate(state: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!state || typeof state !== 'object') {
      errors.push('GameState must be an object');
      return { valid: false, errors };
    }

    // Board validation
    if (!state.board || typeof state.board !== 'object') {
      errors.push('board is required');
    } else {
      if (state.board.size !== 9) {
        errors.push('board.size must be 9');
      }
      if (!Array.isArray(state.board.tiles) || state.board.tiles.length !== 9) {
        errors.push('board.tiles must be 9x9 array');
      }
    }

    // Units validation
    if (!Array.isArray(state.units)) {
      errors.push('units must be an array');
    } else {
      state.units.forEach((unit: any, index: number) => {
        if (!unit.id || !unit.type || !unit.side || !unit.position) {
          errors.push(`unit[${index}] missing required fields`);
        }
        if (unit.health < 0 || unit.health > unit.maxHealth) {
          errors.push(`unit[${index}] invalid health values`);
        }
      });
    }

    // Turn and cycle validation
    if (typeof state.turn !== 'number' || state.turn < 1) {
      errors.push('turn must be a positive number');
    }

    if (!state.cycle || typeof state.cycle.step !== 'number' || state.cycle.of !== 20) {
      errors.push('cycle must have step (0-19) and of: 20');
    }

    // Active player validation
    if (!['light', 'dark'].includes(state.active)) {
      errors.push('active must be "light" or "dark"');
    }

    // RNG seed validation
    if (typeof state.rngSeed !== 'number') {
      errors.push('rngSeed must be a number');
    }

    return { valid: errors.length === 0, errors };
  }
}

export class GameActionValidator {
  static validate(state: GameState, action: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!action || typeof action !== 'object') {
      errors.push('GameAction must be an object');
      return { valid: false, errors };
    }

    // Type validation
    const validTypes = ['MOVE', 'ATTACK', 'SPELL', 'END_TURN'];
    if (!validTypes.includes(action.type)) {
      errors.push(`type must be one of: ${validTypes.join(', ')}`);
    }

    // Unit validation
    const unit = state.units.find(u => u.id === action.unitId);
    if (!unit) {
      errors.push('unitId must reference an existing unit');
    } else {
      // Unit belongs to active player
      if (unit.side !== state.active) {
        errors.push('unit must belong to active player');
      }

      // Unit hasn't moved this turn
      if (unit.hasMoved && action.type === 'MOVE') {
        errors.push('unit has already moved this turn');
      }
    }

    // Position validation
    if (action.from) {
      if (!Array.isArray(action.from) || action.from.length !== 2) {
        errors.push('from must be [x,y] array');
      } else if (action.from[0] !== unit?.position.x || action.from[1] !== unit?.position.y) {
        errors.push('from must match unit position');
      }
    }

    if (action.to) {
      if (!Array.isArray(action.to) || action.to.length !== 2) {
        errors.push('to must be [x,y] array');
      } else if (action.to[0] < 0 || action.to[0] > 8 || action.to[1] < 0 || action.to[1] > 8) {
        errors.push('to must be within board bounds (0-8)');
      }
    }

    // Type-specific validation
    switch (action.type) {
      case 'MOVE':
        if (!action.from || !action.to) {
          errors.push('MOVE requires from and to positions');
        } else {
          const legalMoves = PieceFactory.getMovementRange(unit!);
          const occupiedPositions = state.units
            .filter(u => u.id !== unit!.id)
            .map(u => u.position);

          const isLegal = legalMoves.some(pos =>
            pos.x === action.to[0] && pos.y === action.to[1]
          ) && !occupiedPositions.some(pos =>
            pos.x === action.to[0] && pos.y === action.to[1]
          );

          if (!isLegal) {
            errors.push('MOVE to invalid position');
          }
        }
        break;

      case 'ATTACK':
        if (!action.to) {
          errors.push('ATTACK requires to position');
        } else {
          const target = state.units.find(u =>
            u.position.x === action.to[0] && u.position.y === action.to[1] && u.side !== unit!.side
          );
          if (!target) {
            errors.push('ATTACK requires enemy unit at target position');
          }
        }
        break;
    }

    return { valid: errors.length === 0, errors };
  }
}

export class GameLogic {
  static getAllowedActions(state: GameState): GameAction[] {
    const actions: GameAction[] = [];

    // Get all units of active player that haven't moved
    const availableUnits = state.units.filter(
      unit => unit.side === state.active && !unit.hasMoved
    );

    availableUnits.forEach(unit => {
      // Legal moves
      const legalMoves = PieceFactory.getMovementRange(unit);
      const occupiedPositions = state.units
        .filter(u => u.id !== unit.id)
        .map(u => u.position);

      legalMoves
        .filter(pos => !occupiedPositions.some(occ => occ.x === pos.x && occ.y === pos.y))
        .forEach(pos => {
          actions.push({
            type: 'MOVE',
            unitId: unit.id,
            from: [unit.position.x, unit.position.y],
            to: [pos.x, pos.y],
            cost: { ap: 1 }
          });
        });

      // Legal attacks
      legalMoves.forEach(pos => {
        const target = state.units.find(u =>
          u.position.x === pos.x && u.position.y === pos.y && u.side !== unit.side
        );
        if (target) {
          actions.push({
            type: 'ATTACK',
            unitId: unit.id,
            from: [unit.position.x, unit.position.y],
            to: [pos.x, pos.y],
            cost: { ap: 1 }
          });
        }
      });
    });

    // End turn action (always available)
    actions.push({
      type: 'END_TURN',
      unitId: '',
      cost: { ap: 0 }
    });

    return actions;
  }

  static applyAction(state: GameState, action: GameAction): GameState {
    const newState = JSON.parse(JSON.stringify(state)); // Deep clone

    switch (action.type) {
      case 'MOVE':
        const unit = newState.units.find((u: Piece) => u.id === action.unitId);
        if (unit && action.to) {
          unit.position = { x: action.to[0], y: action.to[1] };
          unit.hasMoved = true;
        }
        break;

      case 'ATTACK':
        // Combat logic would go here
        const attacker = newState.units.find((u: Piece) => u.id === action.unitId);
        if (attacker && action.to) {
          const defender = newState.units.find((u: Piece) =>
            u.position.x === action.to![0] && u.position.y === action.to![1]
          );
          if (defender) {
            newState.gameMode = 'combat';
            newState.combat = {
              attacker,
              defender,
              fieldType: 'neutral' // Would need to look up actual field type
            };
          }
        }
        break;

      case 'END_TURN':
        // End turn logic
        newState.units.forEach((u: any) => {
          if (u.side === newState.active) {
            u.hasMoved = false;
          }
        });
        newState.active = newState.active === 'light' ? 'dark' : 'light';
        newState.turn++;
        newState.cycle.step = (newState.cycle.step + 1) % 20;
        break;
    }

    return newState;
  }
}
