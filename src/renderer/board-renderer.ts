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
    if (cell.value === "X") {
      drawXPiece(cell.position, context);
    } else if (cell.value === "O") {
      drawOPiece(cell.position, context);
    }
    // null values (empty cells) don't draw anything
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

function drawXPiece(
  position: { row: number; col: number },
  context: CanvasRenderingContext2D,
): void {
  const x = position.col * CELL_SIZE;
  const y = position.row * CELL_SIZE;
  const padding = RENDER_STYLE.piecePadding;

  context.strokeStyle = COLORS.xPiece;
  context.lineWidth = RENDER_STYLE.pieceLineWidth;
  context.lineCap = "round";

  context.beginPath();
  // Diagonal from top-left to bottom-right
  context.moveTo(x + padding, y + padding);
  context.lineTo(x + CELL_SIZE - padding, y + CELL_SIZE - padding);
  // Diagonal from top-right to bottom-left
  context.moveTo(x + CELL_SIZE - padding, y + padding);
  context.lineTo(x + padding, y + CELL_SIZE - padding);
  context.stroke();
}

function drawOPiece(
  position: { row: number; col: number },
  context: CanvasRenderingContext2D,
): void {
  const x = position.col * CELL_SIZE;
  const y = position.row * CELL_SIZE;
  const padding = RENDER_STYLE.piecePadding;

  context.strokeStyle = COLORS.oPiece;
  context.lineWidth = RENDER_STYLE.pieceLineWidth;

  const centerX = x + CELL_SIZE / 2;
  const centerY = y + CELL_SIZE / 2;
  const radius = CELL_SIZE / 2 - padding;

  context.beginPath();
  context.arc(centerX, centerY, radius, 0, Math.PI * 2);
  context.stroke();
}

export function clear(context: CanvasRenderingContext2D): void {
  const canvas = context.canvas;
  context.clearRect(0, 0, canvas.width, canvas.height);
}
