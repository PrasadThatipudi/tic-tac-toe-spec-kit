# Data Model: Game Over Detection

**Feature**: 003-game-over-detection  
**Date**: 2026-02-20  
**Purpose**: Define data structures, types, and state transitions for game-over detection

## Overview

This document defines the data model extensions needed for game-over detection, including the GameStatus enum, updated GameState interface with status and winning line tracking, win pattern definitions, and state transition logic for detecting and representing wins and draws.

## Core Types

### GameStatus Enum

Represents the current status of the game. Explicit enumeration per FSM principle (Constitution Principle I).

```typescript
type GameStatus = 'ACTIVE' | 'X_WON' | 'O_WON' | 'DRAW';
```

**Values**:
- `'ACTIVE'`: Game is in progress, moves can be made
- `'X_WON'`: Player X has achieved three in a row
- `'O_WON'`: Player O has achieved three in a row
- `'DRAW'`: Board is full with no winner

**Rationale**:
- Explicit state enumeration (FSM compliance)
- Type-safe status checks (TypeScript discriminated union)
- Clear semantics (no ambiguous boolean flags)

---

### Extended GameState Interface

```typescript
import { Board } from './board';
import { PlayerSymbol, MoveFailureReason } from '../constants/game-config';

export interface GameState {
  board: Board;
  currentTurn: PlayerSymbol;
  moveInProgress: boolean;
  status: GameStatus;           // NEW: explicit game status
  winningLine?: CellPosition[]; // NEW: optional winning combination
}

export type GameStatus = 'ACTIVE' | 'X_WON' | 'O_WON' | 'DRAW';

export type MoveResult =
  | { success: true }
  | { success: false; reason: MoveFailureReason };
```

**New Fields**:
- `status`: Current game status (required, defaults to 'ACTIVE')
- `winningLine`: Array of 3 cell positions forming the winning line (optional, present only when status is X_WON or O_WON)

**Immutability**: All state updates produce new GameState objects (existing pattern maintained)

---

### CellPosition Type (Existing, Reused)

```typescript
export interface CellPosition {
  row: number;    // 0-2
  col: number;    // 0-2
}
```

Used to represent board positions in win patterns and winning line identification.

---

### WinResult Type

Internal type used by win detection logic.

```typescript
export interface WinResult {
  winner: PlayerSymbol;      // 'X' | 'O'
  winningLine: CellPosition[]; // Array of 3 positions
}
```

**Usage**: Returned by `checkWin()` function when a win is detected. Null if no win found.

---

## Constants

### WIN_PATTERNS

Defines all 8 possible three-in-a-row combinations for tic-tac-toe.

```typescript
export const WIN_PATTERNS: readonly CellPosition[][] = [
  // Horizontal rows
  [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: 2 },
  ],
  [
    { row: 1, col: 0 },
    { row: 1, col: 1 },
    { row: 1, col: 2 },
  ],
  [
    { row: 2, col: 0 },
    { row: 2, col: 1 },
    { row: 2, col: 2 },
  ],
  // Vertical columns
  [
    { row: 0, col: 0 },
    { row: 1, col: 0 },
    { row: 2, col: 0 },
  ],
  [
    { row: 0, col: 1 },
    { row: 1, col: 1 },
    { row: 2, col: 1 },
  ],
  [
    { row: 0, col: 2 },
    { row: 1, col: 2 },
    { row: 2, col: 2 },
  ],
  // Diagonals
  [
    { row: 0, col: 0 },
    { row: 1, col: 1 },
    { row: 2, col: 2 },
  ], // Main diagonal (top-left to bottom-right)
  [
    { row: 0, col: 2 },
    { row: 1, col: 1 },
    { row: 2, col: 0 },
  ], // Anti-diagonal (top-right to bottom-left)
] as const;
```

**Indices**:
- 0-2: Rows (top to bottom)
- 3-5: Columns (left to right)
- 6: Main diagonal
- 7: Anti-diagonal

**Type**: Frozen array (`readonly` and `as const`) to prevent accidental mutation.

---

### RESULT_MESSAGES

User-facing messages for each game status.

```typescript
export const RESULT_MESSAGES: Record<GameStatus, string> = {
  ACTIVE: '',
  X_WON: 'Player X wins!',
  O_WON: 'Player O wins!',
  DRAW: "It's a draw!",
} as const;
```

**Usage**: Map status to display text for UI and ARIA announcements.

---

### Updated MoveFailureReason

```typescript
export type MoveFailureReason =
  | 'cell-occupied'
  | 'move-in-progress'
  | 'invalid-position'
  | 'board-full'
  | 'game-over'; // NEW: reject moves when game has ended
```

**New Value**: `'game-over'` - returned when attempting to place a move after the game has ended.

---

## State Transitions

### Initial State (Modified)

```typescript
function createInitialGameState(): GameState {
  return {
    board: createEmptyBoard(GAME_CONFIG.GRID_SIZE),
    currentTurn: GAME_CONFIG.INITIAL_TURN,
    moveInProgress: false,
    status: 'ACTIVE',        // NEW: initial status is ACTIVE
    winningLine: undefined,  // NEW: no winning line initially
  };
}
```

