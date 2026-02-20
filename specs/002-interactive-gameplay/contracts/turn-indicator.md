# Turn Indicator Contract

**Module**: `src/ui/turn-indicator.ts`  
**Purpose**: Manage DOM-based turn indicator display that shows current player  
**Type**: UI component module (DOM manipulation, no game logic)

## Overview

The turn indicator is a simple DOM text element that displays which player's turn it currently is. This module provides functions to create, update, and manage the turn indicator element. It operates independently of canvas rendering and game logic, following the constitution's separation of concerns.

## Public API

### createTurnIndicator()

**Description**: Creates and returns a new turn indicator DOM element with initial text.

**Signature**:
```typescript
function createTurnIndicator(initialTurn: PlayerSymbol): HTMLDivElement;
```

**Inputs**:
- `initialTurn`: The starting player ('X' or 'O')

**Outputs**:
- HTMLDivElement configured as turn indicator

**Behavior**:
1. Create new div element: `document.createElement('div')`
2. Set id: `element.id = 'turnIndicator'`
3. Set initial text: `element.textContent = formatTurnText(initialTurn)`
4. Add CSS class: `element.className = 'turn-indicator'`
5. Return element

**DOM Structure**:
```html
<div id="turnIndicator" class="turn-indicator">
  Player X's Turn
</div>
```

**Example**:
```typescript
const indicator = createTurnIndicator('X');
document.body.appendChild(indicator);
// Creates element with text "Player X's Turn"
```

**CSS Classes**:
- `.turn-indicator`: Base styling (font-size, text-align, margin, color)

---

### updateTurnIndicator()

**Description**: Updates existing turn indicator element with new current turn.

**Signature**:
```typescript
function updateTurnIndicator(
  element: HTMLElement, 
  currentTurn: PlayerSymbol
): void;
```

**Inputs**:
- `element`: DOM element to update (must have textContent property)
- `currentTurn`: The new current player ('X' or 'O')

**Outputs**:
- None (void) - mutates element in place

**Behavior**:
1. Format text: `const text = formatTurnText(currentTurn)`
2. Update element: `element.textContent = text`

**Side Effects**:
- Mutates DOM element's textContent

**Example**:
```typescript
const indicator = document.getElementById('turnIndicator');
updateTurnIndicator(indicator, 'O');
// Element now shows "Player O's Turn"
```

**Error Handling**:
- If element is null, logs warning and returns early
- Does not throw errors (graceful degradation)

---

### updateTurnIndicatorById()

**Description**: Convenience function that finds turn indicator by ID and updates it.

**Signature**:
```typescript
function updateTurnIndicatorById(currentTurn: PlayerSymbol): void;
```

**Inputs**:
- `currentTurn`: The new current player ('X' or 'O')

**Outputs**:
- None (void)

**Behavior**:
1. Find element: `document.getElementById('turnIndicator')`
2. If found, call updateTurnIndicator(element, currentTurn)
3. If not found, log warning in development mode

**Example**:
```typescript
// After state change
updateTurnIndicatorById(newState.currentTurn);
```

**Error Handling**:
- Missing element → logs warning, does not throw
- Allows game to continue even if turn indicator missing

---

## Internal Functions

### formatTurnText()

**Description**: Formats player symbol into human-readable turn text.

**Signature**:
```typescript
function formatTurnText(player: PlayerSymbol): string;
```

**Inputs**:
- `player`: Player symbol ('X' or 'O')

**Outputs**:
- Formatted string: "Player X's Turn" or "Player O's Turn"

**Algorithm**:
```typescript
return `Player ${player}'s Turn`;
```

**Example**:
```typescript
formatTurnText('X') // => "Player X's Turn"
formatTurnText('O') // => "Player O's Turn"
```

**Future Internationalization**:
- Easy to extend with i18n library: `t('turn.player', { player })`
- Current simple implementation for initial feature

---

## HTML Integration

### Required HTML Structure

**Placement**: Turn indicator should be placed above canvas in game container

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
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

**Note**: Element can be created dynamically by JavaScript or included in HTML. If included in HTML, only needs updating (not creation).

---

## CSS Styling

### Required Styles

**File**: `src/style.css`

```css
/* Game container layout */
#gameContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
}

/* Turn indicator styling */
.turn-indicator {
  font-family: Arial, sans-serif;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  color: #333;
  margin-bottom: 1rem;
  user-select: none; /* Prevent text selection */
}

/* Optional: Add transition for smooth updates */
.turn-indicator {
  transition: color 0.2s ease;
}

/* Optional: Different colors for different players */
.turn-indicator[data-player="X"] {
  color: #e63946; /* Red for X */
}

