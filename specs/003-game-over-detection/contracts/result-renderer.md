# Contract: Result Renderer

**Module**: `src/ui/result-display.ts` (NEW) and `src/renderer/board-renderer.ts` (MODIFIED)  
**Purpose**: Render game result messages and visually highlight winning combinations  
**Dependencies**: GameState, RESULT_MESSAGES constant, Canvas rendering context

## Overview

This contract defines the rendering extensions needed to display game-over results: a text-based result message (e.g., "Player X wins!") and visual highlighting of winning marks on the canvas. The result display module handles DOM-based message rendering, while the board renderer is extended to apply visual distinction (glow/border effect) to winning cells.

## Part A: Result Display Module (NEW)

### Module: `src/ui/result-display.ts`

**Purpose**: Manage the visual display of game result messages.

---

### renderResult

```typescript
function renderResult(
  status: GameStatus,
  resultElement: HTMLElement,
  ariaElement: HTMLElement
): void
```

**Purpose**: Update the result display and ARIA live region with the appropriate message based on game status.

**Parameters**:
- `status`: Current game status (ACTIVE, X_WON, O_WON, DRAW)
- `resultElement`: DOM element for visible result display
- `ariaElement`: DOM element for ARIA live region

**Behavior**:
1. Map status to message using RESULT_MESSAGES constant
2. If status is ACTIVE, clear both elements (empty string)
3. If status is terminal (win/draw), set textContent of both elements to result message
4. ARIA live region will automatically announce change (via aria-live="polite")

**Algorithm**:
```typescript
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
```

**Side Effects**:
- Updates DOM (resultElement and ariaElement textContent)
- Shows/hides result display via CSS display property

**Example**:
```typescript
const resultDiv = document.getElementById('game-result')!;
const ariaDiv = document.getElementById('game-result-announcement')!;

// Game in progress
renderResult('ACTIVE', resultDiv, ariaDiv);
// resultDiv.textContent = ''
// ariaDiv.textContent = ''

// X wins
renderResult('X_WON', resultDiv, ariaDiv);
// resultDiv.textContent = 'Player X wins!'
// ariaDiv.textContent = 'Player X wins!'
// Screen reader announces: "Player X wins!"
```

---

### createResultDisplay

```typescript
function createResultDisplay(): HTMLElement
```

**Purpose**: Programmatically create the result display element with appropriate styling classes.

**Returns**:
- HTMLElement (div) configured for result display

**Behavior**:
1. Create div element
2. Set id to 'game-result'
3. Add CSS class 'result-display'
4. Initially hidden (display: none)

**Example**:
```typescript
const resultElement = createResultDisplay();
document.body.appendChild(resultElement);
```

**Note**: This is a convenience function for programmatic setup. HTML can also define the element statically.

---

### createAriaLiveRegion

```typescript
function createAriaLiveRegion(): HTMLElement
```

**Purpose**: Programmatically create the ARIA live region element with accessibility attributes.

**Returns**:
- HTMLElement (div) configured as ARIA live region

**Behavior**:
1. Create div element
2. Set id to 'game-result-announcement'
3. Set role="status"
4. Set aria-live="polite"
5. Set aria-atomic="true"
6. Add CSS class 'sr-only' (screen reader only, visually hidden)

**Example**:
```typescript
const ariaElement = createAriaLiveRegion();
document.body.appendChild(ariaElement);
```

---

## Part B: Board Renderer Extension (MODIFIED)

### Module: `src/renderer/board-renderer.ts`

**Purpose**: Extend existing board rendering to highlight winning cells.

---

### renderBoard (MODIFIED)

```typescript
function renderBoard(
  ctx: CanvasRenderingContext2D,
  board: Board,
  winningLine?: CellPosition[]
): void
```

**Purpose**: Render the game board with optional winning line highlighting.

**Parameters**:
- `ctx`: Canvas 2D rendering context
- `board`: Current board state
- `winningLine`: Optional array of 3 cell positions to highlight (undefined if no win)

**Changes from Original**:
- Added optional `winningLine` parameter
- Pass `isWinning` flag to renderCell/renderMark functions

