# Research: Game Over Detection

**Feature**: 003-game-over-detection  
**Date**: 2026-02-20  
**Purpose**: Resolve technical unknowns and establish best practices for win condition detection, draw detection, game status management, and accessibility (ARIA) announcements

## Overview

This research phase addresses the key technical decisions needed to implement game-over detection for tic-tac-toe while maintaining constitutional compliance (FSM architecture, isolated game logic, test-first development). All decisions prioritize performance (optimal win checking), clarity (explicit game status), and accessibility (screen reader support).

## Research Areas

### 1. Win Detection Strategy: Full Board Scan vs. Optimized Line Checking

**Question**: Should the system check all 8 possible win patterns after every move, or only check the lines (row, column, diagonals) that contain the just-placed mark?

**Research Findings**:

Win detection approaches for tic-tac-toe:
1. **Full scan (all 8 lines)**: Check every row, column, and diagonal after each move
2. **Optimized scan (3-5 lines)**: Check only row and column of placed mark, plus diagonals if mark is on diagonal
3. **Incremental counter**: Maintain running counts per line, check if any reaches 3
4. **Bitboard**: Use bitmasks for ultra-fast win checking (common in game engines)

**Decision**: Optimized line checking (3-5 checks per move)

**Rationale**:
- **Performance**: 3-5 checks vs. 8 checks = 37-62% reduction per move (meets <100ms detection goal easily)
- **Spec alignment**: Feature spec clarification explicitly states "Check only the row, column, and diagonals that include the just-placed mark (3-5 checks maximum)"
- **Simplicity**: Straightforward logic, easy to test and reason about
- **Maintainability**: Clear connection between move position and checked lines
- **Adequate for 3x3**: Performance gain from bitboards/counters negligible for 9-cell board, adds complexity

**Alternatives Considered**:
- ❌ Full scan (8 lines): Violates spec clarification, unnecessary work checking lines that couldn't have changed
- ❌ Incremental counters: Adds state complexity (must track 8 line counts), harder to test, premature optimization
- ❌ Bitboard: Massive overkill for 3x3 grid, obfuscates logic, harder to understand/maintain

**Implementation Pattern**:
```typescript
// Define all 8 win patterns as constant
const WIN_PATTERNS: CellPosition[][] = [
  // Rows
  [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}],
  [{row: 1, col: 0}, {row: 1, col: 1}, {row: 1, col: 2}],
  [{row: 2, col: 0}, {row: 2, col: 1}, {row: 2, col: 2}],
  // Columns
  [{row: 0, col: 0}, {row: 1, col: 0}, {row: 2, col: 0}],
  [{row: 0, col: 1}, {row: 1, col: 1}, {row: 2, col: 1}],
  [{row: 0, col: 2}, {row: 1, col: 2}, {row: 2, col: 2}],
  // Diagonals
  [{row: 0, col: 0}, {row: 1, col: 1}, {row: 2, col: 2}], // top-left to bottom-right
  [{row: 0, col: 2}, {row: 1, col: 1}, {row: 2, col: 0}], // top-right to bottom-left
];

function getRelevantPatterns(lastMove: CellPosition): number[] {
  const patterns = [];
  
  // Always check row and column
  patterns.push(lastMove.row); // row pattern index
  patterns.push(3 + lastMove.col); // column pattern index (offset by 3)
  
  // Check main diagonal (top-left to bottom-right) if on diagonal
  if (lastMove.row === lastMove.col) {
    patterns.push(6);
  }
  
  // Check anti-diagonal (top-right to bottom-left) if on anti-diagonal
  if (lastMove.row + lastMove.col === 2) {
    patterns.push(7);
  }
  
  return patterns;
}

function checkWin(board: Board, lastMove: CellPosition): WinResult | null {
  const relevantPatternIndices = getRelevantPatterns(lastMove);
  const player = getCellValue(board, lastMove.row, lastMove.col);
  
  for (const patternIndex of relevantPatternIndices) {
    const pattern = WIN_PATTERNS[patternIndex];
    if (isWinningLine(board, pattern, player)) {
      return { winner: player, winningLine: pattern };
    }
  }
  
  return null;
}
```

