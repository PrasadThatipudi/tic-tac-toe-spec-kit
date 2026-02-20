// Type definitions for game pieces and board state
export type GamePieceValue = "X" | "O" | null;

export interface CellPosition {
  row: number; // 0-based row index [0-2]
  col: number; // 0-based column index [0-2]
}

export interface Cell {
  value: GamePieceValue;
  position: CellPosition;
}

export interface Board {
  cells: Cell[]; // Length must equal size²
  size: number; // Grid dimension (3 for tic-tac-toe)
}

// Validation function
export function isValidBoard(board: Board): boolean {
  // Check cell count
  if (board.cells.length !== board.size * board.size) {
    return false;
  }

  // Check all positions are within bounds
  return board.cells.every(
    (cell) =>
      cell.position.row >= 0 &&
      cell.position.row < board.size &&
      cell.position.col >= 0 &&
      cell.position.col < board.size,
  );
}

// Factory function to create empty board
export function createEmptyBoard(size: number): Board {
  const cells: Cell[] = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      cells.push({
        value: null,
        position: { row, col },
      });
    }
  }

  return {
    cells,
    size,
  };
}

