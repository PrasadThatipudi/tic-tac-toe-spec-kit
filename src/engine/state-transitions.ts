import { GameState } from '../models/game-state';
import { Board, CellPosition, GamePieceValue } from '../models/board';
import { PlayerSymbol } from '../constants/game-config';
import { validateMove } from './move-validator';

export function switchTurn(current: PlayerSymbol): PlayerSymbol {
  return current === 'X' ? 'O' : 'X';
}

export function processMove(
  state: GameState,
  position: CellPosition
): GameState {
  // Validate move
  const validation = validateMove(state, position);
  if (!validation.success) {
    return state; // return unchanged
  }

  // Create new board with move placed
  const newBoard = updateBoardWithMove(
    state.board,
    position,
    state.currentTurn
  );

  // Return new state
  return {
    board: newBoard,
    currentTurn: switchTurn(state.currentTurn),
    moveInProgress: false,
  };
}

function updateBoardWithMove(
  board: Board,
  position: CellPosition,
  symbol: PlayerSymbol
): Board {
  // Create new cells array with updated cell
  const newCells = board.cells.map(cell => {
    if (
      cell.position.row === position.row &&
      cell.position.col === position.col
    ) {
      return {
        ...cell,
        value: symbol as GamePieceValue,
      };
    }
    return cell;
  });

  return {
    ...board,
    cells: newCells,
  };
}

