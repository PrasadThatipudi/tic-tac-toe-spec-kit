import { describe, test, expect } from "vitest";
import { isValidBoard, Board } from "../../src/models/board";
import { createDemoBoard } from "../../src/models/demo-board";

describe("Board validation", () => {
  test("valid 3x3 board passes validation", () => {
    const board: Board = {
      size: 3,
      cells: Array.from({ length: 9 }, (_, i) => ({
        value: null,
        position: { row: Math.floor(i / 3), col: i % 3 },
      })),
    };

    expect(isValidBoard(board)).toBe(true);
  });

  test("board with wrong cell count fails validation", () => {
    const board: Board = { size: 3, cells: [] };
    expect(isValidBoard(board)).toBe(false);
  });

  test("demo board is valid", () => {
    const board = createDemoBoard();
    expect(isValidBoard(board)).toBe(true);
    expect(board.cells).toHaveLength(9);
  });
});