---

### Win Detection Transition

**Trigger**: After a move is placed

**Logic**:
1. Check only relevant win patterns (row, column, and applicable diagonals)
2. For each relevant pattern, verify all 3 cells contain the same non-empty symbol
3. If match found, return WinResult with winner and winning line
4. If no match, return null

**State Updates**:
- `status`: Set to `'X_WON'` or `'O_WON'` based on winner
- `winningLine`: Set to array of 3 CellPosition objects
- `currentTurn`: Remains unchanged (game is over)

**Preconditions**:
- Move has been successfully placed on the board
- Status is currently 'ACTIVE'

**Postconditions**:
- If win detected: status is X_WON or O_WON, winningLine contains 3 positions
- If no win: status remains ACTIVE (may transition to DRAW next)

---

### Draw Detection Transition

**Trigger**: After a move is placed and no win detected

**Logic**:
1. Count filled cells on board
2. If all 9 cells are filled and no win was detected, game is a draw

**State Updates**:
- `status`: Set to `'DRAW'`
- `winningLine`: Remains undefined (no winning line in a draw)
- `currentTurn`: Remains unchanged (game is over)

**Preconditions**:
- Win check has completed (no win found)
- Board has all 9 cells filled
- Status is currently 'ACTIVE'

**Postconditions**:
- Status is DRAW
- No winningLine present

**Priority**: Win detection takes priority. If the last move creates both a full board AND a winning line, the result is a win, not a draw.

---

### Move Validation (Modified)

**New Validation Rule**: Reject all moves when status is not 'ACTIVE'

**Updated Validation Flow**:
```
1. Check status === 'ACTIVE' → if false, return { success: false, reason: 'game-over' }
2. Check moveInProgress === false → if false, return { success: false, reason: 'move-in-progress' }
3. Check cell is empty → if occupied, return { success: false, reason: 'cell-occupied' }
4. All checks passed → return { success: true }
```

**Enforcement**: Prevents any moves after game completion (win or draw).

---

### Complete Move Processing Flow (Updated)

```
1. Validate move (includes status check)
   ↓
2. If valid: Place mark on board
   ↓
3. Check for win (optimized: 3-5 patterns)
   ↓
4. If win found:
   - Update status to X_WON or O_WON
   - Store winningLine
   - Return new state (game over)
   ↓
5. If no win: Check for draw
   ↓
6. If draw (board full):
   - Update status to DRAW
   - Return new state (game over)
   ↓
7. If no win and no draw:
   - Switch turn
   - Keep status as ACTIVE
   - Return new state (game continues)
```

---

## Validation Functions

### isValidPosition

```typescript
function isValidPosition(position: CellPosition, gridSize: number): boolean {
  return (
    position.row >= 0 &&
    position.row < gridSize &&
    position.col >= 0 &&
    position.col < gridSize
  );
}
```

**Purpose**: Verify cell position is within board bounds (0-2 for 3x3 grid).

---

### isWinningLine

```typescript
function isWinningLine(
  board: Board,
  pattern: CellPosition[],
  player: PlayerSymbol
): boolean {
  return pattern.every(pos => {
    const cell = getCell(board, pos.row, pos.col);
    return cell.piece === player;
  });
}
```

**Purpose**: Check if all 3 cells in a pattern contain the specified player's symbol.

---

### isBoardFull

```typescript
function isBoardFull(board: Board): boolean {
  const gridSize = board.length;
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (getCell(board, row, col).piece === null) {
        return false; // Found empty cell
      }
    }
  }
  return true; // All cells filled
}
```

**Purpose**: Determine if all board cells are occupied (for draw detection).

---

## Optimized Win Checking

### getRelevantPatternIndices

```typescript
function getRelevantPatternIndices(lastMove: CellPosition): number[] {
  const indices: number[] = [];
  
  // Always check row (index 0-2)
  indices.push(lastMove.row);
  
  // Always check column (index 3-5)
  indices.push(3 + lastMove.col);
  
  // Check main diagonal if on diagonal (row === col)
  if (lastMove.row === lastMove.col) {
    indices.push(6);
  }
  
  // Check anti-diagonal if on anti-diagonal (row + col === 2)
  if (lastMove.row + lastMove.col === 2) {
    indices.push(7);
  }
  
  return indices;
}
```

**Purpose**: Return indices of WIN_PATTERNS that contain the last move position.

**Output Examples**:
- Corner move (0,0): [0, 3, 6] - row 0, column 0, main diagonal
- Center move (1,1): [1, 4, 6, 7] - row 1, column 1, both diagonals
- Edge move (0,1): [0, 4] - row 0, column 1 (no diagonals)

**Performance**: 3-5 pattern checks instead of all 8.

---

## State Transition Diagram