**Algorithm**:
```
1. Create Set of winning positions for O(1) lookup (if winningLine present)
2. Clear canvas (existing logic)
3. Draw grid lines (existing logic)
4. For each cell:
   a. Check if cell position is in winning positions Set
   b. Render cell with isWinning flag
5. Render all marks with highlight for winning cells
```

**Example**:
```typescript
// Without winning line (game in progress)
renderBoard(ctx, board);

// With winning line (X wins on top row)
renderBoard(ctx, board, [
  { row: 0, col: 0 },
  { row: 0, col: 1 },
  { row: 0, col: 2 }
]);
```

---

### renderMark (MODIFIED)

```typescript
function renderMark(
  ctx: CanvasRenderingContext2D,
  row: number,
  col: number,
  piece: GamePiece,
  isWinning: boolean = false
): void
```

**Purpose**: Render X or O symbol with optional winning highlight effect.

**Parameters**:
- `ctx`: Canvas 2D rendering context
- `row`: Cell row (0-2)
- `col`: Cell column (0-2)
- `piece`: Symbol to render ('X' or 'O')
- `isWinning`: Whether this mark is part of winning line (default false)

**Changes from Original**:
- Added optional `isWinning` parameter (default false)
- Apply highlight styles when isWinning is true

**Winning Highlight Styles**:
- **Line width**: 6 (vs. normal 3)
- **Shadow blur**: 15
- **Shadow color**: '#ff6b6b' (red) for X, '#4dabf7' (blue) for O
- **Shadow offset**: (0, 0) for glow effect

**Algorithm**:
```typescript
// Calculate center position (existing logic)
const x = col * CELL_SIZE + CELL_SIZE / 2;
const y = row * CELL_SIZE + CELL_SIZE / 2;

// Apply styles
if (isWinning) {
  ctx.lineWidth = 6;
  ctx.shadowBlur = 15;
  ctx.shadowColor = piece === 'X' ? '#ff6b6b' : '#4dabf7';
} else {
  ctx.lineWidth = 3;
  ctx.shadowBlur = 0;
}

// Draw mark (existing X/O rendering logic)
if (piece === 'X') {
  // Draw X with applied styles
} else {
  // Draw O with applied styles
}

// Reset shadow for next drawing
ctx.shadowBlur = 0;
```

**Example**:
```typescript
// Normal mark
renderMark(ctx, 0, 0, 'X', false);

// Winning mark (with glow)
renderMark(ctx, 0, 0, 'X', true);
```

---

## HTML Structure Requirements

### index.html (MODIFIED)

**Required Elements**:

```html
<!-- Visible result display -->
<div id="game-result" class="result-display" style="display: none;">
  <!-- Content updated dynamically -->
</div>

<!-- ARIA live region (visually hidden, announced to screen readers) -->
<div 
  id="game-result-announcement" 
  role="status"
  aria-live="polite"
  aria-atomic="true"
  class="sr-only">
  <!-- Content updated dynamically -->
</div>

<!-- Existing canvas -->
<canvas id="gameCanvas" width="600" height="600"></canvas>

<!-- Existing turn indicator -->
<div id="turn-indicator"></div>
```

**Placement**:
- Result display should be above or below the canvas (visible)
- ARIA live region can be anywhere (visually hidden via .sr-only)
- Turn indicator remains as is

---

## CSS Requirements

### style.css (MODIFIED)

**New Styles**:

