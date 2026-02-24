# Quickstart: Game Over Detection

**Feature**: 003-game-over-detection  
**Date**: 2026-02-20  
**Purpose**: Developer guide for implementing game-over detection with TDD workflow

## Overview

This quickstart guide walks through implementing game-over detection using Test-Driven Development. Follow the Red-Green-Refactor cycle for each module, starting with tests and building up to a complete, tested implementation.

## Prerequisites

- ✅ Feature 001 (render-dummy-board) implemented
- ✅ Feature 002 (interactive-gameplay) implemented
- ✅ Vitest configured with jsdom environment
- ✅ TypeScript strict mode enabled
- ✅ Canvas mocking setup in tests/setup.ts

## Implementation Order

Follow this sequence to maintain dependency order and enable incremental testing:

1. **Constants & Types** (no tests needed, just definitions)
2. **Win Detector Module** (core logic, 30+ tests)
3. **State Transitions Extension** (integration, 22+ tests)
4. **Move Validator Extension** (validation, 3+ tests)
5. **Result Display Module** (UI logic, 8+ tests)
6. **Board Renderer Extension** (rendering, 6+ tests)
7. **Main Integration** (wire everything together)

---

## Phase 1: Constants & Types

### Step 1.1: Extend game-config.ts

**File**: `src/constants/game-config.ts`

**Add**:
```typescript
// Existing exports...

// NEW: Game status enum
export type GameStatus = 'ACTIVE' | 'X_WON' | 'O_WON' | 'DRAW';

// NEW: Win patterns (all 8 winning lines)
export const WIN_PATTERNS: readonly CellPosition[][] = [
  // Rows
  [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }],
  [{ row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }],
  [{ row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }],
  // Columns
  [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }],
  [{ row: 0, col: 1 }, { row: 1, col: 1 }, { row: 2, col: 1 }],
  [{ row: 0, col: 2 }, { row: 1, col: 2 }, { row: 2, col: 2 }],
  // Diagonals
  [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 }],
  [{ row: 0, col: 2 }, { row: 1, col: 1 }, { row: 2, col: 0 }],
] as const;

// NEW: Result messages
export const RESULT_MESSAGES: Record<GameStatus, string> = {
  ACTIVE: '',
  X_WON: 'Player X wins!',
  O_WON: 'Player O wins!',
  DRAW: "It's a draw!",
} as const;

// NEW: Add game-over to move failure reasons
export type MoveFailureReason =
  | 'cell-occupied'
  | 'move-in-progress'
  | 'invalid-position'
  | 'board-full'
  | 'game-over'; // NEW

export const MOVE_VALIDATION = {
  REASONS: {
    CELL_OCCUPIED: 'cell-occupied',
    MOVE_IN_PROGRESS: 'move-in-progress',
    INVALID_POSITION: 'invalid-position',
    BOARD_FULL: 'board-full',
    GAME_OVER: 'game-over', // NEW
  },
} as const;
```

**Import CellPosition**:
```typescript
import { CellPosition } from '../models/board';
```

---

### Step 1.2: Extend GameState Interface

**File**: `src/models/game-state.ts`

**Modify**:
```typescript
import { Board } from './board';
import { PlayerSymbol, MoveFailureReason, GameStatus } from '../constants/game-config'; // Add GameStatus

export interface GameState {
  board: Board;
  currentTurn: PlayerSymbol;
  moveInProgress: boolean;
  status: GameStatus;           // NEW
  winningLine?: CellPosition[]; // NEW
}

// Existing MoveResult type...
```

**Import CellPosition**:
```typescript
import { CellPosition } from './board';
```

---

## Phase 2: Win Detector Module (TDD)

### Step 2.1: RED - Write Failing Tests

**File**: `tests/unit/win-detector.test.ts` (NEW)

**Create test file with all test cases**:

