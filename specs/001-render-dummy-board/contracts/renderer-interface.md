# Renderer Contract

**Feature**: 001-render-dummy-board  
**Version**: 1.0.0  
**Type**: Interface Specification

## Purpose

Define the contract for the board renderer module that draws the tic-tac-toe board to an HTML5 Canvas element. This ensures separation between game logic and rendering per Constitution Principle II.

## Interface: BoardRenderer

### Responsibility

Accepts board state and renders it to a Canvas 2D context. Pure function that does not mutate state.

### Method: `render(board: Board, context: CanvasRenderingContext2D): void`

**Description**: Draws the complete board including grid lines and game pieces to the provided canvas context.

**Parameters**:

- `board: Board` - The board state to render (see data-model.md)
- `context: CanvasRenderingContext2D` - The canvas 2D context to draw on

**Returns**: `void` (side effect: draws to canvas)

**Preconditions**:

- Canvas context must be valid and initialized
- Board must be valid (passing validation rules from data-model.md)

**Postconditions**:

- Grid structure is drawn with visible cell boundaries
- All non-null game pieces are rendered in their respective cells
- Canvas is ready for display

**Error Handling**:

- Throws `InvalidBoardError` if board structure is invalid
- Throws `InvalidContextError` if canvas context is null or invalid

### Method: `clear(context: CanvasRenderingContext2D): void`

**Description**: Clears the entire canvas to prepare for new rendering.

**Parameters**:

- `context: CanvasRenderingContext2D` - The canvas 2D context to clear

**Returns**: `void`

**Postconditions**:

- Canvas is completely cleared (blank)

## Interface: RenderConfig

### Responsibility

Provides configuration constants for rendering appearance. Created from centralized constants per Constitution Principle V.

### Properties

```typescript
interface RenderConfig {
  // Canvas dimensions
  canvasWidth: number; // Total canvas width in pixels
  canvasHeight: number; // Total canvas height in pixels

  // Grid layout
  cellSize: number; // Size of each cell in pixels (width and height)
  gridLineWidth: number; // Thickness of grid lines in pixels

  // Colors
  backgroundColor: string; // Canvas background color (e.g., '#FFFFFF')
  gridColor: string; // Grid line color (e.g., '#000000')
  xColor: string; // Color for 'X' pieces (e.g., '#FF0000')
  oColor: string; // Color for 'O' pieces (e.g., '#0000FF')

  // Piece rendering
  pieceLineWidth: number; // Thickness of X and O strokes
  piecePadding: number; // Padding inside cell for piece drawing
}
```

**Constraints**:

- `cellSize` must be positive
- `canvasWidth` should equal `cellSize * 3` for 3x3 grid
- `canvasHeight` should equal `cellSize * 3` for 3x3 grid
- All color values must be valid CSS color strings
- All numeric values must be non-negative

**Default Values** (to be defined in constants file):

```typescript
const DEFAULT_RENDER_CONFIG: RenderConfig = {
  canvasWidth: 450,
  canvasHeight: 450,
  cellSize: 150,
  gridLineWidth: 2,
  backgroundColor: "#FFFFFF",
  gridColor: "#000000",
  xColor: "#FF6B6B",
  oColor: "#4ECDC4",
  pieceLineWidth: 8,
  piecePadding: 20,
};
```

## Behavior Specifications

### Grid Rendering

**Input**: Board with size=3, RenderConfig with dimensions
**Output**: Canvas showing 3x3 grid

**Algorithm**:

1. Fill background with `backgroundColor`
2. Draw vertical lines at `x = cellSize`, `x = cellSize * 2`
3. Draw horizontal lines at `y = cellSize`, `y = cellSize * 2`
4. Line style: `gridColor`, width: `gridLineWidth`

**Expected Visual**:

```
+-----+-----+-----+
|     |     |     |
+-----+-----+-----+
|     |     |     |
+-----+-----+-----+
|     |     |     |
+-----+-----+-----+
```

### Game Piece Rendering

#### Rendering 'X'

**Input**: Cell with value='X', position (row, col)
**Output**: X drawn in cell at (row, col)

**Algorithm**:

1. Calculate cell top-left: `(col * cellSize, row * cellSize)`
2. Calculate padded regions: apply `piecePadding` from edges
3. Draw diagonal from top-left to bottom-right
4. Draw diagonal from top-right to bottom-left
5. Line style: `xColor`, width: `pieceLineWidth`, lineCap: 'round'

#### Rendering 'O'

**Input**: Cell with value='O', position (row, col)
**Output**: O drawn in cell at (row, col)

**Algorithm**:

1. Calculate cell center: `(col * cellSize + cellSize/2, row * cellSize + cellSize/2)`
2. Calculate radius: `(cellSize / 2) - piecePadding`
3. Draw circle with center and radius
4. Line style: `oColor`, width: `pieceLineWidth`

#### Empty Cell

**Input**: Cell with value=null
**Output**: No piece drawn (empty space within grid)

## Usage Example

```typescript
// Setup
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const context = canvas.getContext("2d")!;
const config = DEFAULT_RENDER_CONFIG;
const renderer = createBoardRenderer(config);

// Create demo board (see data-model.md)
const board = createDemoBoard();

// Render
renderer.clear(context);
renderer.render(board, context);

// Result: Canvas displays 3x3 grid with X's and O's
```

## Testing Contract

### Unit Tests (without browser)

```typescript
describe("BoardRenderer", () => {
  test("render() calls correct canvas methods", () => {
    const mockContext = createMockCanvasContext();
    const board = createDemoBoard();

    renderer.render(board, mockContext);

    expect(mockContext.strokeRect).toHaveBeenCalled();
    expect(mockContext.beginPath).toHaveBeenCalled();
    // Verify drawing calls without actual Canvas
  });

  test("render() throws InvalidBoardError for invalid board", () => {
    const mockContext = createMockCanvasContext();
    const invalidBoard = { cells: [], size: 0 };

    expect(() => renderer.render(invalidBoard, mockContext)).toThrow(
      InvalidBoardError,
    );
  });
});
```

### Visual Tests (manual/browser)

1. **Grid Visibility**: All 4 grid lines visible and evenly spaced
2. **X Rendering**: X pieces appear as two diagonal lines crossing in cell center
3. **O Rendering**: O pieces appear as circles centered in cells
4. **Empty Cells**: Cells with null values show only grid, no pieces

## Dependencies

- **Data Model**: Imports `Board`, `Cell`, `GamePieceValue` types
- **Constants**: Imports `RenderConfig` and default values
- **Browser API**: Uses `CanvasRenderingContext2D` (injected, not imported)

## Non-Goals

- User interaction (no click handling)
- Animation (static rendering only)
- Game logic (no move validation or win detection)
- Responsive sizing (uses fixed dimensions from config)

## Alignment with Constitution

- **Principle II (Isolation)**: Renderer is pure function consuming state, no state mutation
- **Principle III (TDD)**: All methods testable with mock Canvas context
- **Principle V (Quality)**: All magic numbers moved to RenderConfig constants
- **Testability**: Canvas dependency injected, allows mocking for unit tests
