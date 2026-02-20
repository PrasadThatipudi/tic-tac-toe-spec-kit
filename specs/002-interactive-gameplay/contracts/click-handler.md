# Click Handler Contract

**Module**: `src/input/click-handler.ts`  
**Purpose**: Translate canvas pointer events into game cell positions and coordinate with game engine  
**Type**: Event handler module (interfaces between DOM and pure game logic)

## Overview

The click handler acts as an adapter between browser events and game logic. It receives pointer events on the canvas, maps click coordinates to cell positions, calls the game engine to process moves, and triggers UI updates. This module is the ONLY place where DOM event handling occurs for gameplay.

## Public API

### setupClickHandler()

**Description**: Initializes click event listener on canvas element and wires up game loop.

**Signature**:
```typescript
function setupClickHandler(
  canvas: HTMLCanvasElement,
  initialState: GameState,
  onStateChange: (newState: GameState) => void
): () => void;
```

**Inputs**:
- `canvas`: Canvas DOM element to attach event listener
- `initialState`: Starting game state
- `onStateChange`: Callback function invoked when game state changes (for rendering updates)

**Outputs**:
- Returns cleanup function that removes event listener (for future game reset feature)

**Behavior**:
1. Attach 'pointerdown' event listener to canvas
2. On each click:
   - Get canvas-relative coordinates
   - Map coordinates to cell position
   - Call game engine to process move
   - If state changed, invoke onStateChange callback
3. Return function that calls removeEventListener

**Side Effects**:
- Attaches event listener to canvas DOM element
- Maintains internal reference to current game state
- Invokes onStateChange callback (which triggers rendering)

**Example**:
```typescript
const cleanup = setupClickHandler(
  canvas,
  initialState,
  (newState) => {
    renderBoard(newState.board, context);
    updateTurnIndicator(newState.currentTurn);
  }
);

// Later, to cleanup:
cleanup();
```

**Error Handling**:
- Invalid clicks (outside board, occupied cells) silently ignored
- No errors thrown to user
- Logs warnings in development mode (console.warn)

---

### getCanvasPosition()

**Description**: Converts mouse/pointer event coordinates (viewport-relative) to canvas-relative coordinates.

**Signature**:
```typescript
function getCanvasPosition(
  event: PointerEvent, 
  canvas: HTMLCanvasElement
): { x: number; y: number };
```

**Inputs**:
- `event`: Browser pointer event containing clientX/clientY
- `canvas`: Canvas element to get bounding rectangle

**Outputs**:
- Object with x, y coordinates relative to canvas top-left corner

**Algorithm**:
1. Get canvas bounding rectangle: `canvas.getBoundingClientRect()`
2. Calculate offset: 
   - `x = event.clientX - rect.left`
   - `y = event.clientY - rect.top`
3. Return { x, y }

**Coordinate Systems**:
- **Input**: Viewport coordinates (pixels from top-left of browser window)
- **Output**: Canvas coordinates (pixels from top-left of canvas element)
- **Handles**: CSS transforms, scaling, and canvas positioning

**Example**:
```typescript
canvas.addEventListener('pointerdown', (event) => {
  const pos = getCanvasPosition(event, canvas);
  // pos = { x: 120, y: 85 } (canvas-relative pixels)
});
```

**Edge Cases**:
- Canvas with CSS transforms → correctly handled by getBoundingClientRect()
- Canvas scaled with CSS → coordinates still accurate
- Canvas positioned with margins/padding → correctly handled

---

### getCellFromCoordinates()

**Description**: Maps canvas pixel coordinates to logical game cell position.

**Signature**:
```typescript
function getCellFromCoordinates(
  x: number, 
  y: number, 
  cellSize: number, 
  gridSize: number
): CellPosition | null;
```

**Inputs**:
- `x`: Canvas x-coordinate in pixels
- `y`: Canvas y-coordinate in pixels
- `cellSize`: Size of each cell in pixels (from render config)
- `gridSize`: Number of rows/columns in grid (3 for tic-tac-toe)

**Outputs**:
- CellPosition { row, col } if click is within grid bounds
- null if click is outside grid

**Algorithm**:
1. Calculate cell indices:
   - `col = Math.floor(x / cellSize)`
   - `row = Math.floor(y / cellSize)`
2. Validate bounds:
   - If `row >= 0 && row < gridSize && col >= 0 && col < gridSize`: return { row, col }
   - Otherwise: return null

**Example**:
```typescript
// CELL_SIZE = 100, GRID_SIZE = 3
getCellFromCoordinates(120, 85, 100, 3)
// => { row: 0, col: 1 } (second cell in first row)

getCellFromCoordinates(350, 250, 100, 3)
// => null (outside 300x300 grid)
```

**Boundary Handling**:
- Click exactly on grid line → assigned to cell to the right/bottom
- Click in cell padding/margin → still maps to that cell
- Click outside grid → returns null

**Coordinate Mapping Visual**:
```
Canvas Pixels          Cell Positions
  0   100  200  300      0   1   2
0 +----+----+----+    0 +---+---+---+
  |    |    |    |      | 0 | 1 | 2 |
100+----+----+----+    1 +---+---+---+
  |    |    |    |      | 3 | 4 | 5 |
200+----+----+----+    2 +---+---+---+
  |    |    |    |      | 6 | 7 | 8 |
300+----+----+----+      +---+---+---+

Click at (120, 85):
  col = floor(120/100) = 1
  row = floor(85/100) = 0
  => Cell (0, 1)
```

---

## Internal Functions

### handlePointerDown()

**Description**: Internal event handler function called on each canvas click.

