# Quickstart Guide: Interactive Gameplay

**Feature**: 002-interactive-gameplay  
**Date**: 2026-02-20  
**Audience**: Developers implementing this feature  
**Prerequisites**: Feature 001 (render-dummy-board) completed

## Overview

This guide walks through implementing interactive tic-tac-toe gameplay using Test-Driven Development (TDD). You'll build game state management, click handling, and turn indicators while maintaining strict separation between game logic, input handling, and rendering.

**Time Estimate**: 4-6 hours for full implementation with TDD

---

## Architecture Summary

```
User clicks canvas
    ↓
Click Handler (input/) → translates to cell position
    ↓
Game Engine (engine/) → validates and processes move
    ↓
New GameState returned
    ↓
Main.ts → updates board and turn indicator
    ↓
Board Renderer (renderer/) → redraws board
Turn Indicator (ui/) → updates text
```

**Key Principles**:
- Game engine = pure functions (no DOM, no Canvas)
- Click handler = DOM adapter (translates events to game actions)
- Main.ts = coordinator (wires everything together)
- All logic testable in isolation

---

## Phase 1: Setup & Constants (15 minutes)

### Step 1.1: Create Game Configuration

**File**: `src/constants/game-config.ts`

```typescript
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
```

**Why**: Centralizes all game constants per Constitution Principle V (no magic strings/numbers)

---

## Phase 2: Data Models (30 minutes)

### Step 2.1: Create GameState Model

**File**: `src/models/game-state.ts`

```typescript
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
```

### Step 2.2: Write Tests for GameState (TDD Red)

**File**: `tests/unit/game-state.test.ts`

```typescript
import { describe, test, expect } from 'vitest';
import { GameState } from '../../src/models/game-state';
import { createEmptyBoard } from '../../src/models/board';

describe('GameState', () => {
  test('has required properties', () => {
    const state: GameState = {
      board: createEmptyBoard(3),
      currentTurn: 'X',
      moveInProgress: false,
    };
    
    expect(state.board).toBeDefined();
    expect(state.currentTurn).toBe('X');
    expect(state.moveInProgress).toBe(false);
  });
});
```

**Run tests**: `npm test` (should pass - types validate structure)

---

## Phase 3: Game Engine - Pure Logic (2 hours)

### Step 3.1: Write Move Validation Tests (TDD Red)

**File**: `tests/unit/move-validator.test.ts`

```typescript
import { describe, test, expect } from 'vitest';
import { validateMove } from '../../src/engine/move-validator';
import { GameState } from '../../src/models/game-state';
import { createEmptyBoard } from '../../src/models/board';

describe('validateMove', () => {
  test('succeeds for empty cell', () => {
    const state: GameState = {
      board: createEmptyBoard(3),
      currentTurn: 'X',
      moveInProgress: false,
    };
    
    const result = validateMove(state, { row: 0, col: 0 });
    
    expect(result.success).toBe(true);
  });
  
  test('fails when move in progress', () => {
    const state: GameState = {
      board: createEmptyBoard(3),
      currentTurn: 'X',
      moveInProgress: true, // locked
    };
    
    const result = validateMove(state, { row: 0, col: 0 });
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('move-in-progress');
    }
  });
  
  test('fails for occupied cell', () => {
    // TODO: Create board with occupied cell and test
  });
  
  test('fails for invalid position', () => {
    const state: GameState = {
      board: createEmptyBoard(3),
      currentTurn: 'X',
      moveInProgress: false,
    };
    
    const result = validateMove(state, { row: 5, col: 5 });
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('invalid-position');
    }
  });
});
```

