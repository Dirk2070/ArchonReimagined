import { describe, it, expect, beforeEach } from 'vitest';
import { Game, GameState, Piece, GameStateValidator, GameActionValidator, GameLogic } from './index';

describe('GameState Validation', () => {
  it('validates correct GameState', () => {
    const game = new Game();
    const state = game.getState();
    const result = GameStateValidator.validate(state);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects invalid GameState', () => {
    const result = GameStateValidator.validate({});
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('validates board size', () => {
    const invalidState = {
      board: { size: 8, tiles: [] },
      units: [],
      turn: 1,
      cycle: { step: 0, of: 20 },
      effects: [],
      rngSeed: 123,
      active: 'light'
    };
    const result = GameStateValidator.validate(invalidState);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('board.size must be 9');
  });
});

describe('GameAction Validation', () => {
  let game: Game;
  let state: GameState;

  beforeEach(() => {
    game = new Game();
    state = game.getState();
  });

  it('validates legal MOVE action', () => {
    const wizard = state.units.find(u => u.type === 'wizard' && u.side === 'light')!;
    const action = {
      type: 'MOVE',
      unitId: wizard.id,
      from: [wizard.position.x, wizard.position.y],
      to: [wizard.position.x + 1, wizard.position.y],
      cost: { ap: 1 }
    };
    const result = GameActionValidator.validate(state, action);
    expect(result.valid).toBe(true);
  });

  it('rejects MOVE to occupied position', () => {
    const wizard = state.units.find(u => u.type === 'wizard' && u.side === 'light')!;
    const occupiedPos = state.units.find(u => u.id !== wizard.id)!.position;
    const action = {
      type: 'MOVE',
      unitId: wizard.id,
      from: [wizard.position.x, wizard.position.y],
      to: [occupiedPos.x, occupiedPos.y],
      cost: { ap: 1 }
    };
    const result = GameActionValidator.validate(state, action);
    expect(result.valid).toBe(false);
  });

  it('rejects action for wrong player', () => {
    const darkUnit = state.units.find(u => u.side === 'dark')!;
    const action = {
      type: 'MOVE',
      unitId: darkUnit.id,
      from: [darkUnit.position.x, darkUnit.position.y],
      to: [darkUnit.position.x + 1, darkUnit.position.y],
      cost: { ap: 1 }
    };
    const result = GameActionValidator.validate(state, action);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('unit must belong to active player');
  });
});

describe('GameLogic - Allowed Actions', () => {
  let game: Game;
  let state: GameState;

  beforeEach(() => {
    game = new Game();
    state = game.getState();
  });

  it('returns allowed actions for light player', () => {
    const actions = GameLogic.getAllowedActions(state);
    expect(actions.length).toBeGreaterThan(0);

    // Should include MOVE actions
    const moveActions = actions.filter(a => a.type === 'MOVE');
    expect(moveActions.length).toBeGreaterThan(0);

    // Should include END_TURN
    const endTurnActions = actions.filter(a => a.type === 'END_TURN');
    expect(endTurnActions.length).toBe(1);
  });

  it('excludes moved units from actions', () => {
    // Mark a unit as moved
    const wizard = state.units.find(u => u.type === 'wizard' && u.side === 'light')!;
    wizard.hasMoved = true;

    const actions = GameLogic.getAllowedActions(state);
    const wizardActions = actions.filter(a => a.unitId === wizard.id);
    expect(wizardActions.length).toBe(0);
  });
});

describe('Piece Movement Validation', () => {
  it('wizard has correct movement range', () => {
    const wizard: Piece = {
      id: 'test-wizard',
      type: 'wizard',
      side: 'light',
      position: { x: 4, y: 4 },
      health: 120,
      maxHealth: 120,
      hasMoved: false
    };

    const game = new Game();
    const moves = game.getLegalMoves(wizard);
    expect(moves.length).toBeGreaterThan(0);

    // Wizard has range 3, so should have moves up to 3 steps away
    const maxDistance = Math.max(...moves.map(m =>
      Math.abs(m.x - wizard.position.x) + Math.abs(m.y - wizard.position.y)
    ));
    expect(maxDistance).toBeLessThanOrEqual(3);
  });

  it('golem has limited movement range', () => {
    const golem: Piece = {
      id: 'test-golem',
      type: 'golem',
      side: 'light',
      position: { x: 4, y: 4 },
      health: 250,
      maxHealth: 250,
      hasMoved: false
    };

    const game = new Game();
    const moves = game.getLegalMoves(golem);

    // Golem has range 2
    const maxDistance = Math.max(...moves.map(m =>
      Math.abs(m.x - golem.position.x) + Math.abs(m.y - golem.position.y)
    ));
    expect(maxDistance).toBeLessThanOrEqual(2);
  });
});

describe('Light Cycle Mechanics', () => {
  it('cycle progresses correctly', () => {
    const game = new Game();
    const initialState = game.getState();
    expect(initialState.cycle.step).toBe(0);

    // Simulate end turn
    game['endTurn'](); // Access private method for testing
    const newState = game.getState();
    expect(newState.cycle.step).toBe(1);
    expect(newState.turn).toBe(2);
  });

  it('cycle wraps around at 20', () => {
    const game = new Game();
    // Manually set cycle to 19
    game.getState().cycle.step = 19;

    game['endTurn']();
    expect(game.getState().cycle.step).toBe(0);
  });
});

describe('Win Conditions', () => {
  it('detects elimination victory', () => {
    const game = new Game();
    const state = game.getState();

    // Remove all dark pieces
    state.units = state.units.filter(u => u.side === 'light');

    const winner = game.checkWinCondition();
    expect(winner).toBe('light');
  });

  it('detects power point victory', () => {
    const game = new Game();
    const state = game.getState();

    // Move light pieces to power points
    const powerPoints = [
      { x: 0, y: 0 }, { x: 4, y: 0 }, { x: 8, y: 0 }, { x: 4, y: 4 }
    ];

    powerPoints.forEach((pos, index) => {
      if (state.units[index]) {
        state.units[index].position = pos;
      }
    });

    const winner = game.checkWinCondition();
    expect(winner).toBe('light');
  });
});

describe('Combat Resolution', () => {
  it('resolves combat with autoresolve', () => {
    const game = new Game();
    const state = game.getState();

    // Set up combat
    const attacker = state.units.find(u => u.side === 'light')!;
    const defender = state.units.find(u => u.side === 'dark')!;
    state.combat = {
      attacker,
      defender,
      fieldType: 'neutral'
    };

    const result = game.resolveCombatAutoresolve();
    expect(result.winner).toBeDefined();
    expect(result.loser).toBeDefined();
    expect(result.damageDealt).toBeGreaterThan(0);
  });
});