```typescript
import { describe, it, expect } from 'vitest';
import { checkWin, checkDraw, getRelevantPatternIndices } from '../../src/engine/win-detector';
import { createEmptyBoard, setCellValue } from '../../src/models/board';
import { GAME_CONFIG } from '../../src/constants/game-config';

describe('Win Detector', () => {
  describe('checkWin - Row Wins', () => {
    it('should detect X win on top row', () => {
      const board = createEmptyBoard(GAME_CONFIG.GRID_SIZE);
      setCellValue(board, 0, 0, 'X');
      setCellValue(board, 0, 1, 'X');
      setCellValue(board, 0, 2, 'X');

      const result = checkWin(board, { row: 0, col: 2 });

      expect(result).not.toBeNull();
      expect(result?.winner).toBe('X');
      expect(result?.winningLine).toHaveLength(3);
    });

    it('should detect O win on middle row', () => {
      const board = createEmptyBoard(GAME_CONFIG.GRID_SIZE);
      setCellValue(board, 1, 0, 'O');
      setCellValue(board, 1, 1, 'O');
      setCellValue(board, 1, 2, 'O');

      const result = checkWin(board, { row: 1, col: 1 });

      expect(result).not.toBeNull();
      expect(result?.winner).toBe('O');
    });

    // Add test for bottom row...
  });

  describe('checkWin - Column Wins', () => {
    it('should detect X win on left column', () => {
      const board = createEmptyBoard(GAME_CONFIG.GRID_SIZE);
      setCellValue(board, 0, 0, 'X');
      setCellValue(board, 1, 0, 'X');
      setCellValue(board, 2, 0, 'X');

      const result = checkWin(board, { row: 2, col: 0 });

      expect(result).not.toBeNull();
      expect(result?.winner).toBe('X');
    });

    // Add tests for middle column, right column, O wins...
  });

  describe('checkWin - Diagonal Wins', () => {
    it('should detect X win on main diagonal', () => {
      const board = createEmptyBoard(GAME_CONFIG.GRID_SIZE);
      setCellValue(board, 0, 0, 'X');
      setCellValue(board, 1, 1, 'X');
      setCellValue(board, 2, 2, 'X');

      const result = checkWin(board, { row: 1, col: 1 });

      expect(result).not.toBeNull();
      expect(result?.winner).toBe('X');
      expect(result?.winningLine).toEqual([
        { row: 0, col: 0 },
        { row: 1, col: 1 },
        { row: 2, col: 2 },
      ]);
    });

    // Add test for anti-diagonal, O wins...
  });

  describe('checkWin - No Win Cases', () => {
    it('should return null when no win exists', () => {
      const board = createEmptyBoard(GAME_CONFIG.GRID_SIZE);
      setCellValue(board, 0, 0, 'X');
      setCellValue(board, 0, 1, 'O');

      const result = checkWin(board, { row: 0, col: 1 });

      expect(result).toBeNull();
    });

    it('should return null for empty board', () => {
      const board = createEmptyBoard(GAME_CONFIG.GRID_SIZE);

      const result = checkWin(board, { row: 0, col: 0 });

      expect(result).toBeNull();
    });
  });

  describe('checkDraw', () => {
    it('should return true when board is full', () => {
      const board = createEmptyBoard(GAME_CONFIG.GRID_SIZE);
      // Fill board with no winner (draw pattern)
      setCellValue(board, 0, 0, 'X');
      setCellValue(board, 0, 1, 'O');
      setCellValue(board, 0, 2, 'X');
      setCellValue(board, 1, 0, 'O');
      setCellValue(board, 1, 1, 'X');
      setCellValue(board, 1, 2, 'O');
      setCellValue(board, 2, 0, 'O');
      setCellValue(board, 2, 1, 'X');
      setCellValue(board, 2, 2, 'X');

      const result = checkDraw(board);

      expect(result).toBe(true);
    });

    it('should return false when board has empty cells', () => {
      const board = createEmptyBoard(GAME_CONFIG.GRID_SIZE);
      setCellValue(board, 0, 0, 'X');

      const result = checkDraw(board);

      expect(result).toBe(false);
    });
  });

  describe('getRelevantPatternIndices', () => {
    it('should return 3 indices for corner cell (row + col + diagonal)', () => {
      const indices = getRelevantPatternIndices({ row: 0, col: 0 });

      expect(indices).toHaveLength(3);
      expect(indices).toContain(0); // row 0
      expect(indices).toContain(3); // column 0
      expect(indices).toContain(6); // main diagonal
    });

    it('should return 4 indices for center cell (row + col + both diagonals)', () => {
      const indices = getRelevantPatternIndices({ row: 1, col: 1 });

      expect(indices).toHaveLength(4);
      expect(indices).toContain(1); // row 1
      expect(indices).toContain(4); // column 1
      expect(indices).toContain(6); // main diagonal
      expect(indices).toContain(7); // anti-diagonal
    });

    it('should return 2 indices for edge cell (row + col only)', () => {
      const indices = getRelevantPatternIndices({ row: 0, col: 1 });

      expect(indices).toHaveLength(2);
      expect(indices).toContain(0); // row 0
      expect(indices).toContain(4); // column 1
    });
  });
});
```

