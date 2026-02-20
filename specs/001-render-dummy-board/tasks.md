# Tasks: Render Dummy Board

**Feature**: 001-render-dummy-board  
**Branch**: `001-render-dummy-board`  
**Created**: 2026-02-20

**Input**: Design documents from `/specs/001-render-dummy-board/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1 = User Story 1)
- Include exact file paths in descriptions

## Path Conventions

Single project structure: `src/`, `tests/`, `public/` at repository root

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize TypeScript project with Vite build tool and testing infrastructure

- [ ] T001 Initialize Vite project with vanilla TypeScript template at repository root
- [ ] T002 Install development dependencies (vitest, jsdom, @vitest/ui) via npm
- [ ] T003 [P] Create project directory structure (src/constants/, src/models/, src/renderer/, tests/unit/, public/)
- [ ] T004 [P] Configure vite.config.ts with test environment (jsdom, globals, setupFiles)
- [ ] T005 [P] Add test scripts to package.json (test, test:ui, test:run)
- [ ] T006 Create tests/setup.ts with Canvas API mocking for unit tests

**Checkpoint**: Project initialized with Vite, TypeScript, and Vitest ready for TDD workflow

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core constants and configuration that ALL implementation depends on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Create src/constants/render-config.ts with GRID_SIZE, CELL_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT constants
- [ ] T008 [P] Add COLORS configuration object (background, grid, xPiece, oPiece) to src/constants/render-config.ts
- [ ] T009 [P] Add RENDER_STYLE configuration object (gridLineWidth, pieceLineWidth, piecePadding) to src/constants/render-config.ts

**Checkpoint**: All visual and structural constants centralized per Constitution Principle V - Ready for user story implementation

---

## Phase 3: User Story 1 - Display Game Board (Priority: P1) 🎯 MVP

**Goal**: Render a 3x3 tic-tac-toe grid on HTML5 Canvas with hard-coded X's and O's to demonstrate board appearance

**Independent Test**: Open application and verify 3x3 grid is visible with distinct cells containing hard-coded game pieces

### Tests for User Story 1 (TDD - Write FIRST, Ensure FAIL)

- [ ] T010 [P] [US1] Write test for Board type validation function in tests/unit/board.test.ts (valid 3x3 board passes)
- [ ] T011 [P] [US1] Write test for Board validation with invalid cell count in tests/unit/board.test.ts (should fail)
- [ ] T012 [P] [US1] Write test for demo board creation in tests/unit/board.test.ts (validates structure)
- [ ] T013 [P] [US1] Write test for renderer grid drawing in tests/unit/renderer.test.ts (mock context calls verified)
- [ ] T014 [P] [US1] Write test for renderer X piece drawing in tests/unit/renderer.test.ts (correct coordinates and colors)
- [ ] T015 [P] [US1] Write test for renderer O piece drawing in tests/unit/renderer.test.ts (correct arc calls)
- [ ] T016 [P] [US1] Write test for renderer handling empty cells in tests/unit/renderer.test.ts (no piece drawn)

**Run tests - All should FAIL (RED phase)** ✋

### Data Model Implementation for User Story 1

- [ ] T017 [P] [US1] Define GamePieceValue type ('X' | 'O' | null) in src/models/board.ts
- [ ] T018 [P] [US1] Define CellPosition interface (row, col properties) in src/models/board.ts
- [ ] T019 [US1] Define Cell interface (value, position properties) in src/models/board.ts
- [ ] T020 [US1] Define Board interface (cells array, size property) in src/models/board.ts
- [ ] T021 [US1] Implement isValidBoard validation function in src/models/board.ts (checks cell count and positions)
- [ ] T022 [US1] Create demo board factory function createDemoBoard() in src/models/demo-board.ts with hard-coded X's and O's

**Run tests for models - Should PASS (GREEN phase)** ✅

### Renderer Implementation for User Story 1

- [ ] T023 [US1] Implement drawGrid helper function in src/renderer/board-renderer.ts (draws vertical and horizontal lines)
- [ ] T024 [P] [US1] Implement drawXPiece helper function in src/renderer/board-renderer.ts (two diagonal lines)
- [ ] T025 [P] [US1] Implement drawOPiece helper function in src/renderer/board-renderer.ts (circle with arc)
- [ ] T026 [US1] Implement main renderBoard function in src/renderer/board-renderer.ts (clears canvas, draws grid, draws pieces)
- [ ] T027 [US1] Implement clear function in src/renderer/board-renderer.ts (clears entire canvas)

**Run all tests - Should PASS (GREEN phase)** ✅

### HTML & Entry Point for User Story 1

- [ ] T028 [P] [US1] Create public/index.html with canvas element (id="gameCanvas", 450x450px)
- [ ] T029 [P] [US1] Create src/style.css with basic layout styling (centering, border, shadow)
- [ ] T030 [US1] Implement src/main.ts entry point (get canvas, get context, create demo board, render)
- [ ] T031 [US1] Verify canvas context error handling in src/main.ts (throw if context is null)

**Checkpoint**: User Story 1 complete - Board renders with hard-coded pieces, all tests pass

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and quality improvements

- [ ] T032 [P] Run npm test:run to verify all unit tests pass
- [ ] T033 [P] Run npm run dev and manually verify board displays correctly in browser
- [ ] T034 Validate all acceptance scenarios from spec.md (grid visible, cells distinguishable, pieces visible, grid lines clear)
- [ ] T035 Verify success criteria SC-001 through SC-004 (load time, visibility, proportions, mobile viewability)
- [ ] T036 [P] Test responsive display on different screen sizes (desktop, tablet, mobile)
- [ ] T037 Run quickstart.md validation checklist (all 9 items)
- [ ] T038 [P] Code review for Constitution compliance (no magic numbers, rendering isolated, types explicit)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001-T006) - BLOCKS user story
- **User Story 1 (Phase 3)**: Depends on Foundational (T007-T009) completion
- **Polish (Phase 4)**: Depends on User Story 1 completion

### Within User Story 1

1. **Tests FIRST** (T010-T016): All can run in parallel, must FAIL initially
2. **Data Model** (T017-T022): Models before demo board factory
3. **Renderer** (T023-T027): Helper functions before main render function
4. **Integration** (T028-T031): HTML and entry point can be parallel, main.ts depends on renderer
5. **Tests should PASS** after implementation

### Parallel Opportunities

**Phase 1 (Setup)**:
- T003, T004, T005 can run in parallel after T001-T002

**Phase 2 (Foundational)**:
- T008, T009 can run in parallel after T007

**Phase 3 - Tests (US1)**:
- T010-T016: All 7 test tasks can run in parallel (different test files)

**Phase 3 - Models (US1)**:
- T017, T018 can run in parallel (independent types)

**Phase 3 - Renderer (US1)**:
- T024, T025 can run in parallel (independent helper functions)

**Phase 3 - Integration (US1)**:
- T028, T029 can run in parallel (HTML and CSS are independent)

**Phase 4 (Polish)**:
- T032, T033, T036, T038 can run in parallel (independent validation tasks)

---

## Parallel Example: User Story 1 Tests

```bash
# Launch all test writing tasks together:
- T010: Write Board validation test (valid case)
- T011: Write Board validation test (invalid case)  
- T012: Write demo board test
- T013: Write renderer grid test
- T014: Write renderer X piece test
- T015: Write renderer O piece test
- T016: Write renderer empty cell test

