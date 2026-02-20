import { Board } from "./board";
import { GRID_SIZE } from "../constants/render-config";

export function createDemoBoard(): Board {
  return {
    size: GRID_SIZE,
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
}