**Run tests**: `npm test win-detector` → All should FAIL (module doesn't exist yet)

---

### Step 2.2: GREEN - Implement Minimum Code

**File**: `src/engine/win-detector.ts` (NEW)

```typescript
import { Board, CellPosition, getCell } from '../models/board';
import { PlayerSymbol, WIN_PATTERNS, GAME_CONFIG } from '../constants/game-config';

export interface WinResult {
  winner: PlayerSymbol;
  winningLine: CellPosition[];
}

export function checkWin(
  board: Board,
  lastMove: CellPosition
): WinResult | null {
  const player = getCell(board, lastMove.row, lastMove.col).piece;
  if (!player) return null;

  const relevantIndices = getRelevantPatternIndices(lastMove);

  for (const patternIndex of relevantIndices) {
    const pattern = WIN_PATTERNS[patternIndex];
    if (isWinningLine(board, pattern, player)) {
      return {
        winner: player,
        winningLine: [...pattern],
      };
    }
  }

  return null;
}

export function checkDraw(board: Board): boolean {
  const gridSize = board.length;
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (getCell(board, row, col).piece === null) {
        return false;
      }
    }
  }
  return true;
}

export function getRelevantPatternIndices(lastMove: CellPosition): number[] {
  const indices: number[] = [];

  // Row pattern
  indices.push(lastMove.row);

  // Column pattern
  indices.push(3 + lastMove.col);

  // Main diagonal (row === col)
  if (lastMove.row === lastMove.col) {
    indices.push(6);
  }

  // Anti-diagonal (row + col === 2)
  if (lastMove.row + lastMove.col === 2) {
    indices.push(7);
  }

  return indices;
}

function isWinningLine(
  board: Board,
  pattern: readonly CellPosition[],
  player: PlayerSymbol
): boolean {
  return pattern.every(pos => {
    const cell = getCell(board, pos.row, pos.col);
    return cell.piece === player;
  });
}
```

**Run tests**: `npm test win-detector` → All should PASS ✅

---

### Step 2.3: REFACTOR - Improve Code Quality

- Add JSDoc comments
- Extract constants if needed
- Verify type safety
- Run tests again to ensure refactoring didn't break anything

---

## Phase 3: State Transitions Extension (TDD)

### Step 3.1: RED - Write Failing Tests

**File**: `tests/unit/state-transitions.test.ts` (MODIFY existing file)

**Add new test suites**:

```typescript
import { describe, it, expect } from 'vitest';
import { processMove } from '../../src/engine/state-transitions';
import { createInitialGameState } from '../../src/engine/game-engine';
import { setCellValue } from '../../src/models/board';

describe('State Transitions - Win Detection', () => {
  it('should update status to X_WON when X completes a row', () => {
    let state = createInitialGameState();
    
    // Set up board: X-X-_ / O-O-_ / _-_-_
    setCellValue(state.board, 0, 0, 'X');
    setCellValue(state.board, 0, 1, 'X');
    setCellValue(state.board, 1, 0, 'O');
    setCellValue(state.board, 1, 1, 'O');
    state.currentTurn = 'X';

    // X completes top row
    state = processMove(state, { row: 0, col: 2 });

    expect(state.status).toBe('X_WON');
    expect(state.winningLine).toHaveLength(3);
    expect(state.currentTurn).toBe('X'); // Turn NOT switched when game over
  });

  it('should update status to O_WON when O wins', () => {
    let state = createInitialGameState();
    
    // Set up board for O win
    setCellValue(state.board, 0, 0, 'O');
    setCellValue(state.board, 1, 0, 'O');
    setCellValue(state.board, 0, 1, 'X');
    setCellValue(state.board, 1, 1, 'X');
    state.currentTurn = 'O';

    // O completes left column
    state = processMove(state, { row: 2, col: 0 });

    expect(state.status).toBe('O_WON');
    expect(state.winningLine).toBeDefined();
  });

  it('should not switch turn when game ends in win', () => {
    let state = createInitialGameState();
    
    // Set up winning move for X
    setCellValue(state.board, 0, 0, 'X');
    setCellValue(state.board, 0, 1, 'X');
    state.currentTurn = 'X';

    const turnBeforeWin = state.currentTurn;
    state = processMove(state, { row: 0, col: 2 });

    expect(state.currentTurn).toBe(turnBeforeWin);
  });
});

describe('State Transitions - Draw Detection', () => {
  it('should update status to DRAW when board is full with no winner', () => {
    let state = createInitialGameState();
    
    // Fill board with draw pattern (all but one cell)
    setCellValue(state.board, 0, 0, 'X');
    setCellValue(state.board, 0, 1, 'O');
    setCellValue(state.board, 0, 2, 'X');
    setCellValue(state.board, 1, 0, 'O');
    setCellValue(state.board, 1, 1, 'X');
    setCellValue(state.board, 1, 2, 'O');
    setCellValue(state.board, 2, 0, 'O');
    setCellValue(state.board, 2, 1, 'X');
    state.currentTurn = 'X';

    // Fill last cell (no win)
    state = processMove(state, { row: 2, col: 2 });

    expect(state.status).toBe('DRAW');
    expect(state.winningLine).toBeUndefined();
  });

  it('should not switch turn when game ends in draw', () => {
    // Similar setup as above
    // ... assert turn doesn't switch
  });
});

describe('State Transitions - Game Continuation', () => {
  it('should keep status ACTIVE when no win or draw', () => {
    let state = createInitialGameState();
    
    state = processMove(state, { row: 0, col: 0 });

    expect(state.status).toBe('ACTIVE');
    expect(state.winningLine).toBeUndefined();
  });

  it('should switch turn when game continues', () => {
    let state = createInitialGameState();
    expect(state.currentTurn).toBe('X');

    state = processMove(state, { row: 0, col: 0 });

    expect(state.currentTurn).toBe('O');
    expect(state.status).toBe('ACTIVE');
  });
});
```

**Run tests**: `npm test state-transitions` → New tests should FAIL

---

### Step 3.2: GREEN - Implement Status Updates

**File**: `src/engine/state-transitions.ts` (MODIFY)

```typescript
import { GameState } from '../models/game-state';
import { CellPosition, setCellValue } from '../models/board';
import { validateMove } from './move-validator';
import { checkWin, checkDraw } from './win-detector';
import { GAME_CONFIG } from '../constants/game-config';

export function processMove(
  state: GameState,
  position: CellPosition
): GameState {
  // Validate move
  const validation = validateMove(state, position);
  if (!validation.success) {
    return state; // Invalid move, return unchanged state
  }

  // Place mark on board
  const newBoard = state.board.map(row => [...row]);
  setCellValue(newBoard, position.row, position.col, state.currentTurn);

  // NEW: Check for win
  const winResult = checkWin(newBoard, position);
  if (winResult) {
    return {
      ...state,
      board: newBoard,
      status: winResult.winner === 'X' ? 'X_WON' : 'O_WON',
      winningLine: winResult.winningLine,
      moveInProgress: false,
      // Do NOT switch turn when game over
    };
  }

  // NEW: Check for draw
  if (checkDraw(newBoard)) {
    return {
      ...state,
      board: newBoard,
      status: 'DRAW',
      moveInProgress: false,
      // Do NOT switch turn when game over
    };
  }

  // Game continues: switch turn
  return {
    ...state,
    board: newBoard,
    currentTurn: state.currentTurn === 'X' ? 'O' : 'X',
    moveInProgress: false,
    status: 'ACTIVE',
  };
}

// Existing switchTurn function unchanged...
```

**Run tests**: `npm test state-transitions` → All should PASS ✅

---

## Phase 4: Move Validator Extension (TDD)

### Step 4.1: RED - Write Failing Tests

**File**: `tests/unit/move-validator.test.ts` (MODIFY)

**Add new test suite**:

```typescript
describe('Move Validator - Game Over Check', () => {
  it('should reject move when status is X_WON', () => {
    const state: GameState = {
      ...createInitialGameState(),
      status: 'X_WON',
      winningLine: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ],
    };

    const result = validateMove(state, { row: 1, col: 0 });

    expect(result.success).toBe(false);
    expect(result.reason).toBe('game-over');
  });

  it('should reject move when status is O_WON', () => {
    const state: GameState = {
      ...createInitialGameState(),
      status: 'O_WON',
    };

    const result = validateMove(state, { row: 1, col: 1 });

    expect(result.success).toBe(false);
    expect(result.reason).toBe('game-over');
  });

  it('should reject move when status is DRAW', () => {
    const state: GameState = {
      ...createInitialGameState(),
      status: 'DRAW',
    };

    const result = validateMove(state, { row: 2, col: 2 });

    expect(result.success).toBe(false);
    expect(result.reason).toBe('game-over');
  });
});
```

**Run tests**: `npm test move-validator` → New tests should FAIL

---

### Step 4.2: GREEN - Implement Status Validation

**File**: `src/engine/move-validator.ts` (MODIFY)

```typescript
import { GameState, MoveResult } from '../models/game-state';
import { CellPosition, isValidPosition, getCell } from '../models/board';
import { GAME_CONFIG } from '../constants/game-config';

export function validateMove(
  state: GameState,
  position: CellPosition
): MoveResult {
  // NEW: Check game status first
  if (state.status !== 'ACTIVE') {
    return {
      success: false,
      reason: 'game-over',
    };
  }

  // Existing validations...
  if (state.moveInProgress) {
    return {
      success: false,
      reason: 'move-in-progress',
    };
  }

  if (!isValidPosition(position, GAME_CONFIG.GRID_SIZE)) {
    return {
      success: false,
      reason: 'invalid-position',
    };
  }

  const cell = getCell(state.board, position.row, position.col);
  if (cell.piece !== null) {
    return {
      success: false,
      reason: 'cell-occupied',
    };
  }

  return { success: true };
}
```

**Run tests**: `npm test move-validator` → All should PASS ✅

---

## Phase 5: Result Display Module (TDD)

### Step 5.1: RED - Write Failing Tests

**File**: `tests/unit/result-display.test.ts` (NEW)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderResult } from '../../src/ui/result-display';

