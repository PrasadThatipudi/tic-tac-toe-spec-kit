# Contract: Status Manager (State Transitions Extension)

**Module**: `src/engine/state-transitions.ts` (MODIFIED)  
**Purpose**: Extend state transition logic to incorporate game status updates (win/draw detection) after moves  
**Dependencies**: win-detector module, GameState, Board types

## Overview

This contract extends the existing state-transitions module to integrate game-over detection. After successfully placing a move, the state transition logic now checks for win conditions, then draw conditions, and updates the GameState status and winningLine fields accordingly. This module coordinates the pure detection logic from win-detector with immutable state updates.

## Modified Functions

### processMove (MODIFIED)

```typescript
function processMove(
  state: GameState,
  position: CellPosition
): GameState
```

**Purpose**: Process a move placement and update game state, including status evaluation.

**Parameters**:
- `state`: Current game state
- `position`: Cell position where mark is to be placed

**Returns**:
- New GameState with updated board, status, and potentially winningLine

**Algorithm** (MODIFIED):
```
1. Validate move (delegates to move-validator)
   - If invalid, return state unchanged
2. Place mark on board (existing logic)
3. NEW: Check for win using checkWin(board, position)
   - If win found:
     * Update status to X_WON or O_WON
     * Store winningLine
     * Return new state (DO NOT switch turn)
4. NEW: Check for draw using checkDraw(board)
   - If board full:
     * Update status to DRAW
     * Return new state (DO NOT switch turn)
5. Switch turn (existing logic, only if game continues)
6. Return new state with status ACTIVE

```

**Key Changes**:
- Added win detection after move placement
- Added draw detection after win check
- Status update logic integrated
- Turn switching only occurs if game continues (status remains ACTIVE)

**Example**:
```typescript
// Before: X places winning move at (0, 2)
const initialState: GameState = {
  board: [
    ['X', 'X', null],
    ['O', 'O', null],
    [null, null, null]
  ],
  currentTurn: 'X',
  moveInProgress: false,
  status: 'ACTIVE',
};

const newState = processMove(initialState, { row: 0, col: 2 });

// After: Game over, X wins
// newState = {
//   board: [
//     ['X', 'X', 'X'],
//     ['O', 'O', null],
//     [null, null, null]
//   ],
//   currentTurn: 'X',  // NOT switched (game over)
//   moveInProgress: false,
//   status: 'X_WON',   // NEW: updated status
//   winningLine: [     // NEW: winning positions
//     { row: 0, col: 0 },
//     { row: 0, col: 1 },
//     { row: 0, col: 2 }
//   ]
// }
```

---

### switchTurn (UNCHANGED)

```typescript
function switchTurn(state: GameState): GameState
```

**Status**: No changes needed. This function already returns a new state with toggled currentTurn.

**Note**: This function is now only called when status is ACTIVE (game continues). State transition logic guards against calling it when game is over.

---

## New Internal Functions

### updateGameStatus

```typescript
function updateGameStatus(
  state: GameState,
  lastMove: CellPosition
): GameState
```

**Purpose**: Evaluate board state after move and update status/winningLine fields.

**Parameters**:
- `state`: Current game state (after move placed, before status check)
- `lastMove`: Position of the just-placed mark

**Returns**:
- New GameState with updated status and potentially winningLine

**Algorithm**:
```
1. Check for win using checkWin(state.board, lastMove)
   - If win detected:
     * Determine status: X_WON or O_WON based on winner
     * Return new state with status and winningLine
2. Check for draw using checkDraw(state.board)
   - If board is full:
     * Return new state with status = DRAW
3. No game-over condition:
   - Return state unchanged (status remains ACTIVE)
```

**Guarantees**:
- Pure function (no side effects)
- Win detection takes priority over draw detection
- Returns immediately on first game-over condition found

**Example**:
```typescript
// After placing move at (1, 1), check status
const updatedState = updateGameStatus(stateWithNewMove, { row: 1, col: 1 });

// If center completes a diagonal:
// updatedState.status = 'O_WON'
// updatedState.winningLine = [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 }]

// If no win and board not full:
// updatedState.status = 'ACTIVE' (unchanged)
```

---

## State Transition Flow (Complete)

### Move Processing Flow (UPDATED)

```
┌──────────────────────────────────────────────────────┐
│ processMove(state, position)                         │
└────────────────┬─────────────────────────────────────┘
                 │
                 ��
┌──────────────────────────────────────────────────────┐
│ validateMove(state, position)                        │
│ - Check status === ACTIVE (NEW)                      │
│ - Check moveInProgress                               │
│ - Check cell is empty                                │
└────────┬───────────────┬─────────────────────────────┘
         │               │
    Invalid│          Valid
         │               │
         ▼               ▼
    Return         ┌──────────────────────┐
    state          │ Place mark on board  │
    unchanged      └──────────┬───────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │ updateGameStatus()   │
                   │ - checkWin()         │
                   │ - checkDraw()        │
                   └──────────┬───────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                Win/Draw            No game-over
                    │                   │
                    ▼                   ▼
         ┌──────────────────┐  ┌──────────────────┐
         │ Update status    │  │ switchTurn()     │
         │ Store winningLine│  │ Keep status:     │
         │ (if win)         │  │ ACTIVE           │
         └──────────────────┘  └──────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │ Return new GameState │
                   └──────────────────────┘
```

---

## Integration with Validation

