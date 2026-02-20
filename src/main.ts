import { createInitialGameState } from "./engine/game-engine";
import { setupClickHandler } from "./input/click-handler";
import { createTurnIndicator, updateTurnIndicator } from "./ui/turn-indicator";
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

// Get turn indicator container
const turnIndicatorContainer = document.getElementById("turnIndicatorContainer");

if (!turnIndicatorContainer) {
  throw new Error("Turn indicator container not found");
}

// Initialize game state
const initialState = createInitialGameState();

// Create and mount turn indicator
const turnIndicator = createTurnIndicator(initialState.currentTurn);
turnIndicatorContainer.appendChild(turnIndicator);

// Render initial board
renderBoard(initialState.board, context);

// Setup click handler with state change callback
setupClickHandler(canvas, initialState, (newState) => {
  // Update board rendering
  renderBoard(newState.board, context);

  // Update turn indicator
  updateTurnIndicator(turnIndicator, newState.currentTurn);
});

console.log("Interactive gameplay initialized!");
