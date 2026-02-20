# Research: Interactive Gameplay

**Feature**: 002-interactive-gameplay  
**Date**: 2026-02-20  
**Purpose**: Resolve technical unknowns and establish best practices for interactive game state management, click handling, and turn-based gameplay

## Overview

This research phase addresses the key technical decisions needed to implement interactive tic-tac-toe gameplay while maintaining constitutional compliance (FSM architecture, isolated game logic, test-first development). All decisions prioritize simplicity, testability, and alignment with existing rendering infrastructure from feature 001.

## Research Areas

### 1. Game State Management Architecture

**Question**: What is the optimal structure for centralized game state that supports both current gameplay and future features (win detection, reset, undo)?

**Research Findings**:

TypeScript game state patterns generally follow three approaches:
1. **Immutable state with reducers** (Redux-like): Pure functions returning new state objects
2. **Mutable state with class methods**: OOP approach with encapsulated state
3. **Hybrid: Immutable data + functional transforms**: Plain objects with pure transformation functions

**Decision**: Immutable state with pure transformation functions

**Rationale**:
- **Testability**: Pure functions are trivially testable without mocking or setup
- **Predictability**: Immutability eliminates entire classes of bugs (shared references, unexpected mutations)
- **Time travel**: Immutable state history enables future undo/redo without additional complexity
- **Constitution alignment**: Fits FSM pattern (state → pure function → new state) and isolated game logic principle
- **Simplicity**: No class boilerplate, no `this` binding issues, composable functions

**Alternatives Considered**:
- ❌ Class-based state: Adds OOP complexity, harder to test, requires mocking for side effects
- ❌ Full Redux: Overkill for single-component game, adds unnecessary abstraction

**Implementation Pattern**:
```typescript
// Immutable state type
interface GameState {
  board: Board;
  currentTurn: 'X' | 'O';
  moveInProgress: boolean; // for click debouncing
}

// Pure transformation function
function placeMove(state: GameState, position: CellPosition): GameState {
  // Validation logic
  if (state.moveInProgress || !isEmptyCell(state.board, position)) {
    return state; // no change
  }
  
  // Create new state
  return {
    board: updateBoard(state.board, position, state.currentTurn),
    currentTurn: state.currentTurn === 'X' ? 'O' : 'X',
    moveInProgress: false,
  };
}
```

---

### 2. Click Event Handling & Coordinate Mapping

**Question**: How should canvas click events be translated to game cell positions, and what is the best practice for handling click coordinates in canvas applications?

**Research Findings**:

Canvas click handling requires mapping mouse/pointer coordinates (relative to viewport) to canvas coordinates (relative to canvas element), then to logical game coordinates (cell row/col).

Standard approaches:
1. **getBoundingClientRect() + offset calculation**: Most compatible, handles CSS transforms/scaling
2. **offsetX/offsetY properties**: Simpler but less reliable across browsers/scaling scenarios
3. **MouseEvent.clientX/Y - canvas.offsetLeft/Top**: Deprecated pattern, doesn't handle transforms

**Decision**: getBoundingClientRect() with offset calculation

**Rationale**:
- **Accuracy**: Correctly handles canvas CSS transforms, scaling, and positioning
- **Browser compatibility**: Works consistently across all modern browsers
- **Future-proof**: Supports responsive layouts and dynamic canvas sizing (future mobile features)
- **Industry standard**: Recommended by MDN and canvas game development best practices

**Alternatives Considered**:
- ❌ offsetX/offsetY: Simpler but unreliable with CSS scaling/transforms
- ❌ offsetLeft/Top: Doesn't handle CSS transforms, deprecated approach

**Implementation Pattern**:
```typescript
function getCanvasPosition(event: MouseEvent, canvas: HTMLCanvasElement): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function getCellFromCoordinates(x: number, y: number, cellSize: number, gridSize: number): CellPosition | null {
  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);
  
  // Validate bounds
  if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
    return { row, col };
  }
  return null; // click outside board
}
```

---

### 3. Click Debouncing Strategy

**Question**: What is the best approach to handle rapid multiple clicks and prevent race conditions during move processing?

**Research Findings**:

Common debouncing strategies:
1. **Time-based debouncing**: Ignore clicks within X milliseconds of previous click
2. **State-based locking**: Set flag during processing, ignore clicks while flag is true
3. **Event queue**: Queue all clicks and process sequentially
4. **First-click-only**: Process first click, ignore all until processing completes

