# Contract: Win Detector

**Module**: `src/engine/win-detector.ts`  
**Purpose**: Pure functions for detecting win conditions and draw conditions in tic-tac-toe  
**Dependencies**: Board, CellPosition types from models; WIN_PATTERNS, GAME_CONFIG from constants

## Overview

The win detector module provides pure, side-effect-free functions for determining game-over conditions. It implements optimized win checking that examines only relevant patterns (3-5 checks per move instead of all 8), and provides clear, testable logic for both win and draw detection.

## Public Interface

### checkWin

```typescript
function checkWin(
  board: Board,
  lastMove: CellPosition
): WinResult | null
```

**Purpose**: Check if the last move created a winning combination.

**Parameters**:
- `board`: Current board state
- `lastMove`: Position of the most recently placed mark

**Returns**:
- `WinResult` object if win detected: `{ winner: PlayerSymbol, winningLine: CellPosition[] }`
- `null` if no win detected

**Algorithm**:
1. Determine which patterns include the lastMove position (row, column, applicable diagonals)
2. Get the player symbol at lastMove position
3. For each relevant pattern, check if all 3 cells contain the same player symbol
4. Return WinResult on first match, or null if no patterns match

**Performance**: O(k) where k = 3-5 (number of relevant patterns)

**Guarantees**:
- Pure function (no side effects)
- Deterministic (same inputs → same output)
- Returns immediately on first win found (fail-fast)
- Only checks patterns that could possibly have changed

**Example**:
```typescript
// After X places mark at position (0, 0)
const result = checkWin(board, { row: 0, col: 0 });

// If top row is X-X-X:
// result = {
//   winner: 'X',
//   winningLine: [
//     { row: 0, col: 0 },
//     { row: 0, col: 1 },
//     { row: 0, col: 2 }
//   ]
// }

// If no win:
// result = null
```

---

### checkDraw

```typescript
function checkDraw(board: Board): boolean
```

**Purpose**: Determine if the game has ended in a draw (board full, no winner).

**Parameters**:
- `board`: Current board state

**Returns**:
- `true` if all 9 cells are filled
- `false` if any cell is empty

**Algorithm**:
1. Iterate through all cells (row 0-2, col 0-2)
2. If any cell has `piece === null`, return false immediately
3. If all cells are filled, return true

**Performance**: O(n) where n = 9 (board size), worst case

**Guarantees**:
- Pure function (no side effects)
- Deterministic
- Fast fail (returns false on first empty cell)

**Note**: This function ONLY checks if the board is full. It does NOT check for wins. The caller (state transition logic) must check for wins BEFORE checking for draw.

**Example**:
```typescript
// Board with all cells filled:
const isDraw = checkDraw(fullBoard); // true

// Board with empty cells:
const isDraw = checkDraw(partialBoard); // false
```

---

### getRelevantPatternIndices

```typescript
function getRelevantPatternIndices(
  lastMove: CellPosition
): number[]
```

**Purpose**: Determine which win patterns include the specified position (optimization for checkWin).

**Parameters**:
- `lastMove`: Position to check

**Returns**:
- Array of pattern indices (0-7) from WIN_PATTERNS that include this position

**Algorithm**:
1. Always include row pattern: index = `lastMove.row` (0-2)
2. Always include column pattern: index = `3 + lastMove.col` (3-5)
3. If on main diagonal (row === col), include index 6
4. If on anti-diagonal (row + col === 2), include index 7

**Performance**: O(1) - fixed calculation, no iteration

**Guarantees**:
- Pure function
- Returns 3-5 indices depending on position:
  - Corner cells: 3 patterns (row + column + 1 diagonal)
  - Edge cells: 2 patterns (row + column)
  - Center cell: 4 patterns (row + column + 2 diagonals)

**Example**:
```typescript
// Top-left corner (0, 0)
getRelevantPatternIndices({ row: 0, col: 0 });
// Returns: [0, 3, 6] (row 0, column 0, main diagonal)

// Center (1, 1)
getRelevantPatternIndices({ row: 1, col: 1 });
// Returns: [1, 4, 6, 7] (row 1, column 1, both diagonals)

// Top edge (0, 1)
getRelevantPatternIndices({ row: 0, col: 1 });
// Returns: [0, 4] (row 0, column 1, no diagonals)
```

---

### isWinningLine (Helper)

```typescript
function isWinningLine(
  board: Board,
  pattern: CellPosition[],
  player: PlayerSymbol
): boolean
```

**Purpose**: Check if all cells in a pattern contain the specified player's symbol.

**Parameters**:
- `board`: Current board state
- `pattern`: Array of 3 cell positions to check
- `player`: Player symbol to match ('X' or 'O')

**Returns**:
- `true` if all 3 cells in pattern contain the player's symbol
- `false` otherwise

**Algorithm**:
1. For each position in pattern, get cell value
2. Check if cell.piece === player
3. Return true only if ALL cells match

**Performance**: O(3) - always checks exactly 3 cells

**Guarantees**:
- Pure function
- Deterministic
- Uses Array.every() for clarity and short-circuit evaluation

**Example**:
```typescript
const pattern = [
  { row: 0, col: 0 },
  { row: 0, col: 1 },
  { row: 0, col: 2 }
];

// If top row is X-X-X:
isWinningLine(board, pattern, 'X'); // true
isWinningLine(board, pattern, 'O'); // false

// If top row is X-O-X:
isWinningLine(board, pattern, 'X'); // false
```

