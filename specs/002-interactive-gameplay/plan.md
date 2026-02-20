# Implementation Plan: Interactive Gameplay

**Branch**: `002-interactive-gameplay` | **Date**: 2026-02-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-interactive-gameplay/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Enable interactive tic-tac-toe gameplay by allowing players to click on empty cells to place their symbols (X or O), with automatic turn rotation between players. The system manages centralized game state (board array and current turn), handles user input through canvas click events, validates moves, and provides visual turn indicators. This feature builds upon the existing board rendering infrastructure from feature 001 and introduces the first layer of game logic and user interaction.

## Technical Context

**Language/Version**: TypeScript (strict mode, ES2020+)  
**Primary Dependencies**: Vite ^5.0 (build tool, dev server, HMR)  
**Storage**: N/A (in-memory game state, no persistence)  
**Testing**: Vitest ^1.0 with jsdom environment  
**Target Platform**: Browser (modern browsers supporting Canvas API, HTML5, pointer events)
**Project Type**: Single project (browser-based game)  
**Performance Goals**: <100ms move processing, 60 fps rendering, <50ms click response time  
**Constraints**: Game logic isolated from rendering per constitution, FSM pattern for game state, test-first development, Canvas-only rendering, click debouncing (first click only until processing completes)  
**Scale/Scope**: Single-device hot-seat mode, 2 players, 3x3 grid, 9 moves maximum per game

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Initial Check (Pre-Phase 0): ✅ PASSED

### Principle I: Finite State Machine Architecture

- **Status**: ✅ PASS
- **Evaluation**: Game state must be explicitly defined with enumerable values. Current turn ('X' | 'O') is a discrete state property. Board state (empty/X/O for each cell) is already explicit. State transitions (move placement, turn switching) must be deterministic and testable.
- **Requirement**: Define GameState type with board and currentTurn properties. Create pure state transition functions: placeMove(state, position) → newState, switchTurn(state) → newState.
- **Post-Design Verification**: ✅ GameState interface defined in data-model.md with explicit types (board: Board, currentTurn: PlayerSymbol, moveInProgress: boolean). State transitions documented with preconditions/postconditions. Game engine contract specifies pure functions: processMove(), switchTurn(). All state values are enumerable and deterministic.

### Principle II: Isolated Game Loop & Rendering

- **Status**: ✅ PASS
- **Evaluation**: Game logic (state updates, move validation) must remain separate from rendering and input handling. Click handlers must delegate to game engine for validation and state updates. Rendering must remain a pure projection of state.
- **Requirement**: Create game engine module with pure functions for move validation and state transitions. Input handler translates canvas clicks to cell positions and delegates to engine. Renderer remains unchanged as pure function.
- **Post-Design Verification**: ✅ Complete separation achieved: engine/ contains pure game logic with zero DOM/Canvas dependencies. input/ handles event translation and delegates to engine. ui/ manages DOM-only turn indicator. renderer/ remains unchanged. Click handler contract explicitly states "NO knowledge of game logic". Game engine contract specifies "NO side effects, fully testable in isolation".

### Principle III: Test-First Development (NON-NEGOTIABLE)

- **Status**: ✅ PASS
- **Evaluation**: All game logic (move validation, state transitions, turn switching, click processing) must be unit tested before implementation using TDD red-green-refactor cycle.
- **Requirement**: Write tests first for: 1) GameState structure, 2) move validation (empty cell check), 3) state transitions, 4) turn switching, 5) click coordinate to cell position mapping, 6) click debouncing logic. Target 100% coverage of game logic.
- **Post-Design Verification**: ✅ Quickstart.md provides comprehensive TDD workflow with Red-Green-Refactor cycle for all modules. Game engine contract includes 22 test cases covering initialization, validation, processing, turn switching, and edge cases. Click handler contract includes 8 test cases for coordinate mapping. Turn indicator contract includes 8 test cases for UI logic. All tests specified BEFORE implementation code.

### Principle IV: Deterministic Specifications

- **Status**: ✅ PASS
- **Evaluation**: Feature spec clearly defines inputs (click events on cells), outputs (symbol placement, turn indicator update), state transitions (place move → switch turn), edge cases (occupied cells, rapid clicks, board full), and failure cases (invalid clicks ignored).
- **Requirement**: Phase 1 contracts must specify exact click handling flow, move validation rules, state transition preconditions/postconditions, and UI feedback behavior.
- **Post-Design Verification**: ✅ All contracts specify complete behavior: Game engine contract defines 4 MoveFailureReason types with exact validation rules. Click handler contract documents complete coordinate transformation pipeline with boundary cases. State transitions documented with preconditions, postconditions, and example flows. Data model includes validation functions (isValidMove, validateMove) with deterministic logic. All edge cases from spec mapped to contract requirements.

### Principle V: Code Quality & Constants Management

