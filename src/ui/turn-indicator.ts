import { PlayerSymbol } from '../constants/game-config';

export function formatTurnText(player: PlayerSymbol): string {
  return `Player ${player}'s Turn`;
}

export function createTurnIndicator(initialTurn: PlayerSymbol): HTMLDivElement {
  const element = document.createElement('div');
  element.id = 'turnIndicator';
  element.className = 'turn-indicator';
  element.textContent = formatTurnText(initialTurn);

  // Accessibility
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', 'polite');
  element.setAttribute('aria-atomic', 'true');

  return element;
}

export function updateTurnIndicator(element: HTMLDivElement, player: PlayerSymbol): void {
  element.textContent = formatTurnText(player);
}