```css
/* Result display - visible text */
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

/* Screen reader only - visually hidden but accessible */
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

**Rationale**:
- `.result-display`: Clear, prominent visual feedback
- `.sr-only`: Standard technique to hide content visually while keeping it accessible to screen readers

---

## Rendering Integration Flow

### Main Rendering Loop (MODIFIED)

```typescript
function render(gameState: GameState): void {
  // 1. Render board with winning line (if present)
  renderBoard(ctx, gameState.board, gameState.winningLine);

  // 2. Update turn indicator (only show if game active)
  if (gameState.status === 'ACTIVE') {
    renderTurnIndicator(gameState.currentTurn);
  } else {
    hideTurnIndicator();
  }

  // 3. Update result display and ARIA
  const resultElement = document.getElementById('game-result')!;
  const ariaElement = document.getElementById('game-result-announcement')!;
  renderResult(gameState.status, resultElement, ariaElement);
}
```

**Flow**:
1. Board rendering projects winning line to visual highlights
2. Turn indicator hidden when game is over
3. Result display shows message for terminal states, hidden for active state
4. ARIA live region automatically announces result changes

---

## Testing Requirements

### Result Display Tests (8 tests)

- ✅ renderResult with ACTIVE status clears result element
- ✅ renderResult with ACTIVE status clears ARIA element
- ✅ renderResult with X_WON status displays "Player X wins!"
- ✅ renderResult with O_WON status displays "Player O wins!"
- ✅ renderResult with DRAW status displays "It's a draw!"
- ✅ renderResult updates both result and ARIA elements identically
- ✅ createResultDisplay creates element with correct id and class
- ✅ createAriaLiveRegion creates element with correct ARIA attributes

### Board Renderer Tests (6 tests)

- ✅ renderBoard without winningLine renders normal marks
- ✅ renderBoard with winningLine highlights winning cells
- ✅ renderMark with isWinning=true applies thicker line width
- ✅ renderMark with isWinning=true applies shadow blur
- ✅ renderMark with isWinning=true uses correct shadow color for X
- ✅ renderMark with isWinning=true uses correct shadow color for O

### Integration Tests (4 tests)

- ✅ Full render cycle with win shows highlighted winning line
- ✅ Full render cycle with draw shows no highlights
- ✅ Result message appears when game ends
- ✅ ARIA live region content matches visible result

### Accessibility Tests (3 tests)

- ✅ ARIA live region has role="status"
- ✅ ARIA live region has aria-live="polite"
- ✅ ARIA live region has aria-atomic="true"

**Total**: 21+ test cases

---

## Performance Characteristics

| Operation | Time Complexity | Notes |
|-----------|----------------|-------|
| renderResult | O(1) | Simple DOM textContent updates |
| renderBoard | O(n) where n=9 | Same as before, plus O(1) Set lookup per cell |
| renderMark | O(1) | Additional style application is O(1) |

**Overall**: Rendering performance unchanged; winning line lookup adds negligible overhead (<1ms).

---

## Accessibility Compliance

### WCAG 2.1 Requirements Met

✅ **1.3.1 Info and Relationships**: Result message available programmatically via ARIA  
✅ **1.4.3 Contrast**: Result display has adequate contrast (tested with #333 on #f0f0f0)  
✅ **4.1.3 Status Messages**: ARIA live region with role="status" for automatic announcements

### Screen Reader Support

- **Announcement timing**: "polite" waits for user pause (non-disruptive)
- **Atomic reading**: aria-atomic="true" ensures full message is read
- **Content parity**: ARIA region and visual display show identical text

---

## Dependencies

### From `models/game-state.ts`
- `GameState`: Interface with status and winningLine
- `GameStatus`: Type for status values

### From `constants/game-config.ts`
- `RESULT_MESSAGES`: Mapping of status to display text

### From `models/board.ts`
- `Board`, `Cell`, `CellPosition`: Board data structures
- `GamePiece`: 'X' | 'O' | null

### From `constants/render-config.ts`
- `CELL_SIZE`: Cell dimensions for position calculation
- `COLORS`: Existing color palette (may be used for marks)

---

## Design Principles

✅ **Separation of concerns**: Result display (DOM) separate from board rendering (Canvas)  
✅ **Pure rendering**: Functions project state to output, no state modification  
✅ **Accessibility first**: ARIA live region for screen reader support  
✅ **Progressive enhancement**: Winning line highlighting enhances visual feedback without being critical  
✅ **Consistent styling**: Winning highlights use visual metaphor (glow) matching UI theme  
✅ **Type-safe**: All rendering functions fully typed with TypeScript strict mode

---

## Non-Goals

This module does NOT:
- ❌ Detect wins/draws (win-detector handles that)
- ❌ Update game state (state-transitions handles that)
- ❌ Handle user input (click-handler handles that)
- ❌ Manage game loop timing (main.ts handles that)

**Single Responsibility**: Render game results and winning line highlights.