---

### 2. Game Status Representation: Implicit Checks vs. Explicit Status Field

**Question**: Should game-over state be determined by checking board state dynamically (implicit), or should GameState include an explicit status field (ACTIVE, X_WON, O_WON, DRAW)?

**Research Findings**:

Game state patterns for completion status:
1. **Implicit status**: Calculate game-over by checking board state every time (no stored status)
2. **Explicit status field**: Store current status in GameState, update on transitions
3. **Hybrid**: Store status but recalculate occasionally for validation

**Decision**: Explicit status field with GameStatus enum

**Rationale**:
- **FSM compliance**: Constitution Principle I requires explicit, enumerable states; implicit checks violate FSM pattern
- **Performance**: O(1) status check vs. O(8) win pattern checks every render/validation
- **Clarity**: Single source of truth for game state; no ambiguity about whether game is over
- **Spec alignment**: Feature spec specifies "Store game result in a status enum (ACTIVE, X_WON, O_WON, DRAW) with optional winningLine array"
- **Testability**: Easy to test state transitions with explicit values
- **Future features**: Reset/undo features need explicit status to restore correctly

**Alternatives Considered**:
- ❌ Implicit checks: Violates FSM principle, slower, harder to test, no single source of truth
- ❌ Hybrid approach: Unnecessary complexity, introduces risk of status/board desync

**Implementation Pattern**:
```typescript
// Explicit status enum
type GameStatus = 'ACTIVE' | 'X_WON' | 'O_WON' | 'DRAW';

interface GameState {
  board: Board;
  currentTurn: PlayerSymbol;
  moveInProgress: boolean;
  status: GameStatus;           // NEW: explicit game status
  winningLine?: CellPosition[]; // NEW: optional winning line for highlighting
}

// Status transitions are deterministic
function updateGameStatus(state: GameState, lastMove: CellPosition): GameState {
  // Check win first (win takes priority over draw)
  const winResult = checkWin(state.board, lastMove);
  if (winResult) {
    return {
      ...state,
      status: winResult.winner === 'X' ? 'X_WON' : 'O_WON',
      winningLine: winResult.winningLine,
    };
  }
  
  // Check draw (board full, no winner)
  if (isBoardFull(state.board)) {
    return { ...state, status: 'DRAW' };
  }
  
  // Game continues
  return state;
}
```

---

### 3. ARIA Live Region Configuration: Polite vs. Assertive

**Question**: Should the game result announcement use `aria-live="polite"` or `aria-live="assertive"` for screen reader notifications?

**Research Findings**:

ARIA live region politeness levels:
1. **polite**: Announcement waits for user to pause (e.g., stop typing/navigating) before interrupting
2. **assertive**: Announcement interrupts immediately, even if user is interacting with other content
3. **off**: No automatic announcement (user must navigate to element)

ARIA best practices for game results:
- Use **assertive** for critical information requiring immediate attention (errors, alerts, time-sensitive updates)
- Use **polite** for informational updates that don't require immediate action
- Game-over is significant but not an emergency (game is turn-based, not real-time)

**Decision**: `aria-live="polite"` with `role="status"`

**Rationale**:
- **User experience**: Game-over is important but not urgent; no need to interrupt user mid-action
- **Best practices**: W3C ARIA guidelines recommend "polite" for status updates that don't require immediate attention
- **Context**: Turn-based game means user is likely waiting for result anyway (no parallel interaction)
- **Accessibility standards**: Screen reader users generally prefer polite announcements unless content is critical/time-sensitive
- **Spec compliance**: Feature spec states "polite or assertive" - polite is the safer, more user-friendly choice

**Alternatives Considered**:
- ❌ assertive: Too aggressive for non-critical game result, may startle users
- ❌ off: Violates accessibility requirement for automatic announcement

**Implementation Pattern**:
```html
<!-- ARIA live region for game results -->
<div 
  id="game-result-announcement" 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
  class="sr-only">
  <!-- Content updated dynamically: "Player X wins!", "Player O wins!", "It's a draw!" -->
</div>
```