describe('Result Display', () => {
  let resultElement: HTMLDivElement;
  let ariaElement: HTMLDivElement;

  beforeEach(() => {
    resultElement = document.createElement('div');
    ariaElement = document.createElement('div');
  });

  it('should clear both elements when status is ACTIVE', () => {
    resultElement.textContent = 'Old text';
    ariaElement.textContent = 'Old text';

    renderResult('ACTIVE', resultElement, ariaElement);

    expect(resultElement.textContent).toBe('');
    expect(ariaElement.textContent).toBe('');
  });

  it('should display "Player X wins!" when status is X_WON', () => {
    renderResult('X_WON', resultElement, ariaElement);

    expect(resultElement.textContent).toBe('Player X wins!');
    expect(ariaElement.textContent).toBe('Player X wins!');
  });

  it('should display "Player O wins!" when status is O_WON', () => {
    renderResult('O_WON', resultElement, ariaElement);

    expect(resultElement.textContent).toBe('Player O wins!');
    expect(ariaElement.textContent).toBe('Player O wins!');
  });

  it('should display "It\'s a draw!" when status is DRAW', () => {
    renderResult('DRAW', resultElement, ariaElement);

    expect(resultElement.textContent).toBe("It's a draw!");
    expect(ariaElement.textContent).toBe("It's a draw!");
  });
});
```

**Run tests**: `npm test result-display` → All should FAIL

---

### Step 5.2: GREEN - Implement Result Display

**File**: `src/ui/result-display.ts` (NEW)

```typescript
import { GameStatus, RESULT_MESSAGES } from '../constants/game-config';

