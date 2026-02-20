# Quick Start: Render Dummy Board

**Feature**: 001-render-dummy-board  
**Date**: 2026-02-20  
**Audience**: Developers implementing this feature

## What We're Building

A 3x3 tic-tac-toe board renderer that displays a static grid with hard-coded X's and O's on an HTML5 Canvas. This is the foundational visual element for the game.

## 5-Minute Overview

### User Perspective

- Open app → see 3x3 grid with some X's and O's displayed
- Board is static/non-interactive (just visual demo)
- Should look clean and professional on modern browsers

### Technical Approach

- TypeScript + Vite for fast development
- HTML5 Canvas for rendering
- Separated data model (Board state) from rendering logic
- Test-first development with Vitest

## Project Setup

### Prerequisites

- Node.js 18+ installed
- Modern browser (Chrome, Firefox, Safari, Edge)
- Code editor with TypeScript support

### Initial Setup (First Time)

```bash
# 1. Initialize project with Vite
npm create vite@latest . -- --template vanilla-ts

# 2. Install dev dependencies
npm install -D vitest jsdom @vitest/ui

# 3. Install project
npm install

# 4. Run dev server
npm run dev
```

### Configuration Files

**vite.config.ts** (add test configuration):

```typescript
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup.ts",
  },
});
```

**tests/setup.ts** (Canvas mocking):

```typescript
import { vi } from "vitest";

// Mock Canvas API for unit tests
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  strokeRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  arc: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
})) as any;
```

**package.json** (add test scripts):

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run"
  }
}
```

## File Structure

Create these directories and files:

```
src/
├── constants/
│   └── render-config.ts      # All visual constants (sizes, colors)
├── models/
│   ├── board.ts               # Board, Cell interfaces
│   └── demo-board.ts          # Hard-coded demo data
├── renderer/
│   ├── board-renderer.ts      # Main rendering logic
│   └── canvas-setup.ts        # Canvas initialization
├── main.ts                    # Entry point
└── style.css                  # Minimal layout styles

tests/
└── unit/
    ├── board.test.ts          # Board model tests
    └── renderer.test.ts       # Renderer tests

public/
└── index.html                 # HTML with canvas element
```

## Implementation Workflow (TDD)

### Step 1: Define Constants (15 min)

**File**: `src/constants/render-config.ts`

```typescript
export const GRID_SIZE = 3;
export const CELL_SIZE = 150;
export const CANVAS_WIDTH = CELL_SIZE * GRID_SIZE;
export const CANVAS_HEIGHT = CELL_SIZE * GRID_SIZE;

export const COLORS = {
  background: "#FFFFFF",
  grid: "#333333",
  xPiece: "#FF6B6B",
  oPiece: "#4ECDC4",
};

export const RENDER_STYLE = {
  gridLineWidth: 2,
  pieceLineWidth: 8,
  piecePadding: 20,
};
```

**No test needed** - constants are declarative configuration.

### Step 2: Define Data Model (20 min)

**File**: `src/models/board.ts`

```typescript
export type GamePieceValue = "X" | "O" | null;

export interface CellPosition {
  row: number;
  col: number;
}

export interface Cell {
  value: GamePieceValue;
  position: CellPosition;
}

export interface Board {
  cells: Cell[];
  size: number;
}

// Validation helper
export function isValidBoard(board: Board): boolean {
  return (
    board.cells.length === board.size * board.size &&
    board.cells.every(
      (cell) =>
        cell.position.row >= 0 &&
        cell.position.row < board.size &&
        cell.position.col >= 0 &&
        cell.position.col < board.size,
    )
  );
}
```

**Test first** (`tests/unit/board.test.ts`):

```typescript
import { describe, test, expect } from "vitest";
import { isValidBoard, Board } from "../../src/models/board";