**Signature**:
```typescript
function handlePointerDown(
  event: PointerEvent,
  canvas: HTMLCanvasElement,
  currentState: GameState,
  onStateChange: (newState: GameState) => void
): void;
```

**Behavior**:
1. Call getCanvasPosition(event, canvas)
2. Call getCellFromCoordinates(x, y, CELL_SIZE, GRID_SIZE)
3. If position is null (outside grid), return early
4. Call processMove(currentState, position)
5. If newState !== currentState:
   - Update internal state reference
   - Invoke onStateChange(newState)

**Side Effects**:
- Mutates internal state reference (for next click)
- Invokes callback (triggers rendering)

**Note**: This function is created as a closure inside setupClickHandler to maintain state reference.

---

## Dependencies

**Internal Dependencies**:
- `models/game-state.ts`: GameState, CellPosition types
- `engine/game-engine.ts`: processMove() function
- `constants/render-config.ts`: CELL_SIZE constant
- `constants/game-config.ts`: GRID_SIZE constant

**External Dependencies**:
- Browser Pointer Events API (PointerEvent, addEventListener)
- HTMLCanvasElement.getBoundingClientRect()

---

## Testing Strategy

### Unit Tests

**Test Categories**:

1. **Coordinate Mapping**
   - ✅ getCanvasPosition returns correct canvas-relative coordinates
   - ✅ getCellFromCoordinates maps to correct cell for center of cell
   - ✅ getCellFromCoordinates maps to correct cell for edge of cell
   - ✅ getCellFromCoordinates returns null for coordinates outside grid
   - ✅ getCellFromCoordinates handles boundary cases (on grid line)

2. **Cell Position Calculation**
   - ✅ Top-left cell (0,0) correctly identified
   - ✅ Center cell (1,1) correctly identified
   - ✅ Bottom-right cell (2,2) correctly identified
   - ✅ All 9 cells map to correct positions

**Mock Requirements**:
- Mock PointerEvent (with clientX, clientY properties)
- Mock HTMLCanvasElement.getBoundingClientRect()
- Mock canvas element (minimal interface)

**Example Test**:
```typescript
test('getCellFromCoordinates maps center of cell to correct position', () => {
  // Cell (1,1) center is at (150, 150) with CELL_SIZE=100
  const position = getCellFromCoordinates(150, 150, 100, 3);
  expect(position).toEqual({ row: 1, col: 1 });
});

test('getCellFromCoordinates returns null for click outside grid', () => {
  const position = getCellFromCoordinates(350, 250, 100, 3);
  expect(position).toBeNull();
});
```

### Integration Tests

**Test Categories**:

1. **Event Handler Wiring**
   - ✅ setupClickHandler attaches event listener to canvas
   - ✅ Click on empty cell triggers onStateChange callback
   - ✅ Click on occupied cell does NOT trigger callback
   - ✅ Click outside grid does NOT trigger callback
   - ✅ Cleanup function removes event listener

2. **Game Loop Integration**
   - ✅ Valid click → state update → callback invoked with new state
   - ✅ Invalid click → no state update → callback not invoked

**Mock Requirements**:
- jsdom canvas element
- Mock PointerEvent dispatch
- Mock game engine (processMove)
- Spy on onStateChange callback

**Example Test**:
```typescript
test('click on empty cell triggers state change callback', () => {
  const canvas = document.createElement('canvas');
  const onStateChange = jest.fn();
  const initialState = createInitialGameState();
  
  setupClickHandler(canvas, initialState, onStateChange);
  
  // Simulate click on cell (0,0)
  const event = new PointerEvent('pointerdown', { clientX: 50, clientY: 50 });
  canvas.dispatchEvent(event);
  
  expect(onStateChange).toHaveBeenCalledTimes(1);
  expect(onStateChange).toHaveBeenCalledWith(
    expect.objectContaining({ currentTurn: 'O' })
  );
});
```

---

## Event Listener Lifecycle

### Setup Phase (Game Initialization)
```
main.ts:
  const canvas = document.getElementById('gameCanvas')
  const initialState = createInitialGameState()
  
  const cleanup = setupClickHandler(
    canvas,
    initialState,
    handleGameStateChange
  )
```

### Runtime Phase (User Interaction)
```
User clicks canvas at (120, 85)
  ↓
Browser fires PointerEvent
  ↓
handlePointerDown called
  ↓
getCanvasPosition → { x: 120, y: 85 }
  ↓
getCellFromCoordinates → { row: 0, col: 1 }
  ↓
processMove(state, { row: 0, col: 1 }) → newState
  ↓
if (newState !== state):
  onStateChange(newState)
    ↓
    Rendering updates (board + turn indicator)
```

### Cleanup Phase (Future: Game Reset)
```
cleanup() // removes event listener
```

---

## Performance Requirements

- **Click processing**: <10ms from click to callback
- **Coordinate mapping**: <0.1ms (simple arithmetic)
- **No memory leaks**: Event listener properly removed on cleanup

---

## Future Extensions

**Phase 4 (Game Reset)**:
- Call cleanup() before reinitializing game
- Re-setup handler with new initial state

**Phase 6 (Animations)**:
- Add optional delay before onStateChange callback
- Coordinate with animation system

**Phase 7 (Mobile Touch)**:
- Already handles touch via Pointer Events API
- May need to prevent default touch behaviors (scrolling, zooming)

---

## Contract Validation Checklist

- ✅ All public functions have clear signatures
- ✅ All coordinate transformations documented
- ✅ Event handler lifecycle specified
- ✅ Side effects explicitly documented
- ✅ Test strategy defined
- ✅ DOM dependencies isolated to this module
- ✅ Integration with game engine specified
- ✅ Cleanup mechanism provided