**Run tests**: `npm test` (should FAIL - functions don't exist yet) ✅ RED

### Step 3.2: Implement Move Validation (TDD Green)

**File**: `src/engine/move-validator.ts`

```typescript
import { GameState, MoveResult } from '../models/game-state';
import { CellPosition } from '../models/board';
import { MOVE_VALIDATION } from '../constants/game-config';

export function validateMove(
  state: GameState,
  position: CellPosition
): MoveResult {
  // Check move processing lock
  if (state.moveInProgress) {
    return { success: false, reason: MOVE_VALIDATION.REASONS.MOVE_IN_PROGRESS };
  }
  
  // Check position bounds
  if (
    position.row < 0 || 
    position.row >= state.board.size ||
    position.col < 0 || 
    position.col >= state.board.size
  ) {
    return { success: false, reason: MOVE_VALIDATION.REASONS.INVALID_POSITION };
  }
  
  // Find cell at position
  const cell = state.board.cells.find(
    c => c.position.row === position.row && c.position.col === position.col
  );
  
  // Check cell is empty
  if (cell && cell.value !== null) {
    return { success: false, reason: MOVE_VALIDATION.REASONS.CELL_OCCUPIED };
  }
  
  return { success: true };
}
```

**Run tests**: `npm test` (should PASS) ✅ GREEN

### Step 3.3: Write State Transition Tests (TDD Red)

**File**: `tests/unit/state-transitions.test.ts`

```typescript
import { describe, test, expect } from 'vitest';
import { processMove, switchTurn } from '../../src/engine/state-transitions';
import { createEmptyBoard } from '../../src/models/board';

describe('switchTurn', () => {
  test('switches X to O', () => {
    expect(switchTurn('X')).toBe('O');
  });
  
  test('switches O to X', () => {
    expect(switchTurn('O')).toBe('X');
  });
});

describe('processMove', () => {
  test('places symbol in empty cell', () => {
    const state = {
      board: createEmptyBoard(3),
      currentTurn: 'X' as const,
      moveInProgress: false,
    };
    
    const newState = processMove(state, { row: 0, col: 0 });
    
    const cell = newState.board.cells.find(
      c => c.position.row === 0 && c.position.col === 0
    );
    expect(cell?.value).toBe('X');
  });
  
  test('switches turn after valid move', () => {
    const state = {
      board: createEmptyBoard(3),
      currentTurn: 'X' as const,
      moveInProgress: false,
    };
    
    const newState = processMove(state, { row: 0, col: 0 });
    
    expect(newState.currentTurn).toBe('O');
  });
  
  test('returns new state object (immutability)', () => {
    const state = {
      board: createEmptyBoard(3),
      currentTurn: 'X' as const,
      moveInProgress: false,
    };
    
    const newState = processMove(state, { row: 0, col: 0 });
    
    expect(newState).not.toBe(state);
    expect(state.currentTurn).toBe('X'); // original unchanged
  });
  
  test('returns original state for invalid move', () => {
    const state = {
      board: createEmptyBoard(3),
      currentTurn: 'X' as const,
      moveInProgress: true, // locked
    };
    
    const newState = processMove(state, { row: 0, col: 0 });
    
    expect(newState).toBe(state); // same reference
  });
});
```

**Run tests**: `npm test` (should FAIL) ✅ RED

### Step 3.4: Implement State Transitions (TDD Green)

**File**: `src/engine/state-transitions.ts`

```typescript
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
```

**Run tests**: `npm test` (should PASS) ✅ GREEN

### Step 3.5: Create Game Engine Facade

**File**: `src/engine/game-engine.ts`

```typescript
import { GameState } from '../models/game-state';
import { CellPosition } from '../models/board';
import { createEmptyBoard } from '../models/board';
import { GAME_CONFIG } from '../constants/game-config';
import { processMove } from './state-transitions';

export function createInitialGameState(): GameState {
  return {
    board: createEmptyBoard(GAME_CONFIG.GRID_SIZE),
    currentTurn: GAME_CONFIG.INITIAL_TURN,
    moveInProgress: false,
  };
}

export { processMove } from './state-transitions';
export { validateMove } from './move-validator';
```

**Note**: No new tests needed - this is just a facade/re-export

---

## Phase 4: Click Handler (1 hour)

### Step 4.1: Write Coordinate Mapping Tests (TDD Red)

**File**: `tests/unit/click-handler.test.ts`

```typescript
import { describe, test, expect } from 'vitest';
import { getCellFromCoordinates } from '../../src/input/click-handler';

describe('getCellFromCoordinates', () => {
  test('maps top-left cell correctly', () => {
    const position = getCellFromCoordinates(50, 50, 100, 3);
    expect(position).toEqual({ row: 0, col: 0 });
  });
  
  test('maps center cell correctly', () => {
    const position = getCellFromCoordinates(150, 150, 100, 3);
    expect(position).toEqual({ row: 1, col: 1 });
  });
  
  test('maps bottom-right cell correctly', () => {
    const position = getCellFromCoordinates(250, 250, 100, 3);
    expect(position).toEqual({ row: 2, col: 2 });
  });
  
  test('returns null for coordinates outside grid', () => {
    const position = getCellFromCoordinates(350, 250, 100, 3);
    expect(position).toBeNull();
  });
  
  test('handles cell boundaries correctly', () => {
    // Click on boundary line (assigned to right/bottom cell)
    const position = getCellFromCoordinates(100, 100, 100, 3);
    expect(position).toEqual({ row: 1, col: 1 });
  });
});
```

**Run tests**: `npm test` (should FAIL) ✅ RED

### Step 4.2: Implement Click Handler (TDD Green)

**File**: `src/input/click-handler.ts`

```typescript
import { GameState } from '../models/game-state';
import { CellPosition } from '../models/board';
import { processMove } from '../engine/game-engine';
import { CELL_SIZE } from '../constants/render-config';
import { GAME_CONFIG } from '../constants/game-config';

export function getCellFromCoordinates(
  x: number,
  y: number,
  cellSize: number,
  gridSize: number
): CellPosition | null {
  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);
  
  if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
    return { row, col };
  }
  
  return null;
}

export function getCanvasPosition(
  event: PointerEvent,
  canvas: HTMLCanvasElement
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

export function setupClickHandler(
  canvas: HTMLCanvasElement,
  initialState: GameState,
  onStateChange: (newState: GameState) => void
): () => void {
  let currentState = initialState;
  
  const handlePointerDown = (event: PointerEvent) => {
    const canvasPos = getCanvasPosition(event, canvas);
    const cellPos = getCellFromCoordinates(
      canvasPos.x,
      canvasPos.y,
      CELL_SIZE,
      GAME_CONFIG.GRID_SIZE
    );
    
    if (cellPos) {
      const newState = processMove(currentState, cellPos);
      if (newState !== currentState) {
        currentState = newState;
        onStateChange(newState);
      }
    }
  };
  
  canvas.addEventListener('pointerdown', handlePointerDown);
  
  // Return cleanup function
  return () => {
    canvas.removeEventListener('pointerdown', handlePointerDown);
  };
}
```

**Run tests**: `npm test` (should PASS) ✅ GREEN

---

## Phase 5: Turn Indicator (30 minutes)

### Step 5.1: Write Turn Indicator Tests (TDD Red)

**File**: `tests/unit/turn-indicator.test.ts`

```typescript
import { describe, test, expect, beforeEach } from 'vitest';
import { 
  createTurnIndicator, 
  updateTurnIndicator,
  formatTurnText 
} from '../../src/ui/turn-indicator';

describe('formatTurnText', () => {
  test('formats X correctly', () => {
    expect(formatTurnText('X')).toBe("Player X's Turn");
  });
  
  test('formats O correctly', () => {
    expect(formatTurnText('O')).toBe("Player O's Turn");
  });
});

describe('createTurnIndicator', () => {
  test('creates div element', () => {
    const element = createTurnIndicator('X');
    expect(element.tagName).toBe('DIV');
  });
  
  test('sets correct id', () => {
    const element = createTurnIndicator('X');
    expect(element.id).toBe('turnIndicator');
  });
  
  test('sets correct initial text', () => {
    const element = createTurnIndicator('X');
    expect(element.textContent).toBe("Player X's Turn");
  });
});

describe('updateTurnIndicator', () => {
  let element: HTMLDivElement;
  
  beforeEach(() => {
    element = document.createElement('div');
  });
  
  test('updates text content', () => {
    updateTurnIndicator(element, 'O');
    expect(element.textContent).toBe("Player O's Turn");
  });
});
```

**Run tests**: `npm test` (should FAIL) ✅ RED

### Step 5.2: Implement Turn Indicator (TDD Green)

**File**: `src/ui/turn-indicator.ts`

```typescript
import { PlayerSymbol } from '../constants/game-config';

export function formatTurnText(player: PlayerSymbol): string {
  return `Player ${player}'s Turn`;
}

