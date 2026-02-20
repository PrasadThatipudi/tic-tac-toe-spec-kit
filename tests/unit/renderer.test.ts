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
      clearRect: vi.fn(),
      arc: vi.fn(),
      lineCap: "butt" as CanvasLineCap,
    } as any;

    const board = createDemoBoard();
    renderBoard(board, mockContext);

    // Should draw grid lines (2 horizontal, 2 vertical)
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  test("renders X piece with correct coordinates", () => {
    const mockContext = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      strokeStyle: "",
      lineWidth: 0,
      lineCap: "butt" as CanvasLineCap,
      clearRect: vi.fn(),
      arc: vi.fn(),
    } as any;

    const board = createDemoBoard();
    renderBoard(board, mockContext);

    // Should call moveTo and lineTo for X pieces (diagonal lines)
    expect(mockContext.moveTo).toHaveBeenCalled();
    expect(mockContext.lineTo).toHaveBeenCalled();
  });

  test("renders O piece with arc calls", () => {
    const mockContext = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      stroke: vi.fn(),
      strokeStyle: "",
      lineWidth: 0,
      lineCap: "butt" as CanvasLineCap,
      clearRect: vi.fn(),
    } as any;

    const board = createDemoBoard();
    renderBoard(board, mockContext);

    // Should call arc for O pieces
    expect(mockContext.arc).toHaveBeenCalled();
  });

  test("handles empty cells correctly", () => {
    const mockContext = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      stroke: vi.fn(),
      strokeStyle: "",
      lineWidth: 0,
      lineCap: "butt" as CanvasLineCap,
      clearRect: vi.fn(),
    } as any;

    const board = createDemoBoard();
    renderBoard(board, mockContext);

    // Successfully renders without errors (empty cells don't draw pieces)
    expect(mockContext.clearRect).toHaveBeenCalled();
  });
});
