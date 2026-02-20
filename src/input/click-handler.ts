import { GameState } from '../models/game-state';
import { CellPosition } from '../models/board';
import { processMove } from '../engine/game-engine';
import { CELL_SIZE } from '../constants/render-config';
import { GAME_CONFIG } from '../constants/game-config';

export function getCellFromCoordinates(
  x: number,
  y: number,
  cellSize: number,
  gridSize: number
): CellPosition | null {
  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);

  if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
    return { row, col };
  }

  return null;
}

export function getCanvasPosition(
  event: PointerEvent,
  canvas: HTMLCanvasElement
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

export function setupClickHandler(
  canvas: HTMLCanvasElement,
  initialState: GameState,
  onStateChange: (newState: GameState) => void
): () => void {
  let currentState = initialState;

  const handlePointerDown = (event: PointerEvent) => {
    const canvasPos = getCanvasPosition(event, canvas);
    const cellPos = getCellFromCoordinates(
      canvasPos.x,
      canvasPos.y,
      CELL_SIZE,
      GAME_CONFIG.GRID_SIZE
    );

    if (cellPos) {
      const newState = processMove(currentState, cellPos);
      if (newState !== currentState) {
        currentState = newState;
        onStateChange(newState);
      }
    }
  };

  canvas.addEventListener('pointerdown', handlePointerDown);

  // Return cleanup function
  return () => {
    canvas.removeEventListener('pointerdown', handlePointerDown);
  };
}

