import { describe, test, expect } from 'vitest';
import { getCellFromCoordinates } from '../../src/input/click-handler';

describe('getCellFromCoordinates', () => {
  test('maps top-left cell correctly', () => {
    const position = getCellFromCoordinates(50, 50, 100, 3);
    expect(position).toEqual({ row: 0, col: 0 });
  });

  test('maps center cell correctly', () => {
    const position = getCellFromCoordinates(150, 150, 100, 3);
    expect(position).toEqual({ row: 1, col: 1 });
  });

  test('maps bottom-right cell correctly', () => {
    const position = getCellFromCoordinates(250, 250, 100, 3);
    expect(position).toEqual({ row: 2, col: 2 });
  });

  test('returns null for coordinates outside grid', () => {
    const position = getCellFromCoordinates(350, 250, 100, 3);
    expect(position).toBeNull();
  });

  test('handles cell boundaries correctly', () => {
    // Click on boundary line (assigned to right/bottom cell)
    const position = getCellFromCoordinates(100, 100, 100, 3);
    expect(position).toEqual({ row: 1, col: 1 });
  });

  test('maps top-center cell correctly', () => {
    const position = getCellFromCoordinates(150, 50, 100, 3);
    expect(position).toEqual({ row: 0, col: 1 });
  });

  test('maps middle-left cell correctly', () => {
    const position = getCellFromCoordinates(50, 150, 100, 3);
    expect(position).toEqual({ row: 1, col: 0 });
  });

  test('returns null for negative coordinates', () => {
    const position = getCellFromCoordinates(-10, 50, 100, 3);
    expect(position).toBeNull();
  });

  test('returns null for y coordinate outside grid', () => {
    const position = getCellFromCoordinates(50, 350, 100, 3);
    expect(position).toBeNull();
  });

  test('maps corner boundary correctly', () => {
    const position = getCellFromCoordinates(0, 0, 100, 3);
    expect(position).toEqual({ row: 0, col: 0 });
  });

  test('handles edge of grid correctly', () => {
    const position = getCellFromCoordinates(299, 299, 100, 3);
    expect(position).toEqual({ row: 2, col: 2 });
  });
});