---

### isBoardFull (Helper)

```typescript
function isBoardFull(board: Board): boolean
```

**Purpose**: Determine if all board cells are occupied.

**Parameters**:
- `board`: Current board state

**Returns**:
- `true` if all cells have non-null piece
- `false` if any cell is empty

**Algorithm**:
1. Iterate through all rows and columns
2. Check each cell's piece property
3. Return false immediately if any piece is null
4. Return true if loop completes

**Performance**: O(n) where n = 9, early exit on first empty cell

**Guarantees**:
- Pure function
- Deterministic
- Fast fail optimization

---

## Internal Types

### WinResult

```typescript
export interface WinResult {
  winner: PlayerSymbol;        // 'X' | 'O'
  winningLine: CellPosition[]; // Array of 3 positions
}
```

**Purpose**: Encapsulate win detection result with winner identification and winning line coordinates.

**Usage**: Returned by `checkWin()`, consumed by state transition logic to update GameState.

---

## Dependencies

### From `models/board.ts`
- `Board`: 2D array of cells
- `Cell`: { piece: GamePiece | null }
- `getCell(board, row, col)`: Accessor function

### From `constants/game-config.ts`
- `PlayerSymbol`: 'X' | 'O'
- `WIN_PATTERNS`: Array of 8 win patterns
- `GAME_CONFIG.GRID_SIZE`: 3

### From `models/board.ts` (types)
- `CellPosition`: { row: number, col: number }

---

## Testing Requirements

### Win Detection Tests (16 tests minimum)

**Row Wins** (6 tests):
- ✅ X wins with top row (0,0 0,1 0,2)
- ✅ X wins with middle row (1,0 1,1 1,2)
- ✅ X wins with bottom row (2,0 2,1 2,2)
- ✅ O wins with top row
- ✅ O wins with middle row
- ✅ O wins with bottom row

**Column Wins** (6 tests):
- ✅ X wins with left column (0,0 1,0 2,0)
- ✅ X wins with middle column (0,1 1,1 2,1)
- ✅ X wins with right column (0,2 1,2 2,2)
- ✅ O wins with left column
- ✅ O wins with middle column
- ✅ O wins with right column

**Diagonal Wins** (4 tests):
- ✅ X wins with main diagonal (0,0 1,1 2,2)
- ✅ X wins with anti-diagonal (0,2 1,1 2,0)
- ✅ O wins with main diagonal
- ✅ O wins with anti-diagonal

**No Win Cases** (4 tests):
- ✅ Board with 2 in a row but 3rd different
- ✅ Empty board
- ✅ Partially filled board, no win
- ✅ Full board (draw scenario)

### Draw Detection Tests (3 tests)

- ✅ Full board with no winner returns true
- ✅ Partially filled board returns false
- ✅ Empty board returns false

### Optimization Tests (4 tests)

- ✅ Corner move returns 3 pattern indices
- ✅ Center move returns 4 pattern indices
- ✅ Edge move returns 2 pattern indices
- ✅ getRelevantPatternIndices returns correct indices for each position

### Edge Cases (3 tests)

- ✅ Last move completes win on last empty cell (win, not draw)
- ✅ Board state with multiple potential wins returns first found
- ✅ Invalid position passed to checkWin (should handle gracefully or document precondition)

**Total**: 30+ test cases

---

## Performance Characteristics

| Operation | Time Complexity | Space Complexity | Notes |
|-----------|----------------|------------------|-------|
| checkWin | O(k) where k=3-5 | O(1) | Only checks relevant patterns |
| checkDraw | O(n) where n=9 | O(1) | Early exit on first empty cell |
| getRelevantPatternIndices | O(1) | O(1) | Fixed calculation |
| isWinningLine | O(3) | O(1) | Always 3 cells |
| isBoardFull | O(n) where n=9 | O(1) | Early exit optimization |

**Overall**: All operations complete in <1ms for 3x3 board, well under <100ms detection goal.

---

## Usage Example

```typescript
import { checkWin, checkDraw } from './win-detector';
import { Board, CellPosition } from '../models/board';

function evaluateGameState(
  board: Board,
  lastMove: CellPosition
): { status: GameStatus; winningLine?: CellPosition[] } {
  // Check win FIRST (priority over draw)
  const winResult = checkWin(board, lastMove);
  if (winResult) {
    const status = winResult.winner === 'X' ? 'X_WON' : 'O_WON';
    return { status, winningLine: winResult.winningLine };
  }

  // Check draw SECOND (only if no win)
  if (checkDraw(board)) {
    return { status: 'DRAW' };
  }

  // Game continues
  return { status: 'ACTIVE' };
}
```

---

## Design Principles

✅ **Pure functions**: No side effects, all functions return new data  
✅ **Deterministic**: Same inputs always produce same outputs  
✅ **Testable**: Zero dependencies on DOM/Canvas/Browser APIs  
✅ **Optimized**: Only checks relevant patterns (3-5 vs. 8)  
✅ **Clear separation**: Detection logic isolated from state management and rendering  
✅ **Type-safe**: Full TypeScript type coverage with strict mode

---

## Non-Goals

This module does NOT:
- ❌ Modify game state (state-transitions.ts handles that)
- ❌ Render visual feedback (renderer handles that)
- ❌ Handle user input (click-handler handles that)
- ❌ Validate moves (move-validator handles that)

**Single Responsibility**: Detect win and draw conditions from board state.