Per spec clarification: "Queue only the first click and ignore subsequent clicks until processing completes" → State-based locking with first-click-only pattern.

**Decision**: State-based locking with `moveInProgress` flag

**Rationale**:
- **Simplicity**: Single boolean flag in state, no timers or queues
- **Spec compliance**: Exactly matches clarified requirement (first click only)
- **Synchronous validation**: Since move processing is <100ms and synchronous, flag can be checked immediately
- **Testability**: Easy to test with simple state assertions
- **No external dependencies**: Pure state management, no setTimeout or event systems

**Alternatives Considered**:
- ❌ Time-based debouncing: Adds complexity, harder to test, arbitrary timeout values
- ❌ Event queue: Overkill for synchronous processing, adds concurrency complexity
- ❌ No debouncing: Violates spec, allows race conditions

**Implementation Pattern**:
```typescript
// In state
interface GameState {
  moveInProgress: boolean;
}

// In click handler
function handleClick(state: GameState, position: CellPosition): GameState {
  if (state.moveInProgress) {
    return state; // ignore click
  }
  
  // Set lock
  const lockedState = { ...state, moveInProgress: true };
  
  // Process move (synchronous)
  const newState = placeMove(lockedState, position);
  
  // Release lock
  return { ...newState, moveInProgress: false };
}
```

---

### 4. Turn Indicator UI Approach

**Question**: Should the turn indicator be rendered on canvas or as HTML/DOM element, and what are the trade-offs?

**Research Findings**:

Two main approaches for displaying game UI alongside canvas:
1. **Canvas text rendering**: Use fillText/strokeText to draw text on canvas
2. **HTML overlay/adjacent element**: Position HTML element near canvas with DOM rendering

**Decision**: HTML DOM element (positioned above/below canvas)

**Rationale**:
- **Accessibility**: DOM text is screen-reader accessible, selectable, and supports i18n
- **Styling flexibility**: CSS enables easy styling, animations, and responsive design
- **Separation of concerns**: Keeps text rendering separate from game board canvas
- **Performance**: Avoids unnecessary canvas redraws when only turn text changes
- **Future extensibility**: Easier to add player names, scores, buttons alongside turn indicator
- **Constitution alignment**: UI components separate from rendering logic

**Alternatives Considered**:
- ❌ Canvas text rendering: Poor accessibility, hard to style, couples UI to canvas rendering, requires full canvas redraw for text updates

**Implementation Pattern**:
```html
<!-- HTML -->
<div id="gameContainer">
  <div id="turnIndicator">Player X's Turn</div>
  <canvas id="gameCanvas"></canvas>
</div>
```

```typescript
// TypeScript
function updateTurnIndicator(currentTurn: 'X' | 'O'): void {
  const indicator = document.getElementById('turnIndicator');
  if (indicator) {
    indicator.textContent = `Player ${currentTurn}'s Turn`;
  }
}
```

```css
/* CSS */
#turnIndicator {
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}
```

---

### 5. Testing Strategy for Interactive Features

**Question**: How should interactive features (click handling, state transitions) be tested without browser dependencies while maintaining TDD principles?

**Research Findings**:

Testing approaches for browser-based interactive games:
1. **Unit tests with mocks**: Mock DOM/Canvas APIs, test pure logic
2. **Integration tests with jsdom**: Simulate browser environment in Node.js
3. **E2E tests with Playwright**: Full browser automation
4. **Hybrid**: Unit tests for logic, integration tests for wiring

**Decision**: Unit tests with mocks for all game logic + minimal integration tests for wiring

**Rationale**:
- **TDD compatibility**: Pure functions can be tested immediately as written (red-green-refactor)
- **Fast feedback**: Unit tests run in milliseconds, enabling rapid iteration
- **Constitution compliance**: Tests run in isolation without browser dependencies (Principle III)
- **Comprehensive coverage**: Can test edge cases (rapid clicks, invalid positions) easily
- **Simplicity**: Existing Vitest + jsdom setup already supports this pattern (from feature 001)

**Test Categories**:
1. **Pure logic tests** (no mocks needed):
   - State transitions: `placeMove(state, position) → newState`
   - Validation: `isEmptyCell(board, position) → boolean`
   - Cell mapping: `getCellFromCoordinates(x, y) → CellPosition`

2. **Integration tests** (minimal DOM mocks):
   - Click handler wiring: Canvas event → game action
   - Turn indicator update: State change → DOM update

**Implementation Pattern**:
```typescript
// Pure logic test - no mocks
test('placeMove places X in empty cell and switches turn', () => {
  const state: GameState = { board: emptyBoard, currentTurn: 'X', moveInProgress: false };
  const newState = placeMove(state, { row: 0, col: 0 });
  
  expect(getCellValue(newState.board, { row: 0, col: 0 })).toBe('X');
  expect(newState.currentTurn).toBe('O');
});

