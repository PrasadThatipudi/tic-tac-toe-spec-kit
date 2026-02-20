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
  strokeStyle: "",
  lineWidth: 0,
  lineCap: "butt" as CanvasLineCap,
})) as any;