### validateMove (MODIFIED in move-validator.ts)

The move validator is extended with a new check:

```typescript
function validateMove(state: GameState, position: CellPosition): MoveResult {
  // NEW: Check game status (must be ACTIVE to accept moves)
  if (state.status !== 'ACTIVE') {
    return { 
      success: false, 
      reason: 'game-over' 
    };
  }

  // Existing validations...
  if (state.moveInProgress) {
    return { success: false, reason: 'move-in-progress' };
  }

  if (!isEmptyCell(state.board, position)) {
    return { success: false, reason: 'cell-occupied' };
  }

  return { success: true };
}
```

**Impact**: All moves are rejected when status is not ACTIVE, preventing moves after game-over.

---

## Testing Requirements

### Win Detection Integration Tests (8 tests)

- ✅ processMove with winning move updates status to X_WON
- ✅ processMove with winning move updates status to O_WON
- ✅ processMove with winning move stores correct winningLine
- ✅ processMove with winning move does NOT switch turn
- ✅ processMove with winning move on last empty cell results in win (not draw)
- ✅ State after win has all expected fields (board, status, winningLine, unchanged turn)
- ✅ Multiple moves leading to win produce correct final state
- ✅ Win detection works for all 8 win patterns (integration test)

### Draw Detection Integration Tests (4 tests)

- ✅ processMove filling last cell (no win) updates status to DRAW
- ✅ processMove with draw does NOT switch turn
- ✅ processMove with draw has no winningLine
- ✅ State after draw has all expected fields (full board, status DRAW)

### Status Persistence Tests (4 tests)

- ✅ Status remains X_WON after subsequent (invalid) move attempts
- ✅ Status remains O_WON after subsequent (invalid) move attempts
- ✅ Status remains DRAW after subsequent (invalid) move attempts
- ✅ Winning line persists in state after game over

### Game Continuation Tests (3 tests)

- ✅ processMove with non-winning move keeps status ACTIVE
- ✅ processMove with non-winning move switches turn
- ✅ processMove on partially filled board with no win keeps status ACTIVE

### Validation Integration Tests (3 tests)

- ✅ Move attempt when status is X_WON returns failure with 'game-over' reason
- ✅ Move attempt when status is O_WON returns failure with 'game-over' reason
- ✅ Move attempt when status is DRAW returns failure with 'game-over' reason

**Total**: 22+ test cases

---

## State Invariants

### Pre-conditions for processMove

1. `state.status` must be valid GameStatus value
2. `position` must be valid CellPosition (0-2 for row/col)
3. If `state.status !== 'ACTIVE'`, function should exit early (validation)

### Post-conditions for processMove

1. If status changed to X_WON or O_WON, winningLine is present
2. If status changed to DRAW, winningLine is undefined
3. If status remains ACTIVE, turn is switched
4. If status changed to terminal state, turn is NOT switched
5. Board always reflects the placed move (if valid)

### Terminal State Invariants

Once status is set to X_WON, O_WON, or DRAW:
1. Status NEVER changes back to ACTIVE (no transitions out)
2. Subsequent processMove calls return state unchanged (via validation)
3. winningLine (if present) never changes

---

## Performance Characteristics

| Operation | Time Complexity | Notes |
|-----------|----------------|-------|
| processMove | O(k) where k=3-5 | Dominated by win detection |
| updateGameStatus | O(k) where k=3-5 | Calls checkWin + checkDraw |
| validateMove | O(1) | Added status check is O(1) |

**Overall**: Status management adds <1ms overhead per move, well within <100ms goal.

---

## Dependencies

### From `engine/win-detector.ts`
- `checkWin(board, lastMove)`: Win detection
- `checkDraw(board)`: Draw detection

### From `models/game-state.ts`
- `GameState`: Extended with status and winningLine
- `GameStatus`: Type definition

### From `engine/move-validator.ts`
- `validateMove(state, position)`: Move validation (extended)

---

## Usage Example

```typescript
import { processMove } from './state-transitions';
import { createInitialGameState } from './game-engine';

// Start new game
let gameState = createInitialGameState();

// Player X moves
gameState = processMove(gameState, { row: 0, col: 0 });
// status: ACTIVE, turn: O

// Player O moves
gameState = processMove(gameState, { row: 1, col: 0 });
// status: ACTIVE, turn: X

// ... more moves ...

// Player X completes winning row
gameState = processMove(gameState, { row: 0, col: 2 });
// status: X_WON, turn: X (unchanged), winningLine: [...]

// Attempt another move (should be rejected by validation)
const result = validateMove(gameState, { row: 2, col: 2 });
// result: { success: false, reason: 'game-over' }
```

---

## Design Principles

✅ **Immutability**: All state updates return new objects  
✅ **Pure functions**: No side effects in status evaluation  
✅ **Single responsibility**: Status management separate from rendering/input  
✅ **Fail-fast**: Return immediately on game-over conditions  
✅ **Type-safe**: Full TypeScript coverage with GameStatus enum  
✅ **Testable**: All logic testable without DOM/browser dependencies

---

## Non-Goals

This module does NOT:
- ❌ Render game results (ui/result-display handles that)
- ❌ Announce to screen readers (main.ts handles ARIA updates)
- ❌ Handle user input (input/click-handler handles that)
- ❌ Define win patterns (constants/game-config defines that)

**Single Responsibility**: Coordinate state transitions with game-over detection.

