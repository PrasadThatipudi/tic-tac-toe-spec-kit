export type PlayerSymbol = 'X' | 'O';

export const GAME_CONFIG = {
  INITIAL_TURN: 'X' as PlayerSymbol,
  PLAYERS: ['X', 'O'] as const,
  GRID_SIZE: 3,
} as const;

export const MOVE_VALIDATION = {
  REASONS: {
    CELL_OCCUPIED: 'cell-occupied',
    MOVE_IN_PROGRESS: 'move-in-progress',
    INVALID_POSITION: 'invalid-position',
    BOARD_FULL: 'board-full',
  },
} as const;

export type MoveFailureReason =
  | 'cell-occupied'
  | 'move-in-progress'
  | 'invalid-position'
  | 'board-full';