export function renderResult(
  status: GameStatus,
  resultElement: HTMLElement,
  ariaElement: HTMLElement
): void {
  const message = RESULT_MESSAGES[status];

  if (status === 'ACTIVE') {
    resultElement.textContent = '';
    ariaElement.textContent = '';
    resultElement.style.display = 'none';
  } else {
    resultElement.textContent = message;
    ariaElement.textContent = message;
    resultElement.style.display = 'block';
  }
}

export function createResultDisplay(): HTMLElement {
  const element = document.createElement('div');
  element.id = 'game-result';
  element.className = 'result-display';
  element.style.display = 'none';
  return element;
}

export function createAriaLiveRegion(): HTMLElement {
  const element = document.createElement('div');
  element.id = 'game-result-announcement';
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', 'polite');
  element.setAttribute('aria-atomic', 'true');
  element.className = 'sr-only';
  return element;
}
```

**Run tests**: `npm test result-display` → All should PASS ✅

---

## Phase 6: Board Renderer Extension

### Step 6.1: Modify Board Renderer

**File**: `src/renderer/board-renderer.ts` (MODIFY)

**Update renderBoard signature**:

```typescript
import { Board, CellPosition, getCell } from '../models/board';
import { CELL_SIZE, GRID_SIZE, COLORS } from '../constants/render-config';

