# Implementation Plan: Game Over Detection

**Branch**: `003-game-over-detection` | **Date**: 2026-02-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-game-over-detection/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement comprehensive game-over detection for tic-tac-toe including win condition detection across all 8 possible lines (3 rows, 3 columns, 2 diagonals), draw detection when the board is full with no winner, visual highlighting of winning combinations, result display with accessibility support via ARIA live regions, and prevention of moves after game completion. The system extends the existing game engine with a game status enum (ACTIVE, X_WON, O_WON, DRAW), optimized win checking that examines only relevant lines (3-5 checks per move), and rendering enhancements to display game results and highlight winning marks.

## Technical Context

**Language/Version**: TypeScript (strict mode, ES2020+)  
**Primary Dependencies**: Vite ^5.0 (build tool, dev server, HMR)  
**Storage**: N/A (in-memory game state, no persistence)  
**Testing**: Vitest ^1.0 with jsdom environment  
**Target Platform**: Browser (modern browsers supporting Canvas API, HTML5, ARIA)
**Project Type**: Single project (browser-based game)  
**Performance Goals**: <100ms win/draw detection, 60 fps rendering, <200ms result display  
**Constraints**: Game logic isolated from rendering per constitution, FSM pattern for game state, test-first development, optimized win checking (3-5 checks max per move), ARIA live region for accessibility  
**Scale/Scope**: Single-device hot-seat mode, 2 players, 3x3 grid, 8 win patterns, immediate result detection

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Initial Check (Pre-Phase 0): ✅ PASSED

### Principle I: Finite State Machine Architecture

- **Status**: ✅ PASS
- **Evaluation**: Game status must be explicitly enumerated (ACTIVE, X_WON, O_WON, DRAW). Current GameState with implicit "game over" checks from board state alone violates FSM principles. Must add explicit status field to GameState.
- **Requirement**: Extend GameState with status: GameStatus enum and optional winningLine: CellPosition[] array. Create deterministic state transition functions: checkWinCondition(state) → GameStatus, checkDrawCondition(state) → boolean. All game-over checks must be pure and testable.
- **Post-Design Verification**: ✅ GameStatus enum defined with 4 explicit states (ACTIVE, X_WON, O_WON, DRAW). GameState extended with status field and optional winningLine. State transitions documented in data-model.md with preconditions/postconditions. Win detection contract specifies pure functions: checkWin(), checkDraw(). All states enumerable and deterministic.

### Principle II: Isolated Game Loop & Rendering

- **Status**: ✅ PASS
- **Evaluation**: Win/draw detection logic must remain in game engine as pure functions. Rendering must project game status to visual output (result message, winning line highlighting). ARIA live region updates are DOM side effects and must be isolated from game logic.
- **Requirement**: Win detection in engine/ as pure functions. Result display rendering in ui/ as pure projection of state. ARIA announcements handled separately in main.ts as side effect after state update. No game logic in UI components.
- **Post-Design Verification**: ✅ Complete separation achieved: engine/win-detector.ts contains only pure functions with zero DOM/Canvas dependencies. ui/result-display.ts handles DOM-only result rendering. renderer/board-renderer.ts extends with winning line highlighting as pure state projection (winningLine → visual effect). ARIA announcements isolated in main.ts as side effect. All contracts explicitly document "NO side effects" for game logic modules.

### Principle III: Test-First Development (NON-NEGOTIABLE)

- **Status**: ✅ PASS
- **Evaluation**: All win detection patterns (8 lines), draw detection, status transitions, and move prevention logic must be unit tested before implementation using TDD.
- **Requirement**: Write tests first for: 1) All 8 win patterns (3 rows, 3 cols, 2 diagonals) for both X and O (16 tests), 2) Draw detection (board full, no winner), 3) Win priority over draw, 4) Status transitions after moves, 5) Move prevention when status != ACTIVE, 6) Winning line identification. Target 100% coverage of detection logic.
- **Post-Design Verification**: ✅ Quickstart.md provides comprehensive TDD workflow with Red-Green-Refactor cycle for all modules. Win detector contract includes 30+ test cases covering all 8 win patterns (for both players), draw detection, optimization, and edge cases. Status manager contract includes 22+ test cases for win/draw integration, status persistence, and validation. Result renderer contract includes 21+ test cases for display and accessibility. All tests specified BEFORE implementation code.

### Principle IV: Deterministic Specifications

- **Status**: ✅ PASS
- **Evaluation**: Feature spec clearly defines all inputs (move placement), outputs (status change, result display, winning line highlight), state transitions (ACTIVE → X_WON/O_WON/DRAW), edge cases (last move win vs draw, empty board checks), and failure cases (moves after game over rejected).
- **Requirement**: Phase 1 contracts must specify exact win pattern definitions, check order (win before draw), status transition rules, and rendering/ARIA behavior for each status.
- **Post-Design Verification**: ✅ All contracts specify complete behavior: Win detector contract defines checkWin() and checkDraw() with exact algorithms and 30+ test cases. Status manager contract documents complete state transition flow with preconditions/postconditions. Data model specifies all win patterns as constant arrays, GameStatus enum with 4 explicit states, and complete validation rules. All edge cases from spec mapped to contract requirements (win priority, last move, move prevention).

### Principle V: Code Quality & Constants Management

