# Data Model: Interactive Gameplay

**Feature**: 002-interactive-gameplay  
**Date**: 2026-02-20  
**Purpose**: Define all data structures, types, and validation rules for interactive game state management

## Overview

This data model extends the existing Board model from feature 001 with game state management types that track current turn, move processing status, and gameplay flow. All types follow immutable patterns to support pure functional state transitions per constitution requirements.

## Core Entities

### 1. GameState

**Description**: Centralized immutable game state object containing all information needed to represent the current state of an interactive tic-tac-toe game.

**Type Definition**:
```typescript
interface GameState {
  board: Board;              // Current board state (from existing Board model)
  currentTurn: PlayerSymbol; // Which player's turn it is
  moveInProgress: boolean;   // Flag to prevent rapid click race conditions
}
```

**Field Descriptions**:
- `board`: The 3x3 game board with current cell values (reuses existing Board type from feature 001)
- `currentTurn`: The active player's symbol ('X' or 'O') - determines which symbol will be placed on next valid move
- `moveInProgress`: Debouncing flag set to true during move processing to ignore subsequent clicks (always false in persisted state, only true transiently during click handling)

**Validation Rules**:
- `board` must pass existing `isValidBoard()` validation from feature 001
- `currentTurn` must be exactly 'X' or 'O' (enforced by type system)
- `moveInProgress` must be boolean (enforced by type system)
- Board cell count must match turn state: if n cells occupied, currentTurn must represent the (n+1)th move

**Invariants**:
- GameState with even number of occupied cells → currentTurn must be 'X'
- GameState with odd number of occupied cells → currentTurn must be 'O'
- (This assumes X always goes first, per spec requirement FR-007)

**Example Instances**:
```typescript
// Initial game state
const initialState: GameState = {
  board: emptyBoard,  // All cells null
  currentTurn: 'X',
  moveInProgress: false,
};

// After first move (X at position 0,0)
const afterFirstMove: GameState = {
  board: boardWithXAt_0_0,
  currentTurn: 'O',
  moveInProgress: false,
};

// Mid-game state
const midGameState: GameState = {
  board: boardWithMultipleMoves,
  currentTurn: 'X',
  moveInProgress: false,
};
```

---

### 2. PlayerSymbol

**Description**: Type alias representing the two player symbols in tic-tac-toe.

**Type Definition**:
```typescript
type PlayerSymbol = 'X' | 'O';
```

**Usage**:
- Represents active player in GameState.currentTurn
- Passed to state transition functions to place moves
- Used in turn indicator UI display

**Validation**:
- Type-level validation only (TypeScript ensures only 'X' or 'O' are valid)
- Runtime validation not needed due to type safety

**Relationship to Existing Types**:
- `PlayerSymbol` is a subset of `GamePieceValue` (which includes `null` for empty cells)
- `GamePieceValue = 'X' | 'O' | null`
- `PlayerSymbol = 'X' | 'O'`

---

### 3. MoveResult

**Description**: Result type returned from move validation functions to communicate success or failure with reason.

**Type Definition**:
```typescript
type MoveResult = 
  | { success: true; }
  | { success: false; reason: MoveFailureReason; };

type MoveFailureReason =
  | 'cell-occupied'
  | 'move-in-progress'
  | 'invalid-position'
  | 'board-full';
```

**Usage**:
- Returned from `validateMove()` function
- Enables detailed error handling and logging
- Supports future UI feedback for invalid moves (e.g., showing error messages)

**Validation Rules**:
- If success is true, reason must not exist
- If success is false, reason must be one of the defined MoveFailureReason values

**Example Usage**:
```typescript
const result = validateMove(state, position);
if (!result.success) {
  console.log(`Move rejected: ${result.reason}`);
  return state; // unchanged
}
// Proceed with state transition
```

---

### 4. CellPosition (Extended Usage)

**Description**: Existing type from feature 001, now also used for click coordinate mapping and move placement.

**Type Definition** (from existing models/board.ts):
```typescript
interface CellPosition {
  row: number; // 0-based row index [0-2]
  col: number; // 0-based column index [0-2]
}
```

**Extended Usage in This Feature**:
- **Input to move validation**: `validateMove(state, position: CellPosition)`
- **Output from click mapping**: `getCellFromCoordinates(x, y) → CellPosition | null`
- **Input to state transitions**: `placeMove(state, position: CellPosition)`

**Validation Rules** (existing + extended):
- `row` must be integer in range [0, 2]
- `col` must be integer in range [0, 2]
- Position must correspond to valid cell in current board state

---

## State Transitions

### Valid State Transition Flow

```
InitialState (X's turn, empty board, not processing)
    ↓
    | User clicks cell (0,0)
    ↓
ProcessingState (X's turn, empty board, processing=true) [transient]
    ↓
    | Validate move (success)
    | Place X at (0,0)
    | Switch turn to O
    ↓
NewState (O's turn, board with X at 0,0, processing=false)
    ↓
    | User clicks cell (1,1)
    ↓
ProcessingState (O's turn, board with X, processing=true) [transient]
    ↓
    | Validate move (success)
    | Place O at (1,1)
    | Switch turn to X
    ↓
NewState (X's turn, board with X and O, processing=false)
    ↓
    ... continues until board full or game reset
```

### Invalid Transition Examples

**Attempt to move on occupied cell**:
```
State (X's turn, cell 0,0 occupied by O)
    ↓
    | User clicks cell (0,0)
    ↓
    | Validate move (FAIL: cell-occupied)
    ↓
State (unchanged - still X's turn, cell still occupied, no state change)
```