- **Status**: ✅ PASS
- **Evaluation**: All game-related constants (player symbols, initial turn, processing delays) must be centralized and named. No magic strings or numbers in game logic.
- **Requirement**: Create game-config.ts with constants: INITIAL_TURN, PLAYERS array, MOVE_PROCESSING_TIMEOUT. Reuse existing GRID_SIZE from render-config. Clear separation between game engine (generic) and game rules (tic-tac-toe specific).
- **Post-Design Verification**: ✅ Data model specifies game-config.ts with GAME_CONFIG object (INITIAL_TURN, PLAYERS, GRID_SIZE) and MOVE_VALIDATION object (all failure reason constants). All contracts reference named constants (CELL_SIZE, GRID_SIZE, INITIAL_TURN) instead of magic numbers/strings. Clear separation: game-config.ts for game logic constants, render-config.ts for visual constants (unchanged from feature 001).

### Post-Phase 1 Re-Check: ✅ ALL GATES PASSED

All constitution principles satisfied in design phase:

- ✅ Explicit FSM with GameState type and pure state transition functions
- ✅ Complete isolation: engine (pure logic), input (event adapter), ui (DOM only), renderer (pure canvas)
- ✅ Comprehensive TDD strategy with 38+ test cases specified before implementation
- ✅ All behaviors deterministic with complete contracts (preconditions, postconditions, edge cases)
- ✅ All constants centralized in game-config.ts and render-config.ts (no magic values)

**Overall Status**: ✅ READY FOR IMPLEMENTATION (Phase 2 - task breakdown via /speckit.tasks)

## Project Structure

### Documentation (this feature)

```text
specs/002-interactive-gameplay/
├── spec.md              # Feature specification (✅ Complete)
├── plan.md              # This file - implementation plan (✅ Complete)
├── research.md          # Technology decisions (✅ Complete - Phase 0)
├── data-model.md        # Data structure design (✅ Complete - Phase 1)
├── quickstart.md        # Developer guide (✅ Complete - Phase 1)
├── contracts/           # Interface specifications (✅ Complete - Phase 1)
│   ├── game-engine.md   # Game logic contract (✅ Complete)
│   ├── click-handler.md # Input handling contract (✅ Complete)
│   └── turn-indicator.md # UI component contract (✅ Complete)
├── tasks.md             # Task breakdown (⏳ Phase 2 - run /speckit.tasks)
└── checklists/          # Validation checklists (✅ Complete)
```

### Source Code (repository root)

```text
src/
├── constants/
│   ├── render-config.ts # Existing: visual config (GRID_SIZE, CELL_SIZE, COLORS)
│   └── game-config.ts   # NEW: game logic config (INITIAL_TURN, PLAYERS)
├── models/
│   ├── board.ts         # Existing: Board/Cell/GamePiece types
│   ├── demo-board.ts    # Existing: demo board factory
│   └── game-state.ts    # NEW: GameState type with board + currentTurn
├── engine/
│   ├── move-validator.ts   # NEW: pure functions for move validation
│   ├── state-transitions.ts # NEW: pure state transition functions
│   └── game-engine.ts      # NEW: main game engine coordinating logic
├── input/
│   └── click-handler.ts # NEW: translate canvas clicks to game actions
├── ui/
│   └── turn-indicator.ts # NEW: render turn indicator text/UI
├── renderer/
│   └── board-renderer.ts # Existing: pure board rendering (unchanged)
├── main.ts              # MODIFIED: wire up game loop, input, and rendering
└── style.css            # MODIFIED: add turn indicator styling

tests/
├── unit/
│   ├── board.test.ts         # Existing: board validation tests
│   ├── renderer.test.ts      # Existing: renderer tests
│   ├── game-state.test.ts    # NEW: GameState structure tests
│   ├── move-validator.test.ts # NEW: move validation logic tests
│   ├── state-transitions.test.ts # NEW: state transition tests
│   ├── click-handler.test.ts  # NEW: click coordinate mapping tests
│   └── turn-indicator.test.ts # NEW: turn indicator logic tests
└── setup.ts             # Existing: Canvas + DOM mocking

index.html               # MODIFIED: add turn indicator DOM element
```

**Structure Decision**: Extending single project structure with new directories for game engine logic (`engine/`), input handling (`input/`), and UI components (`ui/`). This maintains clear separation per constitution: `models/` for data types, `engine/` for pure game logic, `input/` for event handling translation, `ui/` for UI-specific rendering, and `renderer/` for canvas rendering. All new logic will be testable in isolation per Principle II.

**Key Architectural Decisions**:
- Game engine contains only pure functions (no side effects)
- Input handler sits between DOM events and game engine
- Main.ts coordinates the game loop: input → engine → render
- Turn indicator is separate from board rendering for flexibility
- Existing board rendering remains completely unchanged

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected ✅ - All constitution principles are satisfied. The architecture maintains strict separation between game logic, input handling, and rendering, enabling comprehensive unit testing without browser dependencies.