describe("Board validation", () => {
  test("valid 3x3 board passes validation", () => {
    const board: Board = {
      size: 3,
      cells: Array.from({ length: 9 }, (_, i) => ({
        value: null,
        position: { row: Math.floor(i / 3), col: i % 3 },
      })),
    };

    expect(isValidBoard(board)).toBe(true);
  });

  test("board with wrong cell count fails validation", () => {
    const board: Board = { size: 3, cells: [] };
    expect(isValidBoard(board)).toBe(false);
  });
});
```

**Run**: `npm test` → RED → Implement `isValidBoard` → GREEN

### Step 3: Create Demo Board (10 min)

**File**: `src/models/demo-board.ts`

```typescript
import { Board } from "./board";
import { GRID_SIZE } from "../constants/render-config";

export function createDemoBoard(): Board {
  return {
    size: GRID_SIZE,
    cells: [
      { value: "X", position: { row: 0, col: 0 } },
      { value: null, position: { row: 0, col: 1 } },
      { value: "O", position: { row: 0, col: 2 } },
      { value: null, position: { row: 1, col: 0 } },
      { value: "X", position: { row: 1, col: 1 } },
      { value: null, position: { row: 1, col: 2 } },
      { value: "O", position: { row: 2, col: 0 } },
      { value: null, position: { row: 2, col: 1 } },
      { value: "X", position: { row: 2, col: 2 } },
    ],
  };
}
```

**Test** (add to `board.test.ts`):

```typescript
import { createDemoBoard } from "../../src/models/demo-board";

test("demo board is valid", () => {
  const board = createDemoBoard();
  expect(isValidBoard(board)).toBe(true);
  expect(board.cells).toHaveLength(9);
});
```

### Step 4: Implement Renderer (45 min)

**Test first** (`tests/unit/renderer.test.ts`):

```typescript
import { describe, test, expect, vi } from "vitest";
import { renderBoard } from "../../src/renderer/board-renderer";
import { createDemoBoard } from "../../src/models/demo-board";

describe("BoardRenderer", () => {
  test("renders grid lines", () => {
    const mockContext = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      strokeStyle: "",
      lineWidth: 0,
    } as any;

    const board = createDemoBoard();
    renderBoard(board, mockContext);

    // Should draw 4 grid lines (2 horizontal, 2 vertical)
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.stroke).toHaveBeenCalled();
  });
});
```

**File**: `src/renderer/board-renderer.ts`

```typescript
import { Board } from "../models/board";
import { CELL_SIZE, COLORS, RENDER_STYLE } from "../constants/render-config";

export function renderBoard(
  board: Board,
  context: CanvasRenderingContext2D,
): void {
  // Clear canvas
  context.clearRect(0, 0, CELL_SIZE * board.size, CELL_SIZE * board.size);

  // Draw grid
  drawGrid(board.size, context);

  // Draw pieces
  board.cells.forEach((cell) => {
    if (cell.value) {
      drawPiece(cell.value, cell.position, context);
    }
  });
}

function drawGrid(size: number, context: CanvasRenderingContext2D): void {
  context.strokeStyle = COLORS.grid;
  context.lineWidth = RENDER_STYLE.gridLineWidth;
  context.beginPath();

  // Vertical lines
  for (let i = 1; i < size; i++) {
    const x = i * CELL_SIZE;
    context.moveTo(x, 0);
    context.lineTo(x, CELL_SIZE * size);
  }

  // Horizontal lines
  for (let i = 1; i < size; i++) {
    const y = i * CELL_SIZE;
    context.moveTo(0, y);
    context.lineTo(CELL_SIZE * size, y);
  }

  context.stroke();
}

