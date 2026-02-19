<!--

# SYNC IMPACT REPORT - 2026-02-19

Version Change: [TEMPLATE] → 1.0.0 (Initial ratification)

Modified Principles:

- NEW: I. Finite State Machine Architecture
- NEW: II. Isolated Game Loop & Rendering
- NEW: III. Test-First Development (NON-NEGOTIABLE)
- NEW: IV. Deterministic Specifications
- NEW: V. Code Quality & Constants Management

Added Sections:

- Technology Stack
- Development Workflow

Templates Status:
✅ plan-template.md - Constitution Check section aligns with FSM, testing, and code quality principles
✅ spec-template.md - Requirements section supports inputs/outputs/edge cases/failure cases specification
✅ tasks-template.md - Test-First approach already emphasized in template structure

Follow-up TODOs:

- None - All placeholders filled

Rationale for Version 1.0.0:

- Initial constitution ratification
- Establishes foundational governance for browser-based game development
- All core principles defined and non-negotiable

================================
-->

# Browser Games Constitution

## Core Principles

### I. Finite State Machine Architecture

All games MUST use a finite state machine (FSM) pattern for game state management.

- Every game state MUST be explicitly defined and enumerable
- State transitions MUST be deterministic and testable
- Game states MUST NOT be inferred from multiple boolean flags or implicit conditions
- FSM implementation MUST be decoupled from rendering and input handling

**Rationale**: FSM ensures predictable game behavior, simplifies debugging, enables state-based testing, and makes game logic comprehensible and maintainable.

### II. Isolated Game Loop & Rendering

Game loop MUST be isolated from rendering logic; UI components MUST NOT contain business logic.

- Game loop (update logic) MUST be separate from render logic
- Game state updates MUST be pure functions that do not depend on rendering
- Rendering MUST be a pure projection of game state (state → render, never render → state)
- UI components MUST delegate all game decisions to the game engine
- No direct DOM manipulation or Canvas drawing inside game logic

**Rationale**: Separation enables unit testing game logic without browser dependencies, supports alternative renderers (Canvas, SVG, terminal), and prevents tight coupling between presentation and logic.

### III. Test-First Development (NON-NEGOTIABLE)

All core game logic MUST be unit tested using Test-Driven Development.

- Tests MUST be written before implementation
- Red-Green-Refactor cycle strictly enforced: Write failing test → Implement minimum code to pass → Refactor
- Core game logic (state transitions, rule validation, win conditions) MUST have 100% test coverage
- Edge cases and failure scenarios MUST have explicit test cases
- Tests MUST run in isolation without browser or Canvas dependencies

**Rationale**: TDD ensures correctness from the start, catches regressions early, and serves as living documentation of game behavior.

### IV. Deterministic Specifications

Every feature MUST define inputs, outputs, state transitions, edge cases, and failure cases.

- Feature specifications MUST document:
  - **Inputs**: All user actions, events, or data that trigger behavior
  - **Outputs**: Observable state changes, visual updates, or side effects
  - **State Transitions**: FSM state changes with preconditions and postconditions
  - **Edge Cases**: Boundary conditions, unusual inputs, race conditions
  - **Failure Cases**: Invalid inputs, error states, recovery mechanisms
- Specifications MUST be verifiable through automated tests
- Ambiguous or underspecified features MUST be clarified before implementation

**Rationale**: Complete specifications eliminate ambiguity, enable test-first development, and ensure all stakeholders share the same understanding of expected behavior.

### V. Code Quality & Constants Management

Code MUST maintain high readability through centralized configuration and clear architecture boundaries.

- **No Magic Numbers**: All numeric constants MUST be named and centralized (e.g., `GRID_SIZE`, `PLAYER_COUNT`, `WIN_LENGTH`)
- **Centralized Constants**: Game configuration MUST be in a dedicated constants file or module
- **Clear Separation**: Game engine logic MUST be separated from game-specific rules
  - Engine: Generic game loop, FSM framework, rendering pipeline
  - Game: Specific rules, win conditions, scoring logic
- **Self-Documenting Code**: Variable and function names MUST clearly express intent
- **Minimal Dependencies**: Avoid introducing libraries unless they solve a specific, justified problem

**Rationale**: Eliminates "magic" that hinders comprehension, enables easy configuration changes, supports code reuse across games, and reduces cognitive load when reading code.

## Technology Stack

**Language**: TypeScript (strict mode enabled)  
**Runtime**: Browser (ES2020+ features allowed)  
**Rendering**: HTML5 Canvas API  
**Testing**: Jest or Vitest with TypeScript support  
**Build**: Modern bundler (Vite, Webpack, or esbuild)

**Constraints**:

- No framework dependencies (React, Vue, Angular) for core game logic
- Game logic MUST be framework-agnostic and testable in Node.js environment
- Use browser APIs only in rendering and input layers, never in game logic

## Development Workflow

### Implementation Process

1. **Specification Phase**: Write complete feature specification per Principle IV
2. **Test Phase**: Write failing tests that validate specification requirements
3. **Review Phase**: Validate tests with stakeholders before implementation
4. **Implementation Phase**: Write minimum code to pass tests
5. **Refactor Phase**: Improve code quality while maintaining passing tests

### Code Review Requirements

- All PRs MUST verify compliance with Core Principles I-V
- Tests MUST be reviewed and approved before implementation code
- Reviewers MUST check for magic numbers, FSM adherence, and logic/UI separation
- Implementation without prior failing tests is grounds for rejection

### Quality Gates

- Game logic MUST pass unit tests with 100% coverage of state transitions
- Game mechanics MUST be deterministic (same inputs → same outputs in tests)
- No game logic MUST depend on `window`, `document`, or Canvas APIs
- Constants MUST be centralized and named meaningfully

## Governance

This Constitution supersedes all other development practices and guides. All feature work, code reviews, and architectural decisions MUST comply with the Core Principles.

### Amendment Process

- Constitution amendments require explicit documentation in this file with version bump
- Amendments MUST include:
  - Rationale for change
  - Impact assessment on existing code
  - Migration plan if principles change
  - Updated compliance checks in templates
- Breaking changes to principles require MAJOR version bump

### Compliance Verification

- All PRs MUST pass Constitution Check gates defined in plan-template.md
- Violations of NON-NEGOTIABLE principles result in automatic PR rejection
- Complexity that violates principles MUST be justified in Complexity Tracking section of plan.md
- Development guidance files (.github/agents/) MUST align with this Constitution

### Versioning Policy

- **MAJOR**: Backward-incompatible principle changes, principle removals, or governance redefinition
- **MINOR**: New principle additions, new sections, or material expansions to existing principles
- **PATCH**: Clarifications, wording improvements, typo fixes, non-semantic refinements

**Version**: 1.0.0 | **Ratified**: 2026-02-19 | **Last Amended**: 2026-02-19
