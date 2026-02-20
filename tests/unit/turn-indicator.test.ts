import { describe, test, expect, beforeEach } from 'vitest';
import {
  createTurnIndicator,
  updateTurnIndicator,
  formatTurnText
} from '../../src/ui/turn-indicator';

describe('formatTurnText', () => {
  test('formats X correctly', () => {
    expect(formatTurnText('X')).toBe("Player X's Turn");
  });

  test('formats O correctly', () => {
    expect(formatTurnText('O')).toBe("Player O's Turn");
  });
});

describe('createTurnIndicator', () => {
  test('creates div element', () => {
    const element = createTurnIndicator('X');
    expect(element.tagName).toBe('DIV');
  });

  test('sets correct id', () => {
    const element = createTurnIndicator('X');
    expect(element.id).toBe('turnIndicator');
  });

  test('sets correct initial text', () => {
    const element = createTurnIndicator('X');
    expect(element.textContent).toBe("Player X's Turn");
  });

  test('sets correct class name', () => {
    const element = createTurnIndicator('X');
    expect(element.className).toBe('turn-indicator');
  });

  test('sets correct ARIA attributes', () => {
    const element = createTurnIndicator('X');
    expect(element.getAttribute('role')).toBe('status');
    expect(element.getAttribute('aria-live')).toBe('polite');
    expect(element.getAttribute('aria-atomic')).toBe('true');
  });

  test('works with O as initial turn', () => {
    const element = createTurnIndicator('O');
    expect(element.textContent).toBe("Player O's Turn");
  });
});

describe('updateTurnIndicator', () => {
  let element: HTMLDivElement;

  beforeEach(() => {
    element = document.createElement('div');
  });

  test('updates text content to X', () => {
    updateTurnIndicator(element, 'X');
    expect(element.textContent).toBe("Player X's Turn");
  });

  test('updates text content to O', () => {
    updateTurnIndicator(element, 'O');
    expect(element.textContent).toBe("Player O's Turn");
  });

  test('updates from X to O', () => {
    element.textContent = "Player X's Turn";
    updateTurnIndicator(element, 'O');
    expect(element.textContent).toBe("Player O's Turn");
  });

  test('updates from O to X', () => {
    element.textContent = "Player O's Turn";
    updateTurnIndicator(element, 'X');
    expect(element.textContent).toBe("Player X's Turn");
  });
});

