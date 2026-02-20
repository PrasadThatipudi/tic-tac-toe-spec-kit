import { createDemoBoard } from "./models/demo-board";
import { renderBoard } from "./renderer/board-renderer";
import "./style.css";

// Get canvas and context
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;

if (!canvas) {
  throw new Error("Canvas element not found");
}

const context = canvas.getContext("2d");

if (!context) {
  throw new Error(
    "Failed to get canvas context. Your browser may not support Canvas API.",
  );
}

// Create and render demo board
const board = createDemoBoard();
renderBoard(board, context);

console.log("Dummy board rendered successfully!");
