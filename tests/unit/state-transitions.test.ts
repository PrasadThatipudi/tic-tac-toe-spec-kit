import { describe, test, expect } from 'vitest';
import { processMove, switchTurn } from '../../src/engine/state-transitions';
import { createEmptyBoard } from '../../src/models/board';

describe('switchTurn', () => {
  test('switches X to O', () => {
    expect(switchTurn('X')).toBe('O');
  });

  test('switches O to X', () => {
    expect(switchTurn('O')).toBe('X');
  });
});

describe('processMove', () => {
  test('places symbol in empty cell', () => {
    const state = {
      board: createEmptyBoard(3),
      currentTurn: 'X' as const,
      moveInProgress: false,
    };

    const newState = processMove(state, { row: 0, col: 0 });

    const cell = newState.board.cells.find(
      c => c.position.row === 0 && c.position.col === 0
    );
    expect(cell?.value).toBe('X');
  });

  test('switches turn after valid move', () => {
    const state = {
      board: createEmptyBoard(3),
      currentTurn: 'X' as const,
      moveInProgress: false,
    };

    const newState = processMove(state, { row: 0, col: 0 });

    expect(newState.currentTurn).toBe('O');
  });

  test('returns new state object (immutability)', () => {
    const state = {
      board: createEmptyBoard(3),
      currentTurn: 'X' as const,
      moveInProgress: false,
    };

    const newState = processMove(state, { row: 0, col: 0 });

    expect(newState).not.toBe(state);
    expect(state.currentTurn).toBe('X'); // original unchanged
  });

  test('returns original state for invalid move', () => {
    const state = {
      board: createEmptyBoard(3),
      currentTurn: 'X' as const,
      moveInProgress: true, // locked
    };

    const newState = processMove(state, { row: 0, col: 0 });

    expect(newState).toBe(state); // same reference
  });

  test('places O symbol correctly', () => {
    const state = {
      board: createEmptyBoard(3),
      currentTurn: 'O' as const,
      moveInProgress: false,
    };

    const newState = processMove(state, { row: 1, col: 1 });

    const cell = newState.board.cells.find(
      c => c.position.row === 1 && c.position.col === 1
    );
    expect(cell?.value).toBe('O');
  });

  test('preserves other cells when placing move', () => {
    const board = createEmptyBoard(3);
    board.cells[0].value = 'X'; // Pre-existing move

    const state = {
      board,
      currentTurn: 'O' as const,
      moveInProgress: false,
    };

    const newState = processMove(state, { row: 1, col: 1 });

    const firstCell = newState.board.cells.find(
      c => c.position.row === 0 && c.position.col === 0
    );
    expect(firstCell?.value).toBe('X'); // Preserved
  });

  test('does not mutate original board', () => {
    const state = {
      board: createEmptyBoard(3),
      currentTurn: 'X' as const,
      moveInProgress: false,
    };

    const originalCell = state.board.cells[0];

    processMove(state, { row: 0, col: 0 });

    expect(originalCell.value).toBeNull(); // Original unchanged
  });

  test('returns original state for occupied cell', () => {
    const board = createEmptyBoard(3);
    board.cells[0].value = 'X';

    const state = {
      board,
      currentTurn: 'O' as const,
      moveInProgress: false,
    };

    const newState = processMove(state, { row: 0, col: 0 });

    expect(newState).toBe(state);
  });

  test('returns original state for out of bounds position', () => {
    const state = {
      board: createEmptyBoard(3),
      currentTurn: 'X' as const,
      moveInProgress: false,
    };

    const newState = processMove(state, { row: 5, col: 5 });

    expect(newState).toBe(state);
  });

  test('processes multiple sequential moves correctly', () => {
    let state = {
      board: createEmptyBoard(3),
      currentTurn: 'X' as const,
      moveInProgress: false,
    };

    // Move 1: X at 0,0
    state = processMove(state, { row: 0, col: 0 });
    expect(state.currentTurn).toBe('O');

    // Move 2: O at 1,1
    state = processMove(state, { row: 1, col: 1 });
    expect(state.currentTurn).toBe('X');

    // Move 3: X at 2,2
    state = processMove(state, { row: 2, col: 2 });
    expect(state.currentTurn).toBe('O');

    // Verify all moves placed
    const cell1 = state.board.cells.find(c => c.position.row === 0 && c.position.col === 0);
    const cell2 = state.board.cells.find(c => c.position.row === 1 && c.position.col === 1);
    const cell3 = state.board.cells.find(c => c.position.row === 2 && c.position.col === 2);

    expect(cell1?.value).toBe('X');
    expect(cell2?.value).toBe('O');
    expect(cell3?.value).toBe('X');
  });
});