export function createTurnIndicator(initialTurn: PlayerSymbol): HTMLDivElement {
  const element = document.createElement('div');
  element.id = 'turnIndicator';
  element.className = 'turn-indicator';
  element.textContent = formatTurnText(initialTurn);
  
  // Accessibility
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', 'polite');
  element.setAttribute('aria-atomic', 'true');
  
  return element;
}

export function updateTurnIndicator(
  element: HTMLElement,
  currentTurn: PlayerSymbol
): void {
  element.textContent = formatTurnText(currentTurn);
}

export function updateTurnIndicatorById(currentTurn: PlayerSymbol): void {
  const element = document.getElementById('turnIndicator');
  if (element) {
    updateTurnIndicator(element, currentTurn);
  } else {
    console.warn('Turn indicator element not found');
  }
}
```

**Run tests**: `npm test` (should PASS) ✅ GREEN

---

## Phase 6: Integration & Wiring (30 minutes)

### Step 6.1: Update HTML

**File**: `index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tic Tac Toe</title>
</head>
<body>
  <div id="gameContainer">
    <div id="turnIndicator" class="turn-indicator">
      Player X's Turn
    </div>
    <canvas id="gameCanvas" width="300" height="300"></canvas>
  </div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

### Step 6.2: Update CSS

**File**: `src/style.css`

