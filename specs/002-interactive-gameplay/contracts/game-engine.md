# Game Engine Contract

**Module**: `src/engine/game-engine.ts`  
**Purpose**: Core game logic coordinator that processes moves and manages state transitions  
**Type**: Pure function module (no side effects, fully testable in isolation)

## Overview

The game engine is the central authority for game logic. It receives game state and player actions, validates moves, updates state, and returns new immutable state. The engine has NO knowledge of rendering, DOM, or Canvas - it operates purely on data structures.

## Public API

### processMove()

**Description**: Attempts to process a player move at the specified position, returning new game state if valid or unchanged state if invalid.

**Signature**:
```typescript
function processMove(
  state: GameState, 
  position: CellPosition
): GameState;
```

**Inputs**:
- `state`: Current game state (board, currentTurn, moveInProgress)
- `position`: Cell position where player wants to place symbol

**Outputs**:
- Returns new GameState with updated board and switched turn (if move valid)
- Returns original state unchanged (if move invalid)

**Behavior**:
1. Validate move using validateMove()
2. If invalid, return original state unchanged
3. If valid:
   - Create new board with symbol placed at position
   - Switch currentTurn to opposite player
   - Set moveInProgress to false
   - Return new GameState

**Preconditions**:
- state must be valid GameState
- position must have row/col in range [0, 2]

**Postconditions**:
- Result state is valid GameState
- If move invalid, result === input (referential equality)
- If move valid, result !== input (new object)
- If move valid, board cell at position contains currentTurn symbol
- If move valid, result.currentTurn is opposite of input.currentTurn

**Edge Cases**:
- Position outside board bounds → return original state
- Cell already occupied → return original state
- moveInProgress is true → return original state
- Last empty cell filled → return new state (board full, no error)

**Example**:
```typescript
const state: GameState = {
  board: emptyBoard,
  currentTurn: 'X',
  moveInProgress: false,
};

const newState = processMove(state, { row: 0, col: 0 });

// Result:
// newState.board has 'X' at (0,0)
// newState.currentTurn === 'O'
// newState.moveInProgress === false
// state unchanged (immutable)
```

**Error Handling**:
- No exceptions thrown
- Invalid moves return original state
- Validation failures logged (future: return MoveResult for UI feedback)

**Performance**:
- O(n) where n = number of cells (9 for tic-tac-toe)
- Target: <1ms per move
- No async operations

---

### switchTurn()

**Description**: Pure function that returns the opposite player symbol.

**Signature**:
```typescript
function switchTurn(current: PlayerSymbol): PlayerSymbol;
```

**Inputs**:
- `current`: Current player symbol ('X' or 'O')

**Outputs**:
- 'O' if input is 'X'
- 'X' if input is 'O'

**Behavior**:
- Simple conditional: `current === 'X' ? 'O' : 'X'`

**Example**:
```typescript
switchTurn('X') // => 'O'
switchTurn('O') // => 'X'
```

---

### createInitialGameState()

**Description**: Factory function that creates initial game state with empty board and X going first.

**Signature**:
```typescript
function createInitialGameState(): GameState;
```

**Inputs**: None

**Outputs**:
- New GameState with:
  - Empty board (all cells null)
  - currentTurn set to 'X'
  - moveInProgress set to false

**Behavior**:
1. Call createEmptyBoard(3)
2. Return GameState with board, currentTurn='X', moveInProgress=false

**Example**:
```typescript
const state = createInitialGameState();
// state.board.cells all have value: null
// state.currentTurn === 'X'
// state.moveInProgress === false
```

---

## Internal Functions (exported for testing)

### validateMove()

**Description**: Validates whether a move can be placed at the specified position.

**Signature**:
```typescript
export function validateMove(
  state: GameState, 
  position: CellPosition
): MoveResult;
```

**Inputs**:
- `state`: Current game state
- `position`: Target cell position

**Outputs**:
- `{ success: true }` if move is valid
- `{ success: false, reason: MoveFailureReason }` if move is invalid

**Validation Rules**:
1. Check moveInProgress flag (must be false)
2. Check position bounds (row/col in [0,2])
3. Check cell is empty (value === null)

