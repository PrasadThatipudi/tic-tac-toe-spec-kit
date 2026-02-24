# tic-tac-toe-spec-kit Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-20

## Active Technologies

- TypeScript (strict mode, ES2020+) + Vite ^5.0 (build tool, dev server, HMR) (001-render-dummy-board)
- Vitest ^1.0 with jsdom environment (testing framework) (002-interactive-gameplay)
- HTML5 Canvas API + Pointer Events API (interactive rendering) (002-interactive-gameplay)
- ARIA live regions for accessibility (game result announcements) (003-game-over-detection)

## Project Structure

```text
src/
├── constants/       # Centralized configuration (render + game)
│   └── game-config.ts  # WIN_PATTERNS, GameStatus, RESULT_MESSAGES
├── models/          # Data types (Board, GameState with status)
├── engine/          # Pure game logic (FSM, validation, state transitions)
│   └── win-detector.ts  # Win/draw detection (pure functions)
├── input/           # Event handlers (click mapping)
├── ui/              # DOM UI components (turn indicator, result display)
├── renderer/        # Canvas rendering (pure functions, winning line highlight)
└── main.ts          # Entry point and coordinator

tests/
├── unit/            # Unit tests for all modules (73+ test cases for win/draw)
└── setup.ts         # Test configuration (Canvas/DOM mocking)
```

## Commands

npm test && npm run lint

## Code Style

TypeScript (strict mode, ES2020+): Follow standard conventions

## Recent Changes

- 001-render-dummy-board: Added TypeScript (strict mode, ES2020+) + Vite ^5.0 (build tool, dev server, HMR)
- 002-interactive-gameplay: Added Vitest testing, interactive gameplay with FSM state management, click handling via Pointer Events API, turn indicator UI
- 003-game-over-detection: Added game-over detection with win pattern checking (8 patterns), draw detection, GameStatus FSM enum, winning line highlighting, ARIA accessibility for results

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