```css
/* Add at end of file */

#gameContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}

.turn-indicator {
  font-family: Arial, sans-serif;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  color: #333;
  user-select: none;
  transition: color 0.2s ease;
}
```

### Step 6.3: Wire Up Main Entry Point

**File**: `src/main.ts` (replace existing content)

```typescript
import { createInitialGameState, processMove } from './engine/game-engine';
import { renderBoard } from './renderer/board-renderer';
import { setupClickHandler } from './input/click-handler';
import { updateTurnIndicatorById } from './ui/turn-indicator';
import { GameState } from './models/game-state';
import './style.css';

// Get canvas and context
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
if (!canvas) {
  throw new Error('Canvas element not found');
}

const context = canvas.getContext('2d');
if (!context) {
  throw new Error('Failed to get canvas context');
}

// Create initial game state
const initialState = createInitialGameState();

// Render initial board
renderBoard(initialState.board, context);
updateTurnIndicatorById(initialState.currentTurn);

// State change handler
function handleStateChange(newState: GameState): void {
  renderBoard(newState.board, context);
  updateTurnIndicatorById(newState.currentTurn);
}

// Setup click handler
const cleanup = setupClickHandler(canvas, initialState, handleStateChange);

console.log('Interactive gameplay ready!');
```

---

## Phase 7: Testing & Validation (30 minutes)

### Step 7.1: Run All Tests

```bash
npm test
```

**Expected**: All tests pass ✅

**Test Coverage Check**:
```bash
npm test -- --coverage
```

**Target Coverage**: >90% for engine and input modules

### Step 7.2: Manual Testing Checklist

Open in browser: `npm run dev`

**Test Scenarios**:

1. ✅ **Initial State**
   - Turn indicator shows "Player X's Turn"
   - Board is empty
   - No errors in console