**Failure Reasons**:
- `'move-in-progress'`: Another move is currently being processed
- `'invalid-position'`: Position outside board bounds
- `'cell-occupied'`: Cell already contains X or O

**Example**:
```typescript
// Valid move
validateMove(state, { row: 0, col: 0 })
// => { success: true }

// Invalid move (occupied cell)
validateMove(state, { row: 0, col: 0 }) // where cell already has 'X'
// => { success: false, reason: 'cell-occupied' }
```

---

### updateBoardWithMove()

**Description**: Creates new board with symbol placed at position (pure function, no mutation).

**Signature**:
```typescript
function updateBoardWithMove(
  board: Board, 
  position: CellPosition, 
  symbol: PlayerSymbol
): Board;
```

**Inputs**:
- `board`: Current board state
- `position`: Target cell position
- `symbol`: Player symbol to place ('X' or 'O')

**Outputs**:
- New Board with symbol placed at position
- All other cells unchanged

**Behavior**:
1. Create deep copy of board.cells array
2. Find cell at position
3. Update cell.value to symbol
4. Return new Board object

**Immutability Guarantee**:
- Original board unchanged
- Returns new Board object
- New cells array (not mutated)

**Example**:
```typescript
const newBoard = updateBoardWithMove(
  currentBoard,
  { row: 1, col: 1 },
  'X'
);

// newBoard has 'X' at (1,1)
// currentBoard unchanged
// newBoard !== currentBoard (different object reference)
```

---

## Dependencies

**Internal Dependencies**:
- `models/board.ts`: Board, Cell, CellPosition, GamePieceValue types
- `models/game-state.ts`: GameState, PlayerSymbol, MoveResult types
- `constants/game-config.ts`: INITIAL_TURN constant

**External Dependencies**: None (pure TypeScript, no libraries)

---

## Testing Strategy

### Unit Tests (TDD - write tests first)

**Test Categories**:

1. **State Initialization**
   - ✅ createInitialGameState returns valid initial state
   - ✅ Initial state has empty board
   - ✅ Initial state has X as currentTurn
   - ✅ Initial state has moveInProgress=false

2. **Move Validation**
   - ✅ validateMove succeeds for empty cell
   - ✅ validateMove fails for occupied cell (reason: cell-occupied)
   - ✅ validateMove fails for invalid position (reason: invalid-position)
   - ✅ validateMove fails when moveInProgress=true (reason: move-in-progress)

3. **Move Processing**
   - ✅ processMove places symbol in empty cell
   - ✅ processMove switches turn after valid move
   - ✅ processMove returns new state object (immutability)
   - ✅ processMove returns original state for invalid move
   - ✅ processMove handles board full scenario

4. **Turn Switching**
   - ✅ switchTurn('X') returns 'O'
   - ✅ switchTurn('O') returns 'X'

5. **Edge Cases**
   - ✅ Move on occupied cell ignored
   - ✅ Move outside bounds ignored
   - ✅ Rapid clicks during processing ignored
   - ✅ Last cell filled successfully

**Mock Requirements**: None (pure functions, no external dependencies)

**Test Execution**: Fast unit tests (<100ms total)

---

## Performance Requirements

- **Move processing**: <1ms per move (target: <0.5ms)
- **State validation**: <0.1ms
- **No memory leaks**: State objects properly garbage collected
- **Immutable updates**: Use structural sharing where possible

---

## Future Extensions

**Phase 3 (Win Detection)**:
- Add `checkWinCondition(board: Board, lastMove: CellPosition): WinResult`
- Add `isGameOver(state: GameState): boolean`
- Extend GameState with `gameStatus: 'playing' | 'won' | 'draw'`

**Phase 4 (Game Reset)**:
- Add `resetGame(): GameState` (returns createInitialGameState())

**Phase 5 (Move History)**:
- Extend GameState with `history: GameState[]`
- Add `undoMove(state: GameState): GameState`

---

## Contract Validation Checklist

- ✅ All public functions have clear signatures
- ✅ All inputs and outputs documented
- ✅ All preconditions and postconditions specified
- ✅ All edge cases documented
- ✅ Pure functions only (no side effects)
- ✅ Immutability guaranteed
- ✅ Test strategy defined
- ✅ Performance requirements specified
- ✅ No framework or DOM dependencies