# All tests should FAIL initially (RED phase)
```

---

## Parallel Example: User Story 1 Models

```bash
# Launch type definition tasks together:
- T017: GamePieceValue type
- T018: CellPosition interface

# Then sequential:
- T019: Cell interface (uses T017, T018)
- T020: Board interface (uses T019)
- T021: isValidBoard function (uses T020)
- T022: createDemoBoard function (uses T020)
```

---

## Implementation Strategy

### TDD Workflow (REQUIRED by Constitution)

1. **RED**: Write failing tests first (T010-T016)
2. **GREEN**: Implement minimum code to pass tests (T017-T027)
3. **REFACTOR**: Clean up code while keeping tests green
4. **INTEGRATE**: Wire up entry point (T028-T031)
5. **VALIDATE**: Manual and automated validation (T032-T038)

### MVP Delivery (User Story 1 Only)

1. Complete Phase 1: Setup (~15 min)
2. Complete Phase 2: Foundational (~15 min)
3. Complete Phase 3: User Story 1 (~90 min)
   - Write tests FIRST
   - Implement models
   - Implement renderer
   - Integrate HTML + entry point
4. Complete Phase 4: Polish (~30 min)
5. **Total Estimate**: ~2 hours for complete MVP

### Development Commands

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm test             # Run tests in watch mode (TDD)
npm test:ui          # Visual test runner
npm test:run         # Run tests once (CI mode)
npm run build        # Production build
```

---

## Task Summary

- **Total Tasks**: 38
- **Phase 1 (Setup)**: 6 tasks
- **Phase 2 (Foundational)**: 3 tasks
- **Phase 3 (User Story 1)**: 22 tasks
  - Tests: 7 tasks (TDD required)
  - Models: 6 tasks
  - Renderer: 5 tasks
  - Integration: 4 tasks
- **Phase 4 (Polish)**: 7 tasks

**Parallel Opportunities**: 15 tasks marked [P] can run simultaneously with proper dependency management

**Independent Test Criteria**: User Story 1 is independently testable - open browser and verify 3x3 grid with X's and O's rendered on canvas

---

## Notes

- All tasks follow Constitution Principle III: Test-First Development (TDD)
- Constants centralized per Constitution Principle V (no magic numbers)
- Rendering isolated from state per Constitution Principle II
- All types explicit per Constitution Principle I (FSM foundation)
- Each task includes specific file paths for implementation
- [P] marker indicates tasks that can run in parallel (different files)
- [US1] marker maps all tasks to User Story 1 for traceability
- Tests MUST be written first and FAIL before implementing code (RED-GREEN-REFACTOR)
