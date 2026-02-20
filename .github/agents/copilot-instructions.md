# tic-tac-toe-spec-kit Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-20

## Active Technologies

- TypeScript (strict mode, ES2020+) + Vite ^5.0 (build tool, dev server, HMR) (001-render-dummy-board)
- Vitest ^1.0 with jsdom environment (testing framework) (002-interactive-gameplay)
- HTML5 Canvas API + Pointer Events API (interactive rendering) (002-interactive-gameplay)

## Project Structure

```text
src/
├── constants/       # Centralized configuration (render + game)
├── models/          # Data types (Board, GameState)
├── engine/          # Pure game logic (FSM, validation, state transitions)
├── input/           # Event handlers (click mapping)
├── ui/              # DOM UI components (turn indicator)
├── renderer/        # Canvas rendering (pure functions)
└── main.ts          # Entry point and coordinator

tests/
├── unit/            # Unit tests for all modules
└── setup.ts         # Test configuration (Canvas/DOM mocking)
```

## Commands

npm test && npm run lint

## Code Style

TypeScript (strict mode, ES2020+): Follow standard conventions

## Recent Changes

- 001-render-dummy-board: Added TypeScript (strict mode, ES2020+) + Vite ^5.0 (build tool, dev server, HMR)
- 002-interactive-gameplay: Added Vitest testing, interactive gameplay with FSM state management, click handling via Pointer Events API, turn indicator UI

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