- **Status**: ✅ PASS
- **Evaluation**: All win pattern definitions (line coordinates), status values, and detection thresholds must be centralized. No magic numbers for win line indices or hardcoded status strings.
- **Requirement**: Add WIN_PATTERNS constant array defining all 8 winning lines as coordinate arrays. Add GAME_STATUS enum/type. Add RESULT_MESSAGES constant for display text. Reuse existing GRID_SIZE from game-config.
- **Post-Design Verification**: ✅ Data model specifies WIN_PATTERNS as readonly constant array with all 8 patterns defined. GameStatus type alias defined with 4 explicit string literals. RESULT_MESSAGES constant maps status to display text. Quickstart.md shows all constants centralized in game-config.ts. All contracts reference named constants (WIN_PATTERNS, RESULT_MESSAGES) instead of magic values. No hardcoded indices or status strings in logic modules.

### Post-Phase 1 Re-Check: ✅ ALL GATES PASSED

All constitution principles satisfied in design phase:

- ✅ Explicit FSM with GameStatus enum and deterministic state transitions
- ✅ Complete isolation: win-detector (pure logic), result-display (DOM only), renderer (pure canvas)
- ✅ Comprehensive TDD strategy with 73+ test cases specified before implementation
- ✅ All behaviors deterministic with complete contracts (algorithms, preconditions, postconditions)
- ✅ All constants centralized (WIN_PATTERNS, GameStatus, RESULT_MESSAGES, no magic values)

**Overall Status**: ✅ READY FOR IMPLEMENTATION (Phase 2 - task breakdown via /speckit.tasks)

## Project Structure

### Documentation (this feature)

```text
specs/003-game-over-detection/
├── spec.md              # Feature specification (✅ Complete)
├── plan.md              # This file - implementation plan (✅ Complete)
├── research.md          # Technology decisions (✅ Complete - Phase 0)
├── data-model.md        # Data structure design (✅ Complete - Phase 1)
├── quickstart.md        # Developer guide (✅ Complete - Phase 1)
├── contracts/           # Interface specifications (✅ Complete - Phase 1)
│   ├── win-detector.md      # Win detection contract (✅ Complete)
│   ├── status-manager.md    # Game status management contract (✅ Complete)
│   └── result-renderer.md   # Result display contract (✅ Complete)
├── tasks.md             # Task breakdown (⏳ Phase 2 - run /speckit.tasks)
└── checklists/          # Validation checklists (✅ Complete)
```

### Source Code (repository root)

```text
src/
├── constants/
│   ├── render-config.ts      # Existing: visual config (GRID_SIZE, CELL_SIZE, COLORS)
│   └── game-config.ts        # MODIFIED: add GameStatus, WIN_PATTERNS, RESULT_MESSAGES
├── models/
│   ├── board.ts              # Existing: Board/Cell/GamePiece types
│   ├── demo-board.ts         # Existing: demo board factory
│   └── game-state.ts         # MODIFIED: add status, winningLine to GameState
├── engine/
│   ├── move-validator.ts     # MODIFIED: add status check (reject if not ACTIVE)
│   ├── state-transitions.ts  # MODIFIED: check win/draw after move, update status
│   ├── game-engine.ts        # Existing: main game engine
│   └── win-detector.ts       # NEW: pure win/draw detection functions
├── input/
│   └── click-handler.ts      # Existing: translate canvas clicks (may need status check)
├── ui/
│   ├── turn-indicator.ts     # Existing: render turn indicator
│   └── result-display.ts     # NEW: render game result message
├── renderer/
│   └── board-renderer.ts     # MODIFIED: highlight winning line when present
├── main.ts                   # MODIFIED: wire up result display, ARIA announcements
└── style.css                 # MODIFIED: add result display and winning line styles

tests/
├── unit/
│   ├── board.test.ts              # Existing: board validation tests
│   ├── renderer.test.ts           # Existing: renderer tests (may expand for highlighting)
│   ├── game-state.test.ts         # Existing: GameState structure tests
│   ├── move-validator.test.ts     # MODIFIED: add status validation tests
│   ├── state-transitions.test.ts  # MODIFIED: add win/draw detection integration tests
│   ├── click-handler.test.ts      # Existing: click coordinate mapping tests
│   ├── turn-indicator.test.ts     # Existing: turn indicator logic tests
│   ├── win-detector.test.ts       # NEW: comprehensive win/draw detection tests (16+ cases)
│   └── result-display.test.ts     # NEW: result rendering tests
└── setup.ts                       # Existing: Canvas + DOM mocking

index.html                          # MODIFIED: add result display and ARIA live region
```

**Structure Decision**: Extending existing single project structure with new win detection module (`engine/win-detector.ts`) and result display UI (`ui/result-display.ts`). Modifications to existing modules maintain clear separation per constitution: `engine/` contains all pure win/draw detection logic, `ui/` handles result display rendering, `renderer/` adds winning line highlighting as pure state projection. Main.ts coordinates ARIA announcements as isolated side effects.

**Key Architectural Decisions**:
- Win detector contains only pure functions (no side effects, fully testable)
- Game status is explicit FSM state (ACTIVE | X_WON | O_WON | DRAW)
- Optimized win checking: only check row, column, and diagonals containing the last move (3-5 checks max)
- Winning line stored as array of CellPosition for rendering projection
- Result display and ARIA announcements are separate concerns
- Existing game engine and renderer remain minimally modified

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected ✅ - All constitution principles are satisfied. The architecture maintains strict FSM pattern with explicit game status, complete separation between detection logic and rendering, and comprehensive test-first approach for all 8 win patterns and draw conditions.

