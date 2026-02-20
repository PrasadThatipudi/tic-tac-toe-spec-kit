import { Board } from './board';
import { PlayerSymbol, MoveFailureReason } from '../constants/game-config';

export interface GameState {
  board: Board;
  currentTurn: PlayerSymbol;
  moveInProgress: boolean;
}

export type MoveResult =
  | { success: true }
  | { success: false; reason: MoveFailureReason };

