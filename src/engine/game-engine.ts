import { GameState } from '../models/game-state';
import { createEmptyBoard } from '../models/board';
import { GAME_CONFIG } from '../constants/game-config';

export function createInitialGameState(): GameState {
  return {
    board: createEmptyBoard(GAME_CONFIG.GRID_SIZE),
    currentTurn: GAME_CONFIG.INITIAL_TURN,
    moveInProgress: false,
  };
}

export { processMove, switchTurn } from './state-transitions';
export { validateMove } from './move-validator';