2. ✅ **First Move**
   - Click any cell
   - X appears in clicked cell
   - Turn indicator changes to "Player O's Turn"

3. ✅ **Alternating Turns**
   - Click another cell
   - O appears in clicked cell
   - Turn indicator changes to "Player X's Turn"

4. ✅ **Occupied Cell Click**
   - Click a cell that already has X or O
   - Nothing changes
   - Turn stays the same

5. ✅ **Outside Board Click**
   - Click outside the 3x3 grid
   - Nothing happens
   - No errors

6. ✅ **Rapid Clicks** (debouncing)
   - Double-click a cell very quickly
   - Only one symbol appears
   - No duplicate moves

7. ✅ **Full Board**
   - Fill all 9 cells
   - All moves work correctly
   - Can click remaining cells until full

---

## Common Issues & Solutions

### Issue: Clicks Not Registering

**Symptom**: Clicking cells does nothing

**Solution**: Check console for errors. Verify:
- Canvas element exists
- Click handler is attached
- getBoundingClientRect() is working

**Debug**:
```typescript
canvas.addEventListener('pointerdown', (e) => {
  console.log('Click detected:', e.clientX, e.clientY);
});
```

### Issue: Wrong Cell Selected

**Symptom**: Clicking one cell highlights another

**Solution**: Verify CELL_SIZE constant matches canvas rendering
- Check `render-config.ts`: CELL_SIZE should be 100
- Check canvas dimensions: 300x300 (3 cells × 100px)

### Issue: Turn Not Switching

**Symptom**: Multiple X's or O's in a row

**Solution**: 
- Verify processMove returns new state
- Check that handleStateChange updates state reference
- Add logging to see state transitions

**Debug**:
```typescript
function handleStateChange(newState: GameState): void {
  console.log('State changed:', newState.currentTurn);
  // ... rest of handler
}
```

### Issue: Tests Failing

**Symptom**: Unit tests fail unexpectedly

**Solution**:
- Check imports are correct
- Verify jsdom is configured in Vitest
- Ensure test setup.ts is loaded
- Run single test file to isolate: `npm test game-state.test`

---

## Refactoring Tips (TDD Refactor Phase)

Now that tests are green, you can safely refactor:

**Opportunities**:
1. Extract board helper functions (getCell, setCell)
2. Add logging for debugging (can disable in production)
3. Improve error messages for failed validations
4. Add type guards for state validation

**Example Refactor**:
```typescript
// Before: Inline cell finding
const cell = state.board.cells.find(c => 
  c.position.row === position.row && c.position.col === position.col
);

// After: Helper function
function getCell(board: Board, position: CellPosition): Cell | undefined {
  return board.cells.find(c => 
    c.position.row === position.row && c.position.col === position.col
  );
}
```

**Always**: Run tests after each refactor ✅

---

## Next Steps

✅ **Feature Complete** - Interactive gameplay working!

**Future Features**:
- Feature 003: Win detection & game over
- Feature 004: Game reset button
- Feature 005: Player names
- Feature 006: Move animations

**Code Review Checklist**:
- ✅ All tests passing
- ✅ Constitution principles followed
- ✅ Game logic isolated from UI
- ✅ No magic numbers/strings
- ✅ Immutable state updates
- ✅ Accessible turn indicator

---

## Summary

**What You Built**:
- Game state management with immutable updates
- Pure game engine with move validation
- Click coordinate mapping and event handling
- Turn indicator UI with accessibility
- Complete TDD test suite

**Key Learnings**:
- TDD workflow: Red → Green → Refactor
- Separation of concerns: Logic vs UI vs Input
- Immutability prevents bugs
- Pure functions are easy to test

**Time Breakdown**:
- Setup & models: 45 min
- Game engine: 2 hours
- Click handler: 1 hour
- Turn indicator: 30 min
- Integration: 30 min
- Testing: 30 min
- **Total**: ~5.5 hours

Congratulations! You've built a fully interactive tic-tac-toe game with clean architecture and comprehensive tests. 🎉

