import { describe, test, expect } from 'vitest';
import { GameState } from '../../src/models/game-state';
import { createEmptyBoard } from '../../src/models/board';

describe('GameState', () => {
  test('has required properties', () => {
    const state: GameState = {
      board: createEmptyBoard(3),
      currentTurn: 'X',
      moveInProgress: false,
    };

    expect(state.board).toBeDefined();
    expect(state.currentTurn).toBe('X');
    expect(state.moveInProgress).toBe(false);
  });

  test('board is valid Board type', () => {
    const state: GameState = {
      board: createEmptyBoard(3),
      currentTurn: 'X',
      moveInProgress: false,
    };

    expect(state.board.size).toBe(3);
    expect(state.board.cells.length).toBe(9);
  });

  test('currentTurn is X or O', () => {
    const stateX: GameState = {
      board: createEmptyBoard(3),
      currentTurn: 'X',
      moveInProgress: false,
    };

    const stateO: GameState = {
      board: createEmptyBoard(3),
      currentTurn: 'O',
      moveInProgress: false,
    };

    expect(stateX.currentTurn).toBe('X');
    expect(stateO.currentTurn).toBe('O');
  });

  test('moveInProgress is boolean', () => {
    const state: GameState = {
      board: createEmptyBoard(3),
      currentTurn: 'X',
      moveInProgress: true,
    };

    expect(typeof state.moveInProgress).toBe('boolean');
  });
});