**Attempt rapid double-click**:
```
State (X's turn, processing=false)
    ↓
    | User clicks cell (0,0) - FIRST CLICK
    ↓
State (processing=true) [transient]
    ↓
    | User clicks cell (1,1) - SECOND CLICK (ignored)
    ↓
    | Validate second move (FAIL: move-in-progress)
    ↓
State (processing=true continues, second click has no effect)
    ↓
    | First click completes processing
    ↓
State (O's turn, processing=false, X placed at 0,0)
```

---

## Validation Functions

### isValidMove()

**Signature**:
```typescript
function isValidMove(state: GameState, position: CellPosition): boolean;
```

**Preconditions**:
- `state` must be valid GameState
- `position` must have valid row/col in range [0, 2]

**Postconditions**:
- Returns true if move can be placed (cell empty, no move in progress)
- Returns false otherwise
- Does NOT mutate state

**Validation Logic**:
```typescript
function isValidMove(state: GameState, position: CellPosition): boolean {
  // Check move processing lock
  if (state.moveInProgress) {
    return false;
  }
  
  // Check position bounds
  if (!isValidPosition(position, state.board.size)) {
    return false;
  }
  
  // Check cell is empty
  const cell = getCell(state.board, position);
  return cell.value === null;
}
```

---

### validateMove() (with detailed result)

**Signature**:
```typescript
function validateMove(state: GameState, position: CellPosition): MoveResult;
```

**Preconditions**: Same as isValidMove()

**Postconditions**:
- Returns detailed success/failure result
- Does NOT mutate state

**Validation Logic**:
```typescript
function validateMove(state: GameState, position: CellPosition): MoveResult {
  if (state.moveInProgress) {
    return { success: false, reason: 'move-in-progress' };
  }
  
  if (!isValidPosition(position, state.board.size)) {
    return { success: false, reason: 'invalid-position' };
  }
  
  const cell = getCell(state.board, position);
  if (cell.value !== null) {
    return { success: false, reason: 'cell-occupied' };
  }
  
  return { success: true };
}
```

---

### isGameBoardFull()

**Signature**:
```typescript
function isGameBoardFull(board: Board): boolean;
```

**Preconditions**:
- `board` must be valid Board

**Postconditions**:
- Returns true if all cells are occupied (no null values)
- Returns false if any cell is empty
- Does NOT mutate board

**Validation Logic**:
```typescript
function isGameBoardFull(board: Board): boolean {
  return board.cells.every(cell => cell.value !== null);
}
```

---

## Constants

All game-related constants defined in new `src/constants/game-config.ts`:

```typescript
export const GAME_CONFIG = {
  INITIAL_TURN: 'X' as PlayerSymbol,  // X always goes first per spec
  PLAYERS: ['X', 'O'] as const,       // All valid player symbols
  GRID_SIZE: 3,                        // Reuse from existing render-config (3x3 grid)
} as const;

export const MOVE_VALIDATION = {
  REASONS: {
    CELL_OCCUPIED: 'cell-occupied',
    MOVE_IN_PROGRESS: 'move-in-progress',
    INVALID_POSITION: 'invalid-position',
    BOARD_FULL: 'board-full',
  },
} as const;
```

**Rationale**:
- Centralized configuration per Constitution Principle V
- No magic strings or numbers in game logic
- Type-safe constants (as const) for compile-time checking
- Separate from render config (game vs. visual concerns)

---

## Factory Functions

### createInitialGameState()

**Signature**:
```typescript
function createInitialGameState(): GameState;
```

**Purpose**: Create a new game state with empty board and X going first

**Implementation**:
```typescript
function createInitialGameState(): GameState {
  return {
    board: createEmptyBoard(GAME_CONFIG.GRID_SIZE),
    currentTurn: GAME_CONFIG.INITIAL_TURN,
    moveInProgress: false,
  };
}
```

**Usage**: Called at game start (in main.ts initialization)

---

### createEmptyBoard() (existing from feature 001)

**Signature**:
```typescript
function createEmptyBoard(size: number): Board;
```

**Purpose**: Create empty board with all cells set to null

**Note**: Already implemented in feature 001, reused here

---

## Relationships to Existing Models

```
Existing (feature 001):
- GamePieceValue = 'X' | 'O' | null
- Cell { value: GamePieceValue, position: CellPosition }
- CellPosition { row, col }
- Board { cells: Cell[], size: number }

New (feature 002):
- PlayerSymbol = 'X' | 'O'  (subset of GamePieceValue, excludes null)
- GameState { board: Board, currentTurn: PlayerSymbol, moveInProgress: boolean }
- MoveResult = success/failure discriminated union

Relationships:
- GameState CONTAINS Board (composition)
- GameState.currentTurn is PlayerSymbol (which is subset of GamePieceValue)
- MoveResult references CellPosition for validation
```

---

## Data Model Validation Checklist

- ✅ All entities have clear type definitions
- ✅ All fields have documented validation rules
- ✅ All state transitions are deterministic and documented
- ✅ All validation functions are pure (no mutations)
- ✅ All constants are centralized in config file
- ✅ All types support immutable state patterns
- ✅ All relationships to existing models are documented
- ✅ Factory functions provided for common initializations
- ✅ No magic numbers or strings in data definitions

## Next Steps

1. ✅ Data model complete
2. ⏳ Generate API contracts (engine, input handler, UI components)
3. ⏳ Generate quickstart guide
4. ⏳ Update agent context files