// Integration test - DOM mock
test('click handler updates turn indicator', () => {
  document.body.innerHTML = '<div id="turnIndicator"></div>';
  const state: GameState = createInitialState();
  
  handleMoveAndUpdateUI(state, { row: 0, col: 0 });
  
  expect(document.getElementById('turnIndicator')?.textContent).toBe("Player O's Turn");
});
```

---

### 6. Event Listener Management

**Question**: What is the best practice for attaching and managing canvas click event listeners in TypeScript games?

**Research Findings**:

Event listener patterns in canvas applications:
1. **Direct addEventListener**: Attach listener to canvas element
2. **React-style synthetic events**: Framework-managed events (not applicable - no framework)
3. **Event delegation**: Attach to parent, check event.target (unnecessary for single canvas)
4. **Pointer Events API**: Modern unified API for mouse/touch/pen input

**Decision**: Direct addEventListener with Pointer Events API

**Rationale**:
- **Modern standard**: Pointer Events API (pointerdown, pointermove, etc.) is recommended modern replacement for mouse events
- **Future mobile support**: Single API handles mouse, touch, and pen without separate codepaths
- **Simplicity**: Direct attachment is clearest for single interactive element
- **Constitution alignment**: Pure game logic can be tested independently of event listener wiring

**Alternatives Considered**:
- ❌ Mouse events only: Requires separate touch event handling for mobile
- ❌ Event delegation: Unnecessary complexity for single canvas element

**Implementation Pattern**:
```typescript
function initializeGameInput(canvas: HTMLCanvasElement, gameState: GameState): void {
  canvas.addEventListener('pointerdown', (event: PointerEvent) => {
    const canvasPos = getCanvasPosition(event, canvas);
    const cellPos = getCellFromCoordinates(canvasPos.x, canvasPos.y, CELL_SIZE, GRID_SIZE);
    
    if (cellPos) {
      const newState = handleMove(gameState, cellPos);
      if (newState !== gameState) {
        // State changed - update UI
        renderBoard(newState.board, context);
        updateTurnIndicator(newState.currentTurn);
        gameState = newState; // Update reference
      }
    }
  });
}
```

**Note**: Cleanup with `removeEventListener` not needed for this feature (single game session per page load), but will be added in future feature for game reset/restart.

---

## Technology Stack Validation

All decisions validated against existing technology stack (no new dependencies required):

- ✅ **TypeScript**: All patterns use standard TypeScript features (interfaces, type guards, pure functions)
- ✅ **Vitest + jsdom**: Existing testing setup supports all proposed test patterns
- ✅ **Canvas API**: Click handling and coordinate mapping work with existing canvas setup
- ✅ **Vite**: No build configuration changes needed
- ✅ **No new dependencies**: All solutions use vanilla TypeScript + existing tools

## Constitution Compliance Validation

All research decisions validated against constitution principles:

- ✅ **Principle I (FSM)**: Immutable state with explicit GameState type and pure transition functions
- ✅ **Principle II (Isolation)**: Game logic (engine/) separate from input (input/) and rendering (renderer/)
- ✅ **Principle III (TDD)**: All patterns designed for test-first development with fast unit tests
- ✅ **Principle IV (Deterministic)**: All inputs/outputs/edge cases covered in research decisions
- ✅ **Principle V (Code Quality)**: Game config constants centralized, no magic numbers/strings

## Summary

All research questions resolved with specific, justified decisions that maintain simplicity, testability, and constitutional compliance. No new dependencies required. All patterns align with existing codebase conventions from feature 001. Ready to proceed to Phase 1 (Design & Contracts).

**Key Takeaways**:
1. Immutable state + pure functions for game logic
2. getBoundingClientRect() for accurate click coordinate mapping
3. State-based locking (moveInProgress flag) for click debouncing
4. HTML DOM element for accessible turn indicator
5. Unit tests with mocks for comprehensive TDD coverage
6. Pointer Events API for future-proof input handling

**No clarifications needed** - All technical unknowns resolved.

