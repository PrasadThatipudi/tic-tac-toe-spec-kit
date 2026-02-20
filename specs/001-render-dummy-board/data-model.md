# Data Model: Render Dummy Board

**Feature**: 001-render-dummy-board  
**Date**: 2026-02-20  
**Status**: Design Phase

## Purpose

Define the data structures and state models for rendering a tic-tac-toe board with optional hard-coded game pieces.

## Core Entities

### Board

The complete game board representing the 3x3 grid structure.

**Properties**:

- `cells`: Array of 9 Cell entities, ordered row-by-row (index 0-2: row 1, 3-5: row 2, 6-8: row 3)
- `size`: Grid dimension (constant = 3 for tic-tac-toe)

**State Rules**:

- Board is immutable once created for rendering
- Cell array length MUST always equal size² (9 for 3x3 grid)
- Cells indexed by formula: `index = row * size + column` (both 0-based)

**Example State**:

```typescript
{
  cells: [
    { value: 'X', position: { row: 0, col: 0 } },
    { value: null, position: { row: 0, col: 1 } },
    { value: 'O', position: { row: 0, col: 2 } },
    // ... 6 more cells
  ],
  size: 3
}
```

### Cell

An individual space within the board grid.

**Properties**:

- `value`: GamePieceValue (can be 'X', 'O', or null for empty)
- `position`: CellPosition { row: number, col: number } (0-based indices)

**State Rules**:

- Position coordinates MUST be within bounds [0, size-1]
- Value is nullable (null = empty cell)
- Cell position is immutable (cells don't move)

**Validation**:

- Row index: 0 ≤ row < 3
- Column index: 0 ≤ col < 3
- Value: must be 'X', 'O', or null

### GamePiece

A visual marker (X or O) that can appear within a cell.

**Type Definition**:

- GamePieceValue = 'X' | 'O' | null

**Display Properties** (for rendering):

- Symbol representation ('X' or 'O')
- Visual appearance is handled by renderer (not part of data model)

## Type Definitions

```typescript
type GamePieceValue = "X" | "O" | null;

interface CellPosition {
  row: number; // 0-based row index [0-2]
  col: number; // 0-based column index [0-2]
}

interface Cell {
  value: GamePieceValue;
  position: CellPosition;
}

interface Board {
  cells: Cell[]; // Length must equal size²
  size: number; // Grid dimension (3 for tic-tac-toe)
}
```

## State Transitions

For this initial feature (dummy board rendering), there are no state transitions - the board is static/read-only.

**Initial State**: Board with hard-coded cell values (e.g., some X's and O's for demonstration)

**Future Features**: Will add state transitions for:

- Player moves (cell value changes from null to 'X' or 'O')
- Game reset (all cells return to null)
- Turn management (alternating between players)

## Relationships

```
Board (1) ──── contains ──── (9) Cell
Cell (1) ──── has value ──── (0..1) GamePiece
```

- One Board contains exactly 9 Cells
- Each Cell has exactly one position
- Each Cell has zero or one GamePiece (null = empty)

## Data Validation Rules

1. **Board Integrity**:
   - Cell array length === size² (must be 9)
   - All cell positions unique (no duplicates)
   - All positions within grid bounds

2. **Cell Validity**:
   - Position coordinates non-negative
   - Position coordinates < size
   - Value is one of: 'X', 'O', or null

3. **Position Uniqueness**:
   - No two cells can have same (row, col) coordinates

## Hard-Coded Demo Data

For the initial dummy board implementation, use this example state:

```typescript
const DEMO_BOARD: Board = {
  size: 3,
  cells: [
    { value: "X", position: { row: 0, col: 0 } }, // Top-left
    { value: null, position: { row: 0, col: 1 } }, // Top-center (empty)
    { value: "O", position: { row: 0, col: 2 } }, // Top-right
    { value: null, position: { row: 1, col: 0 } }, // Middle-left (empty)
    { value: "X", position: { row: 1, col: 1 } }, // Center
    { value: null, position: { row: 1, col: 2 } }, // Middle-right (empty)
    { value: "O", position: { row: 2, col: 0 } }, // Bottom-left
    { value: null, position: { row: 2, col: 1 } }, // Bottom-center (empty)
    { value: "X", position: { row: 2, col: 2 } }, // Bottom-right
  ],
};
```

This creates a visually interesting board with a mix of X's, O's, and empty cells for demonstration purposes.

## Implementation Notes

1. **Immutability**: All data structures should be treated as immutable for this read-only rendering feature
2. **Indexing**: Use position-to-index formula: `index = row * size + col` for array access
3. **Validation**: Implement validation functions to ensure board state integrity before rendering
4. **Type Safety**: TypeScript strict mode will enforce type constraints at compile time

## Alignment with Constitution

- **Principle I (FSM)**: Board state is explicitly defined with clear data structure (even though static for now)
- **Principle II (Isolation)**: Data model is separate from rendering - renderer consumes Board interface
- **Principle IV (Determinism)**: All state properties and validation rules explicitly specified
- **Principle V (Quality)**: No magic numbers in data model; size is explicit property
