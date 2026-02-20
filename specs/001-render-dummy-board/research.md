# Research: Render Dummy Board

**Feature**: 001-render-dummy-board  
**Date**: 2026-02-20  
**Status**: Completed

## Purpose

Resolve all NEEDS CLARIFICATION items from Technical Context and establish technology choices for browser-based tic-tac-toe game rendering feature.

## Research Questions

1. **Build Tool Selection**: Vite vs Webpack vs esbuild
2. **Testing Framework Selection**: Jest vs Vitest

---

## Decision 1: Build Tool

### Decision: Vite

### Rationale

Vite is the optimal choice for this browser-based TypeScript game project because:

1. **Instant Development Feedback**: Sub-50ms Hot Module Replacement (HMR) and instant dev server startup are critical for iterative game development where visual feedback is essential
2. **Zero-Config TypeScript**: Native TypeScript support with ES2020+ features works out-of-the-box without configuration overhead
3. **Vanilla Project Optimization**: Unlike Webpack which targets complex applications, Vite excels at simple, framework-free projects like this game
4. **2026 Industry Standard**: Strongest community momentum and adoption for modern web projects, ensuring long-term support and ecosystem compatibility
5. **Production Ready**: Rollup-based production builds provide optimal bundling without sacrificing development experience

**Expected Performance**:

- Dev server startup: < 500ms
- HMR updates: < 50ms
- Production build: < 5s (for small game project)

### Alternatives Considered

**Webpack**:

- ❌ Rejected due to configuration complexity (requires extensive webpack.config.js setup)
- ❌ Slower development experience (2-5s initial startup, 500ms+ HMR)
- ❌ Overkill for simple single-page game without complex build requirements
- ✅ Would work but adds unnecessary overhead

**esbuild**:

- ❌ Rejected due to lack of built-in dev server and HMR
- ❌ Requires manual infrastructure setup (custom dev server, watch mode orchestration)
- ✅ Excellent build speed but DIY approach adds project complexity
- ✅ Better suited as a library build tool, not application development

---

## Decision 2: Testing Framework

### Decision: Vitest

### Rationale

Vitest is the optimal choice for this test-first TypeScript game project because:

1. **TDD-Optimized Speed**: 3-10x faster test execution in watch mode (< 100ms vs 300-1000ms in Jest) provides instant feedback for red-green-refactor cycles
2. **Zero-Config TypeScript Integration**: Automatically inherits TypeScript configuration from vite.config.ts with no duplication or drift risk
3. **Seamless Vite Compatibility**: Uses the same transformation pipeline as the development build, ensuring dev/test environment consistency
4. **Native ESM Support**: No experimental flags or complex configuration needed for modern JavaScript modules
5. **Built-in UI Mode**: Visual test runner aids debugging Canvas rendering logic

**Canvas Mocking Capability**:
Both Jest and Vitest have equivalent Canvas API mocking capabilities using `jsdom` or `happy-dom` environments. Vitest setup is slightly simpler due to integrated configuration.

**Expected Performance**:

- Initial test run: < 500ms
- Watch mode updates: < 100ms per change
- Full suite re-run: < 2s (for small test suite)

### Alternatives Considered

**Jest**:

- ❌ Rejected due to slower feedback loop (300-1000ms watch mode) which undermines TDD effectiveness
- ❌ Requires extensive manual configuration for TypeScript + ESM support
- ❌ Must duplicate build tool and TypeScript configuration, risking dev/test divergence
- ❌ Slower transformation pipeline impacts red-green-refactor cycle efficiency
- ✅ Mature ecosystem and widespread adoption
- ✅ Would work but provides inferior developer experience for this use case

---

## Implementation Notes

### Quick Start Setup

**Build Tool (Vite)**:

```bash
npm create vite@latest . -- --template vanilla-ts
```

**Testing (Vitest)**:

```bash
npm install -D vitest jsdom @vitest/ui
```

**Test Configuration** (vite.config.ts):

```typescript
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup.ts",
  },
});
```

**Canvas Mocking** (tests/setup.ts):

```typescript
import { vi } from "vitest";

// Mock Canvas API for unit tests
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  fillText: vi.fn(),
  // ... other Canvas methods as needed
}));
```

### Technology Stack Summary

| Component        | Decision   | Version              |
| ---------------- | ---------- | -------------------- |
| Language         | TypeScript | Latest (strict mode) |
| Build Tool       | Vite       | ^5.0                 |
| Testing          | Vitest     | ^1.0                 |
| Test Environment | jsdom      | via Vitest           |
| Runtime          | Browser    | ES2020+              |

### Best Practices for This Stack

1. **Hot Reload**: Leverage Vite's instant HMR for rapid visual iteration on Canvas rendering
2. **Test Isolation**: Use Vitest's fast watch mode to run only affected tests during TDD
3. **Shared Config**: Keep vite.config.ts as single source of truth for both dev and test environments
4. **Mock Strategy**: Mock Canvas context methods but test coordinate calculation logic directly

---

## Resolved Clarifications

All NEEDS CLARIFICATION items from Technical Context have been resolved:

- ✅ **Primary Dependencies**: Vite (build tool)
- ✅ **Testing**: Vitest

Technical Context can now be updated with concrete decisions.
