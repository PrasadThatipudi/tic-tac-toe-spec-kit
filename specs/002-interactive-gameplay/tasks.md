# Task Breakdown: Interactive Gameplay

**Feature**: 002-interactive-gameplay  
**Date**: 2026-02-20  
**Estimated Time**: 4-6 hours  
**Methodology**: Test-Driven Development (TDD) - Red-Green-Refactor

## Task Phases

### Phase 0: Setup & Prerequisites (15 minutes)

- [X] **TASK-001**: Create game configuration constants
  - File: `src/constants/game-config.ts`
  - Create PlayerSymbol type, GAME_CONFIG, MOVE_VALIDATION constants
  - Dependencies: None
  - Priority: CRITICAL

### Phase 1: Data Models (30 minutes)

- [X] **TASK-002**: Add createEmptyBoard utility to board model
  - File: `src/models/board.ts`
  - Add factory function to create empty board of given size
  - Dependencies: TASK-001
  - Priority: CRITICAL

- [X] **TASK-003**: Create GameState model
  - File: `src/models/game-state.ts`
  - Define GameState interface, MoveResult types
  - Dependencies: TASK-001, TASK-002
  - Priority: CRITICAL

- [X] **TASK-004**: Write GameState tests
  - File: `tests/unit/game-state.test.ts`
  - Test GameState structure validation
  - Dependencies: TASK-003
  - Priority: CRITICAL
  - Type: TEST (TDD Red)

### Phase 2: Game Engine - Core Logic (2 hours)

- [X] **TASK-005**: Write move validation tests
  - File: `tests/unit/move-validator.test.ts`
  - Test cases: empty cell, occupied cell, invalid position, move in progress
  - Dependencies: TASK-004
  - Priority: CRITICAL
  - Type: TEST (TDD Red)

- [X] **TASK-006**: Implement move validator
  - File: `src/engine/move-validator.ts`
  - Implement validateMove() pure function
  - Dependencies: TASK-005
  - Priority: CRITICAL
  - Type: IMPLEMENTATION (TDD Green)

- [X] **TASK-007**: Write state transition tests
  - File: `tests/unit/state-transitions.test.ts`
  - Test cases: switchTurn, processMove, immutability
  - Dependencies: TASK-006
  - Priority: CRITICAL
  - Type: TEST (TDD Red)

- [X] **TASK-008**: Implement state transitions
  - File: `src/engine/state-transitions.ts`
  - Implement switchTurn(), processMove(), updateBoardWithMove()
  - Dependencies: TASK-007
  - Priority: CRITICAL
  - Type: IMPLEMENTATION (TDD Green)

- [X] **TASK-009**: Create game engine facade
  - File: `src/engine/game-engine.ts`
  - Create createInitialGameState(), re-export core functions
  - Dependencies: TASK-008
  - Priority: CRITICAL

### Phase 3: Input Handling (1 hour)

- [X] **TASK-010**: Write click handler tests
  - File: `tests/unit/click-handler.test.ts`
  - Test cases: coordinate mapping, boundary detection, out of bounds
  - Dependencies: TASK-009
  - Priority: CRITICAL
  - Type: TEST (TDD Red)

- [X] **TASK-011**: Implement click handler
  - File: `src/input/click-handler.ts`
  - Implement getCellFromCoordinates(), getCanvasPosition(), setupClickHandler()
  - Dependencies: TASK-010
  - Priority: CRITICAL
  - Type: IMPLEMENTATION (TDD Green)

### Phase 4: UI Components (30 minutes)

- [X] **TASK-012**: Write turn indicator tests
  - File: `tests/unit/turn-indicator.test.ts`
  - Test cases: formatTurnText, createTurnIndicator, updateTurnIndicator
  - Dependencies: TASK-009
  - Priority: CRITICAL
  - Type: TEST (TDD Red) [P]

- [X] **TASK-013**: Implement turn indicator
  - File: `src/ui/turn-indicator.ts`
  - Implement formatTurnText(), createTurnIndicator(), updateTurnIndicator()
  - Dependencies: TASK-012
  - Priority: CRITICAL
  - Type: IMPLEMENTATION (TDD Green)

### Phase 5: Integration (1 hour)

- [X] **TASK-014**: Update HTML structure
  - File: `index.html`
  - Add turn indicator container element
  - Dependencies: None
  - Priority: HIGH [P]

- [X] **TASK-015**: Update CSS styles
  - File: `src/style.css`
  - Add turn indicator styling
  - Dependencies: TASK-014
  - Priority: HIGH [P]

- [X] **TASK-016**: Integrate components in main.ts
  - File: `src/main.ts`
  - Wire up game engine, click handler, renderer, turn indicator
  - Dependencies: TASK-011, TASK-013, TASK-014, TASK-015
  - Priority: CRITICAL

### Phase 6: Validation (30 minutes)

- [ ] **TASK-017**: Run full test suite
  - Command: `npm test`
  - Verify all tests pass
  - Dependencies: All previous tasks
  - Priority: CRITICAL

- [ ] **TASK-018**: Manual testing
  - Start dev server, test interactive gameplay
  - Verify click handling, turn rotation, move validation
  - Dependencies: TASK-017
  - Priority: HIGH

- [X] **TASK-019**: Verify project setup files
  - Check/create .gitignore, .prettierignore, .eslintignore if needed
  - Dependencies: None
  - Priority: MEDIUM [P]

## Execution Rules

1. **Sequential Execution**: Tasks within each phase must complete in order
2. **Parallel Tasks [P]**: Tasks marked with [P] can run in parallel
3. **TDD Workflow**: All TEST tasks must be written before corresponding IMPLEMENTATION tasks
4. **Validation Gates**: Cannot proceed to next phase until current phase tests pass
5. **Failure Handling**: If any CRITICAL task fails, halt execution and report error

## Progress Tracking

Total Tasks: 19  
Completed: 17  
In Progress: 0  
Blocked: 0  
Failed: 0

**Status**: Ready for testing validation (TASK-017 and TASK-018 pending)

## Notes

- All game logic must be pure functions (no side effects)
- Maintain strict separation: engine (logic), input (events), ui (DOM), renderer (canvas)
- Target 100% test coverage for game engine logic
- Existing renderer and board model remain unchanged