export function renderBoard(
  ctx: CanvasRenderingContext2D,
  board: Board,
  winningLine?: CellPosition[]
): void {
  // Create Set for O(1) lookup
  const winningPositions = new Set(
    winningLine?.map(pos => `${pos.row},${pos.col}`) ?? []
  );

  // Clear canvas (existing)
  ctx.clearRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

  // Draw grid lines (existing)
  drawGrid(ctx);

  // Draw marks with winning highlight
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = getCell(board, row, col);
      if (cell.piece) {
        const isWinning = winningPositions.has(`${row},${col}`);
        renderMark(ctx, row, col, cell.piece, isWinning);
      }
    }
  }
}

function renderMark(
  ctx: CanvasRenderingContext2D,
  row: number,
  col: number,
  piece: 'X' | 'O',
  isWinning: boolean = false
): void {
  const x = col * CELL_SIZE + CELL_SIZE / 2;
  const y = row * CELL_SIZE + CELL_SIZE / 2;

  // Apply winning styles
  if (isWinning) {
    ctx.lineWidth = 6;
    ctx.shadowBlur = 15;
    ctx.shadowColor = piece === 'X' ? '#ff6b6b' : '#4dabf7';
  } else {
    ctx.lineWidth = 3;
    ctx.shadowBlur = 0;
  }

  // Existing mark rendering logic
  if (piece === 'X') {
    drawX(ctx, x, y);
  } else {
    drawO(ctx, x, y);
  }

  // Reset shadow
  ctx.shadowBlur = 0;
}

// Existing helper functions (drawGrid, drawX, drawO)...
```

---

## Phase 7: Main Integration

### Step 7.1: Update main.ts

**File**: `src/main.ts` (MODIFY)

```typescript
import { createInitialGameState } from './engine/game-engine';
import { processMove } from './engine/state-transitions';
import { renderBoard } from './renderer/board-renderer';
import { renderResult } from './ui/result-display';
import { renderTurnIndicator } from './ui/turn-indicator';
import { setupClickHandler } from './input/click-handler';
import { GameState } from './models/game-state';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const resultElement = document.getElementById('game-result')!;
const ariaElement = document.getElementById('game-result-announcement')!;

let gameState: GameState = createInitialGameState();

function render(): void {
  // Render board with winning line (if present)
  renderBoard(ctx, gameState.board, gameState.winningLine);

  // Update turn indicator (hide if game over)
  if (gameState.status === 'ACTIVE') {
    renderTurnIndicator(gameState.currentTurn);
  } else {
    // Hide turn indicator when game over
    const turnElement = document.getElementById('turn-indicator');
    if (turnElement) {
      turnElement.style.display = 'none';
    }
  }

  // Update result display and ARIA
  renderResult(gameState.status, resultElement, ariaElement);
}

function handleMove(row: number, col: number): void {
  gameState = processMove(gameState, { row, col });
  render();
}

// Setup click handler
setupClickHandler(canvas, handleMove);