```
        ┌─────────┐
        │ ACTIVE  │ ◄── Initial state
        └────┬────┘
             │
             │ Move placed
             ▼
        ┌─────────────┐
        │ Check Win   │
        └────┬────┬───┘
             │    │
      Win?   │    │ No win
             │    │
         ┌───▼─┐  └──────┐
         │X_WON│         │
         │O_WON│    ┌────▼────┐
         └─────┘    │Check    │
                    │Draw     │
                    └────┬────┘
                         │
                  Draw?  │    │ No draw
                         │    │
                    ┌────▼─┐  │
                    │ DRAW │  │
                    └──────┘  │
                              │
                              ▼
                         ┌─────────┐
                         │ ACTIVE  │ (switch turn, continue)
                         └─────────┘
```

**Terminal States**: X_WON, O_WON, DRAW (no transitions out)  
**Active State**: ACTIVE (can transition to any terminal state)

---

## Configuration Updates

### game-config.ts (Modified)

```typescript
export type PlayerSymbol = 'X' | 'O';
export type GameStatus = 'ACTIVE' | 'X_WON' | 'O_WON' | 'DRAW'; // NEW

export const GAME_CONFIG = {
  INITIAL_TURN: 'X' as PlayerSymbol,
  PLAYERS: ['X', 'O'] as const,
  GRID_SIZE: 3,
  INITIAL_STATUS: 'ACTIVE' as GameStatus, // NEW
} as const;

export const MOVE_VALIDATION = {
  REASONS: {
    CELL_OCCUPIED: 'cell-occupied',
    MOVE_IN_PROGRESS: 'move-in-progress',
    INVALID_POSITION: 'invalid-position',
    BOARD_FULL: 'board-full',
    GAME_OVER: 'game-over', // NEW
  },
} as const;

export type MoveFailureReason =
  | 'cell-occupied'
  | 'move-in-progress'
  | 'invalid-position'
  | 'board-full'
  | 'game-over'; // NEW

// NEW: Win patterns constant
export const WIN_PATTERNS: readonly CellPosition[][] = [
  // ... (defined above)
] as const;

// NEW: Result messages
export const RESULT_MESSAGES: Record<GameStatus, string> = {
  ACTIVE: '',
  X_WON: 'Player X wins!',
  O_WON: 'Player O wins!',
  DRAW: "It's a draw!",
} as const;
```

---

## Rendering Data Flow

### Winning Line Highlighting

**Input**: `GameState.winningLine?: CellPosition[]`

**Processing**:
1. Convert winningLine array to Set of "row,col" strings for O(1) lookup
2. During board rendering, check each cell against the Set
3. If cell is in winning line, apply highlight style (thicker lines, glow effect)

**Example**:
```typescript
const winningPositions = new Set(
  state.winningLine?.map(pos => `${pos.row},${pos.col}`) ?? []
);

for (let row = 0; row < GRID_SIZE; row++) {
  for (let col = 0; col < GRID_SIZE; col++) {
    const isWinning = winningPositions.has(`${row},${col}`);
    renderCell(ctx, row, col, getCell(board, row, col), isWinning);
  }
}
```

---

### Result Display

**Input**: `GameState.status: GameStatus`

**Processing**:
1. Map status to result message using RESULT_MESSAGES constant
2. Display message in dedicated UI element (visible when status !== 'ACTIVE')
3. Update ARIA live region with same message

**Example**:
```typescript
function updateResultDisplay(status: GameStatus): void {
  const resultElement = document.getElementById('game-result');
  const ariaAnnouncer = document.getElementById('game-result-announcement');
  
  if (status === 'ACTIVE') {
    resultElement.textContent = '';
    ariaAnnouncer.textContent = '';
  } else {
    const message = RESULT_MESSAGES[status];
    resultElement.textContent = message;
    ariaAnnouncer.textContent = message;
  }
}
```

---

## Type Safety & Validation

### Type Guards

```typescript
function isGameOver(status: GameStatus): boolean {
  return status !== 'ACTIVE';
}

function isWinStatus(status: GameStatus): status is 'X_WON' | 'O_WON' {
  return status === 'X_WON' || status === 'O_WON';
}
```

**Usage**: Narrow types for conditional logic and ensure type safety.

---

## Summary

**New Types**:
- `GameStatus`: 'ACTIVE' | 'X_WON' | 'O_WON' | 'DRAW'
- `WinResult`: { winner, winningLine }

**Modified Types**:
- `GameState`: Added `status` and `winningLine?`
- `MoveFailureReason`: Added `'game-over'`

**New Constants**:
- `WIN_PATTERNS`: 8 three-in-a-row combinations
- `RESULT_MESSAGES`: Status to display text mapping
- `INITIAL_STATUS`: 'ACTIVE'

**Key Functions**:
- `getRelevantPatternIndices()`: Optimize win checking (3-5 vs 8 patterns)
- `isWinningLine()`: Check if pattern matches player
- `isBoardFull()`: Detect draw condition
- `isGameOver()`: Type guard for terminal states

**State Transitions**:
- ACTIVE → X_WON/O_WON (win detected)
- ACTIVE → DRAW (board full, no win)
- ACTIVE → ACTIVE (valid move, game continues)

All data structures maintain immutability, FSM compliance, and test-first principles from the constitution.

