import { describe, test, expect } from 'vitest';
import { validateMove } from '../../src/engine/move-validator';
import { GameState } from '../../src/models/game-state';
import { createEmptyBoard, Board, Cell } from '../../src/models/board';

describe('validateMove', () => {
  test('succeeds for empty cell', () => {
    const state: GameState = {
      board: createEmptyBoard(3),
      currentTurn: 'X',
      moveInProgress: false,
    };

    const result = validateMove(state, { row: 0, col: 0 });

    expect(result.success).toBe(true);
  });

  test('fails when move in progress', () => {
    const state: GameState = {
      board: createEmptyBoard(3),
      currentTurn: 'X',
      moveInProgress: true, // locked
    };

    const result = validateMove(state, { row: 0, col: 0 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('move-in-progress');
    }
  });

  test('fails for occupied cell', () => {
    const board: Board = createEmptyBoard(3);
    // Set cell 0,0 to 'X'
    board.cells[0].value = 'X';

    const state: GameState = {
      board,
      currentTurn: 'O',
      moveInProgress: false,
    };

    const result = validateMove(state, { row: 0, col: 0 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('cell-occupied');
    }
  });

  test('fails for invalid position - row too large', () => {
    const state: GameState = {
      board: createEmptyBoard(3),
      currentTurn: 'X',
      moveInProgress: false,
    };

    const result = validateMove(state, { row: 5, col: 0 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('invalid-position');
    }
  });

  test('fails for invalid position - negative row', () => {
    const state: GameState = {
      board: createEmptyBoard(3),
      currentTurn: 'X',
      moveInProgress: false,
    };

    const result = validateMove(state, { row: -1, col: 0 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('invalid-position');
    }
  });

  test('fails for invalid position - col too large', () => {
    const state: GameState = {
      board: createEmptyBoard(3),
      currentTurn: 'X',
      moveInProgress: false,
    };

    const result = validateMove(state, { row: 0, col: 5 });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('invalid-position');
    }
  });

  test('succeeds for all empty cells', () => {
    const state: GameState = {
      board: createEmptyBoard(3),
      currentTurn: 'X',
      moveInProgress: false,
    };

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const result = validateMove(state, { row, col });
        expect(result.success).toBe(true);
      }
    }
  });
});