function drawPiece(
  piece: "X" | "O",
  position: { row: number; col: number },
  context: CanvasRenderingContext2D,
): void {
  const x = position.col * CELL_SIZE;
  const y = position.row * CELL_SIZE;
  const padding = RENDER_STYLE.piecePadding;

  context.lineWidth = RENDER_STYLE.pieceLineWidth;
  context.lineCap = "round";

  if (piece === "X") {
    context.strokeStyle = COLORS.xPiece;
    context.beginPath();
    context.moveTo(x + padding, y + padding);
    context.lineTo(x + CELL_SIZE - padding, y + CELL_SIZE - padding);
    context.moveTo(x + CELL_SIZE - padding, y + padding);
    context.lineTo(x + padding, y + CELL_SIZE - padding);
    context.stroke();
  } else {
    context.strokeStyle = COLORS.oPiece;
    const centerX = x + CELL_SIZE / 2;
    const centerY = y + CELL_SIZE / 2;
    const radius = CELL_SIZE / 2 - padding;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.stroke();
  }
}
```

**Run**: `npm test` → GREEN ✅

### Step 5: Wire Up Main Entry Point (10 min)

**File**: `public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tic-Tac-Toe</title>
  </head>
  <body>
    <div id="app">
      <h1>Tic-Tac-Toe</h1>
      <canvas id="gameCanvas" width="450" height="450"></canvas>
    </div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

**File**: `src/main.ts`

```typescript
import { createDemoBoard } from "./models/demo-board";
import { renderBoard } from "./renderer/board-renderer";
import "./style.css";

// Get canvas and context
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const context = canvas.getContext("2d");

if (!context) {
  throw new Error("Failed to get canvas context");
}

// Create and render demo board
const board = createDemoBoard();
renderBoard(board, context);

console.log("Dummy board rendered successfully!");
```

**File**: `src/style.css`

```css
body {
  margin: 0;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f5f5;
}

#app {
  text-align: center;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}

canvas {
  border: 2px solid #333;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### Step 6: Run and Verify (5 min)

```bash
# Start dev server
npm run dev

# Open browser to http://localhost:5173
# You should see: 3x3 grid with X's and O's displayed
```

## Development Commands

```bash
npm run dev          # Start dev server with HMR
npm test             # Run tests in watch mode
npm test:ui          # Run tests with visual UI
npm test:run         # Run tests once (CI mode)
npm run build        # Build for production
npm run preview      # Preview production build
```

## Success Criteria Checklist

After implementation, verify:

- ✅ 3x3 grid is visible with clear cell boundaries
- ✅ Hard-coded X's and O's appear in correct cells
- ✅ Board renders within 1 second of page load
- ✅ All 9 cells are distinguishable
- ✅ Board maintains square proportions
- ✅ Works on standard screen sizes (tested at 1920x1080 and 375x667)
- ✅ All tests pass (`npm test:run`)
- ✅ No magic numbers in renderer code (all constants centralized)
- ✅ Renderer is isolated from data model (pure function)

## Common Issues & Solutions

### Canvas is blank

- Check browser console for errors
- Verify canvas element has correct ID
- Ensure context is not null
- Check that `renderBoard` is called after DOM loads

### Grid lines not visible

- Verify `gridLineWidth` is not 0
- Check `gridColor` contrasts with background
- Ensure Canvas dimensions match expected size

### Tests fail with Canvas errors

- Verify `tests/setup.ts` is configured in `vite.config.ts`
- Check Canvas mocking includes all methods used
- Ensure test environment is 'jsdom'

### HMR not working

- Restart Vite dev server
- Clear browser cache
- Check that file is saved properly

## Next Steps

After completing this feature:

1. **User Interaction**: Add click handlers to detect cell selection
2. **Game Logic**: Implement move validation and turn management
3. **Win Detection**: Add algorithm to detect three-in-a-row
4. **Reset**: Add button to clear board and start new game

## Resources

- [Spec](./spec.md) - Full feature specification
- [Data Model](./data-model.md) - Detailed data structure design
- [Renderer Contract](./contracts/renderer-interface.md) - Interface specification
- [Research](./research.md) - Technology decisions and rationale
- [Constitution](../../.specify/memory/constitution.md) - Project principles

## Time Estimate

- **Total**: ~2 hours for complete feature (including tests)
- Setup: 15 min
- Data model: 30 min (with tests)
- Renderer: 45 min (with tests)
- Integration: 30 min (wiring + visual verification)