.turn-indicator[data-player="O"] {
  color: #457b9d; /* Blue for O */
}
```

**Styling Principles**:
- Simple and readable
- Consistent with board styling
- Accessible (high contrast, readable font size)
- Non-intrusive (doesn't distract from board)

---

## Dependencies

**Internal Dependencies**:
- `models/game-state.ts`: PlayerSymbol type

**External Dependencies**:
- DOM API (document.createElement, getElementById, textContent)

**No Dependencies On**:
- Game engine logic
- Canvas rendering
- Input handling

---

## Testing Strategy

### Unit Tests

**Test Categories**:

1. **Text Formatting**
   - ✅ formatTurnText('X') returns "Player X's Turn"
   - ✅ formatTurnText('O') returns "Player O's Turn"

2. **Element Creation**
   - ✅ createTurnIndicator creates div element
   - ✅ createTurnIndicator sets correct id
   - ✅ createTurnIndicator sets correct initial text
   - ✅ createTurnIndicator sets correct CSS class

3. **Element Update**
   - ✅ updateTurnIndicator changes element text
   - ✅ updateTurnIndicator handles null element gracefully
   - ✅ updateTurnIndicatorById finds element and updates text
   - ✅ updateTurnIndicatorById handles missing element gracefully

**Mock Requirements**:
- jsdom for DOM manipulation
- document.createElement mock
- document.getElementById mock

**Example Tests**:
```typescript
test('formatTurnText formats X correctly', () => {
  expect(formatTurnText('X')).toBe("Player X's Turn");
});

test('createTurnIndicator creates element with correct text', () => {
  const element = createTurnIndicator('X');
  expect(element.tagName).toBe('DIV');
  expect(element.id).toBe('turnIndicator');
  expect(element.textContent).toBe("Player X's Turn");
  expect(element.className).toBe('turn-indicator');
});

test('updateTurnIndicator changes text', () => {
  const element = document.createElement('div');
  element.textContent = "Player X's Turn";
  
  updateTurnIndicator(element, 'O');
  
  expect(element.textContent).toBe("Player O's Turn");
});

test('updateTurnIndicatorById handles missing element', () => {
  // No element with id 'turnIndicator'
  expect(() => {
    updateTurnIndicatorById('X');
  }).not.toThrow();
});
```

### Integration Tests

**Test Categories**:

1. **DOM Integration**
   - ✅ Turn indicator element rendered in document
   - ✅ Turn indicator updates when game state changes
   - ✅ Multiple updates work correctly

**Example Test**:
```typescript
test('turn indicator updates during game', () => {
  document.body.innerHTML = '<div id="turnIndicator"></div>';
  
  updateTurnIndicatorById('X');
  expect(document.getElementById('turnIndicator')?.textContent).toBe("Player X's Turn");
  
  updateTurnIndicatorById('O');
  expect(document.getElementById('turnIndicator')?.textContent).toBe("Player O's Turn");
});
```

---

## Usage in Main Game Loop

### Initialization

```typescript
// main.ts
import { createTurnIndicator, updateTurnIndicatorById } from './ui/turn-indicator';
import { createInitialGameState } from './engine/game-engine';

const gameState = createInitialGameState();

// Option 1: Create indicator dynamically
const indicator = createTurnIndicator(gameState.currentTurn);
document.body.appendChild(indicator);

// Option 2: Update existing indicator from HTML
updateTurnIndicatorById(gameState.currentTurn);
```

### State Change Handler

```typescript
function handleGameStateChange(newState: GameState): void {
  // Update board rendering
  renderBoard(newState.board, context);
  
  // Update turn indicator
  updateTurnIndicatorById(newState.currentTurn);
}
```

---

## Accessibility Considerations

### Screen Reader Support

**ARIA Labels**:
```html
<div 
  id="turnIndicator" 
  class="turn-indicator"
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  Player X's Turn
</div>
```

**Attributes**:
- `role="status"`: Indicates informational status message
- `aria-live="polite"`: Announces changes to screen readers (non-interruptive)
- `aria-atomic="true"`: Reads entire content on change

**Implementation**:
```typescript
function createTurnIndicator(initialTurn: PlayerSymbol): HTMLDivElement {
  const element = document.createElement('div');
  element.id = 'turnIndicator';
  element.className = 'turn-indicator';
  element.textContent = formatTurnText(initialTurn);
  
  // Accessibility attributes
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', 'polite');
  element.setAttribute('aria-atomic', 'true');
  
  return element;
}
```

---

## Performance Requirements

- **Text update**: <0.1ms (simple DOM textContent change)
- **No reflows**: Text update should not trigger layout recalculation
- **No memory leaks**: No event listeners to clean up (passive display only)

---

## Future Extensions

**Phase 3 (Win Detection)**:
- Show "Player X Wins!" or "Player O Wins!" message
- Change styling to highlight winner

**Phase 4 (Player Names)**:
- Support custom names: "Alice's Turn" instead of "Player X's Turn"
- Accept optional names parameter

**Phase 5 (Internationalization)**:
- Support multiple languages
- Use i18n library for translations

**Phase 6 (Animations)**:
- Add fade/slide animations on turn change
- Pulse effect to draw attention

---

## Contract Validation Checklist

- ✅ All public functions have clear signatures
- ✅ DOM manipulation isolated to this module
- ✅ No game logic dependencies
- ✅ Accessibility considerations documented
- ✅ Test strategy defined
- ✅ CSS styling specified
- ✅ HTML integration documented
- ✅ Performance requirements specified
- ✅ Future extensions planned