// Initial render
render();
```

---

### Step 7.2: Update HTML

**File**: `index.html` (MODIFY)

**Add result display elements**:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tic-Tac-Toe</title>
</head>
<body>
  <div id="game-container">
    <h1>Tic-Tac-Toe</h1>
    
    <!-- NEW: Result display -->
    <div id="game-result" class="result-display" style="display: none;"></div>
    
    <!-- Existing canvas -->
    <canvas id="gameCanvas" width="600" height="600"></canvas>
    
    <!-- Existing turn indicator -->
    <div id="turn-indicator"></div>

    <!-- NEW: ARIA live region -->
    <div 
      id="game-result-announcement" 
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only">
    </div>
  </div>

  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

---

### Step 7.3: Update CSS

**File**: `src/style.css` (MODIFY)

**Add new styles**:

```css
/* Existing styles... */

/* NEW: Result display */
.result-display {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin: 20px 0;
  padding: 15px;
  background-color: #f0f0f0;
  border-radius: 8px;
  color: #333;
}

/* NEW: Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## Phase 8: Manual Testing

### Test Scenarios

1. **Win Detection**:
   - ✅ Play game and complete a row (X wins)
   - ✅ Complete a column (O wins)
   - ✅ Complete a diagonal (X wins)
   - ✅ Verify winning line is highlighted
   - ✅ Verify result message appears
   - ✅ Verify no more moves allowed

2. **Draw Detection**:
   - ✅ Fill board with no winner
   - ✅ Verify "It's a draw!" message
   - ✅ Verify no winning line highlight
   - ✅ Verify no more moves allowed

3. **Accessibility**:
   - ✅ Use screen reader (VoiceOver on Mac, NVDA on Windows)
   - ✅ Verify result is announced automatically
   - ✅ Verify ARIA live region updates

4. **Edge Cases**:
   - ✅ Win on last empty cell (should be win, not draw)
   - ✅ Attempt move after game over (should be rejected)
   - ✅ All 8 win patterns work correctly

---

## Running All Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test win-detector

# Run with coverage
npm test -- --coverage
```

**Coverage Goals**:
- ✅ win-detector.ts: 100% coverage
- ✅ state-transitions.ts: 100% coverage (for game-over logic)
- ✅ move-validator.ts: 100% coverage (for status check)
- ✅ result-display.ts: 100% coverage

---

## Troubleshooting

### Issue: Tests fail with "Cannot find module"

**Solution**: Ensure all imports use correct relative paths and extensions.

### Issue: Canvas tests fail

**Solution**: Verify tests/setup.ts has Canvas mocking configured.

### Issue: ARIA region not announcing

**Solution**: 
- Check aria-live attribute is "polite" or "assertive"
- Verify content is actually changing (screen readers only announce changes)
- Test with real screen reader (browser dev tools don't simulate this)

### Issue: Winning line not highlighting

**Solution**:
- Verify winningLine is in state (console.log gameState)
- Check Set.has() logic with correct string format "row,col"
- Verify shadow/lineWidth styles are applied

---

## Next Steps

After implementation and testing:

1. ✅ Run full test suite: `npm test`
2. ✅ Manual testing with browser
3. ✅ Accessibility testing with screen reader
4. ✅ Code review (check constitution compliance)
5. ⏳ Run `/speckit.tasks` to generate task breakdown for implementation

---

## Constitution Compliance Checklist

- ✅ **FSM Architecture**: Explicit GameStatus enum in state
- ✅ **Isolated Logic**: Win detection in pure functions, no DOM dependencies
- ✅ **Test-First**: All modules have tests written before implementation
- ✅ **Deterministic**: All functions documented with inputs/outputs/edge cases
- ✅ **No Magic Numbers**: All constants centralized (WIN_PATTERNS, RESULT_MESSAGES)

---

## Summary

This quickstart demonstrates TDD workflow for game-over detection:

1. ✅ **Phase 0**: Define types and constants
2. ✅ **Phase 1**: Write failing tests for win detector
3. ✅ **Phase 2**: Implement win detector to pass tests
4. ✅ **Phase 3**: Write failing tests for state transitions
5. ✅ **Phase 4**: Extend state transitions with status logic
6. ✅ **Phase 5**: Write tests and implement result display
7. ✅ **Phase 6**: Extend board renderer with winning line highlight
8. ✅ **Phase 7**: Integrate all modules in main.ts
9. ✅ **Phase 8**: Manual testing and accessibility verification

**Total Implementation Time**: ~4-6 hours (with TDD discipline)  
**Test Coverage Target**: 100% for all game logic modules

Follow this guide step-by-step to ensure constitution compliance and comprehensive test coverage! 🎯

