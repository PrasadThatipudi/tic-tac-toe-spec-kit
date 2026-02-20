import { GameState, MoveResult } from '../models/game-state';
import { CellPosition } from '../models/board';
import { MOVE_VALIDATION } from '../constants/game-config';

export function validateMove(
  state: GameState,
  position: CellPosition
): MoveResult {
  // Check move processing lock
  if (state.moveInProgress) {
    return { success: false, reason: MOVE_VALIDATION.REASONS.MOVE_IN_PROGRESS };
  }

  // Check position bounds
  if (
    position.row < 0 ||
    position.row >= state.board.size ||
    position.col < 0 ||
    position.col >= state.board.size
  ) {
    return { success: false, reason: MOVE_VALIDATION.REASONS.INVALID_POSITION };
  }

  // Find cell at position
  const cell = state.board.cells.find(
    c => c.position.row === position.row && c.position.col === position.col
  );

  // Check cell is empty
  if (cell && cell.value !== null) {
    return { success: false, reason: MOVE_VALIDATION.REASONS.CELL_OCCUPIED };
  }

  return { success: true };
}