```typescript
// Update ARIA live region when game ends
function announceGameResult(status: GameStatus): void {
  const announcer = document.getElementById('game-result-announcement');
  if (!announcer) return;
  
  const messages: Record<GameStatus, string> = {
    ACTIVE: '',
    X_WON: 'Player X wins!',
    O_WON: 'Player O wins!',
    DRAW: "It's a draw!",
  };
  
  announcer.textContent = messages[status];
}
```

**Additional Accessibility Considerations**:
- Use `.sr-only` class to visually hide the ARIA region while keeping it accessible to screen readers
- Set `aria-atomic="true"` to ensure the entire message is read, not just the changed portion
- Clear the announcement when starting a new game (future feature) to avoid stale announcements

---

### 4. Winning Line Highlighting Approach: Canvas Re-render vs. CSS Overlay

**Question**: Should winning marks be highlighted by re-rendering the canvas with visual distinction, or by overlaying CSS elements on top of the canvas?

**Research Findings**:

Highlighting approaches for canvas-based games:
1. **Canvas re-render**: Redraw winning marks with different style (color, glow, border) on the same canvas
2. **CSS overlay**: Position absolutely-positioned HTML elements over winning cells
3. **Separate canvas layer**: Draw highlights on a separate transparent canvas layered above main canvas
4. **SVG overlay**: Use SVG elements positioned over canvas for highlights

**Decision**: Canvas re-render with visual distinction (border/glow effect)

**Rationale**:
- **Architectural consistency**: Existing rendering uses canvas exclusively; maintains single rendering approach
- **Simplicity**: No DOM manipulation or positioning calculations; just conditional rendering logic
- **Performance**: Single canvas render per frame; no layout/paint overhead from CSS overlays
- **Constitution alignment**: Rendering remains pure projection of state (state.winningLine → highlight style)
- **Spec compliance**: Feature spec specifies "Apply a CSS class that adds a border or glow effect" - interpreting as "visual style similar to CSS effect" rather than literal CSS class (since we use canvas)

**Alternatives Considered**:
- ❌ CSS overlay: Requires precise positioning logic, DOM manipulation, breaks single-canvas architecture
- ❌ Separate canvas layer: Overkill for 3 cell highlights, adds canvas management complexity
- ❌ SVG overlay: Mixing rendering technologies, positioning complexity

**Implementation Pattern**:
```typescript
function renderBoard(ctx: CanvasRenderingContext2D, board: Board, winningLine?: CellPosition[]): void {
  const winningPositions = new Set(
    winningLine?.map(pos => `${pos.row},${pos.col}`) ?? []
  );
  
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = getCell(board, row, col);
      const isWinningCell = winningPositions.has(`${row},${col}`);
      
      if (cell.piece) {
        renderMark(ctx, row, col, cell.piece, isWinningCell);
      }
    }
  }
}

function renderMark(
  ctx: CanvasRenderingContext2D, 
  row: number, 
  col: number, 
  piece: GamePiece,
  isWinning: boolean
): void {
  // Standard rendering
  const x = col * CELL_SIZE + CELL_SIZE / 2;
  const y = row * CELL_SIZE + CELL_SIZE / 2;
  
  // Apply winning highlight style
  if (isWinning) {
    ctx.lineWidth = 6; // thicker lines
    ctx.shadowBlur = 15;
    ctx.shadowColor = piece === 'X' ? '#ff6b6b' : '#4dabf7';
  } else {
    ctx.lineWidth = 3; // normal lines
    ctx.shadowBlur = 0;
  }
  
  // Draw X or O with applied styles
  // ... existing mark rendering logic
}
```

---

### 5. Move Prevention Strategy: Validation Check vs. Event Handler Removal

**Question**: Should moves after game-over be prevented by validation in the game engine (reject invalid moves) or by removing event handlers (prevent clicks from reaching game logic)?

**Research Findings**:

Move prevention approaches:
1. **Validation-based**: Keep event handlers active, add status check to move validation logic
2. **Event handler removal**: Detach click handlers when game ends
3. **Disabled state**: Add "disabled" flag that event handler checks before delegating
4. **UI-level blocking**: Add CSS `pointer-events: none` to prevent clicks

**Decision**: Validation-based prevention in move validator

**Rationale**:
- **Architectural consistency**: Move validation already exists in `move-validator.ts`; natural extension
- **Single responsibility**: Validator already checks cell occupancy, in-progress state; status check fits same pattern
- **Testability**: Pure function validation easier to test than event handler attachment/detachment
- **Robustness**: Prevents moves from any source (click, keyboard, programmatic), not just mouse events
- **Constitution alignment**: Game logic (status validation) stays in engine, UI layer remains thin

**Alternatives Considered**:
- ❌ Event handler removal: Tightly couples game state to DOM, harder to test, error-prone (must remember to re-attach for new game)
- ❌ Disabled flag: Redundant with status field (status !== 'ACTIVE' is the disabled state)
- ❌ UI-level blocking: Only prevents mouse clicks, doesn't prevent programmatic moves, violates logic/UI separation

**Implementation Pattern**:
```typescript
// Extend existing move validation
function validateMove(state: GameState, position: CellPosition): MoveResult {
  // NEW: Check game status first
  if (state.status !== 'ACTIVE') {
    return { 
      success: false, 
      reason: 'game-over' // NEW failure reason
    };
  }
  
  // Existing validations
  if (state.moveInProgress) {
    return { success: false, reason: 'move-in-progress' };
  }
  
  if (!isEmptyCell(state.board, position)) {
    return { success: false, reason: 'cell-occupied' };
  }
  
  return { success: true };
}
```

---

## Technology Stack Decisions

### Core Technologies (Unchanged from Previous Features)
- **Language**: TypeScript (strict mode, ES2020+)
- **Runtime**: Browser (modern browsers with Canvas + ARIA support)
- **Rendering**: HTML5 Canvas API (extended with winning line highlighting)
- **Testing**: Vitest with jsdom (for ARIA live region testing)
- **Build**: Vite

### New Technology Considerations

**ARIA Support**:
- **Decision**: Use native ARIA attributes (`aria-live`, `role="status"`, `aria-atomic`)
- **Rationale**: Standard accessibility approach, no library needed, works with all screen readers

**Canvas Effects (Glow/Shadow)**:
- **Decision**: Use Canvas 2D context shadow properties (`shadowBlur`, `shadowColor`)
- **Rationale**: Native canvas feature, hardware-accelerated, no external libraries

---

## Best Practices Applied

### Win Detection Best Practices
1. **Optimize for common case**: Check only relevant lines (3-5 vs. 8)
2. **Fail fast**: Return immediately on first win found
3. **Centralize patterns**: Define all win patterns as constant array
4. **Testability**: Each pattern individually testable

### Accessibility Best Practices
1. **Use semantic ARIA**: `role="status"` for game results
2. **Choose appropriate politeness**: "polite" for non-urgent updates
3. **Atomic announcements**: Ensure full message is read
4. **Complementary feedback**: Visual + auditory (ARIA) result display

### FSM Best Practices
1. **Explicit state**: No implicit checks, all states enumerable
2. **Deterministic transitions**: Same inputs always produce same outputs
3. **Single source of truth**: Status field is authoritative
4. **Immutable updates**: Pure functions returning new state

---

## Summary of Decisions

| Area | Decision | Key Rationale |
|------|----------|---------------|
| **Win checking** | Optimized (3-5 lines) | Spec requirement, 37-62% faster, adequate for 3x3 |
| **Game status** | Explicit enum field | FSM compliance, O(1) checks, single source of truth |
| **ARIA politeness** | `polite` with `role="status"` | Best practices for non-urgent updates, better UX |
| **Winning highlight** | Canvas re-render with glow | Architectural consistency, simplicity, performance |
| **Move prevention** | Validation-based | Robust, testable, consistent with existing validation |

All decisions align with constitution principles (FSM, isolated logic, test-first) and prioritize simplicity, testability, and maintainability.

