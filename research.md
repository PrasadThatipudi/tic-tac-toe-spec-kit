# Build Tool Research: Vite vs Webpack vs esbuild

## Project Context

**Target Application:** Browser-based TypeScript tic-tac-toe game

**Key Requirements:**

- TypeScript strict mode with ES2020+ features
- HTML5 Canvas rendering
- Hot Module Replacement (HMR) for development
- Single-page application
- Zero framework dependencies
- Fast builds and excellent developer experience

---

## 1. Build Speed & Developer Experience

### Vite

- **Dev Server Startup:** Near-instant (< 1 second)
- **HMR Speed:** Extremely fast (< 50ms), leverages native ES modules
- **Production Builds:** Fast (uses Rollup with esbuild optimization)
- **Developer Experience:** Excellent out-of-box experience, minimal configuration
- **Cold Start:** No bundling needed in dev mode, serves source files directly

### Webpack

- **Dev Server Startup:** Slower (3-10+ seconds for even small projects)
- **HMR Speed:** Moderate (500ms-2s), requires full module graph updates
- **Production Builds:** Slower than alternatives, highly optimizable with caching
- **Developer Experience:** Steeper learning curve, extensive configuration required
- **Cold Start:** Must bundle entire application before serving

### esbuild

- **Dev Server Startup:** Very fast (< 1 second)
- **HMR Speed:** Fast, but HMR not built-in (requires additional tooling)
- **Production Builds:** Fastest raw build speed (10-100x faster than Webpack)
- **Developer Experience:** Minimal API, lacks mature dev server features
- **Cold Start:** Extremely fast bundling but lacks dev-oriented features

**Winner:** Vite - Best balance of speed and developer experience

---

## 2. TypeScript Support Quality

### Vite

- **Type Checking:** Transpilation-only by default (no type checking during build)
- **Setup Complexity:** Zero configuration needed
- **tsconfig.json:** Full respect for compiler options
- **Type Safety:** Requires `tsc --noEmit` watch or IDE for type checking
- **strictNullChecks:** Full support for strict mode
- **Ecosystem:** Excellent plugin ecosystem (vite-plugin-checker for type checking)
- **ES2020+ Support:** Native, no additional configuration

### Webpack

- **Type Checking:** Via ts-loader (with transpileOnly) or babel-loader + fork-ts-checker
- **Setup Complexity:** Requires loader configuration and plugin setup
- **tsconfig.json:** Full support with proper loader configuration
- **Type Safety:** Can block builds on type errors (configurable)
- **strictNullChecks:** Full support
- **Ecosystem:** Mature but requires multiple packages
- **ES2020+ Support:** Requires target configuration in tsconfig

### esbuild

- **Type Checking:** Strips types only, no type validation
- **Setup Complexity:** Minimal configuration
- **tsconfig.json:** Limited support (mainly for path mappings)
- **Type Safety:** Must run `tsc` separately for type checking
- **strictNullChecks:** No built-in validation (external tsc needed)
- **Ecosystem:** Growing but less mature
- **ES2020+ Support:** Excellent, very fast transpilation

**Winner:** Vite - Best developer experience with proper TypeScript workflows

---

## 3. Canvas & Browser API Compatibility

### Vite

- **Canvas Support:** Perfect - no special configuration needed
- **Browser APIs:** Direct browser execution, native module resolution
- **Asset Handling:** Built-in support for images, fonts, other assets
- **Source Maps:** Excellent source map generation
- **Import.meta:** Full support for import.meta.url and other modern features

### Webpack

- **Canvas Support:** Perfect - works with all browser APIs
- **Browser APIs:** Requires proper loader configuration
- **Asset Handling:** Comprehensive via asset/resource modules (requires configuration)
- **Source Maps:** Excellent but needs configuration
- **Import.meta:** Supported with additional plugins

### esbuild

- **Canvas Support:** Perfect - direct browser API access
- **Browser APIs:** No special handling needed
- **Asset Handling:** Basic support, may need additional tooling
- **Source Maps:** Good support
- **Import.meta:** Supported

**Winner:** Tie (All three) - Canvas is a standard browser API, works identically in all tools

---

## 4. Configuration Complexity

### Vite

```typescript
// vite.config.ts - Minimal config for this project
import { defineConfig } from "vite";

export default defineConfig({
  // Optional: Add type checking plugin if desired
});
```

**Complexity:** ⭐ (1/5)

- Zero-config for TypeScript
- Optional config file for customization
- Sensible defaults for SPA
- Plugin system is intuitive

### Webpack

```javascript
// webpack.config.js - Minimal config requires ~50+ lines
module.exports = {
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    hot: true,
    // ... more config
  },
  // ... plugins, optimization, etc.
};
```

**Complexity:** ⭐⭐⭐⭐⭐ (5/5)

- Requires multiple loaders and plugins
- Complex configuration API
- HMR needs explicit setup
- Must configure dev server separately

### esbuild

```javascript
// build.js - Requires custom dev server setup
require("esbuild").build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/bundle.js",
  // HMR requires additional tooling
});
```

**Complexity:** ⭐⭐ (2/5)

- Simple build API
- No dev server out of box
- HMR requires custom implementation or third-party tools
- Better suited as a build tool than dev environment

**Winner:** Vite - Simplest for complete development workflow

---

## 5. Adoption Trends & Community Support (2026)

### Vite

- **GitHub Stars:** ~70k+ (rapidly growing)
- **NPM Weekly Downloads:** ~15M+
- **Ecosystem Maturity:** Excellent - large plugin ecosystem
- **Community:** Very active, strong Vue.js ecosystem connection but framework-agnostic
- **Industry Adoption:** Adopted by major projects (Nuxt 3, SvelteKit, Astro)
- **Documentation:** Excellent, comprehensive guides
- **Momentum:** Strongest growth trajectory among modern build tools
- **Vanilla JS/TS Projects:** Increasingly popular choice

### Webpack

- **GitHub Stars:** ~64k+
- **NPM Weekly Downloads:** ~35M+ (legacy projects maintain usage)
- **Ecosystem Maturity:** Most mature, thousands of loaders/plugins
- **Community:** Large but stagnating
- **Industry Adoption:** Still dominant in legacy projects, losing ground for new projects
- **Documentation:** Comprehensive but complex
- **Momentum:** Declining for greenfield projects
- **Vanilla JS/TS Projects:** Overkill for simple projects

### esbuild

- **GitHub Stars:** ~38k+
- **NPM Weekly Downloads:** ~25M+ (often as dependency of other tools)
- **Ecosystem Maturity:** Growing but less mature than alternatives
- **Community:** Active but smaller
- **Industry Adoption:** Often used indirectly (via Vite, etc.)
- **Documentation:** Good but minimal
- **Momentum:** Strong as a build primitive, less common as standalone dev tool
- **Vanilla JS/TS Projects:** Requires significant DIY setup

**Winner:** Vite - Best momentum and community for new vanilla TypeScript projects

---

## Decision

**Recommended Tool: Vite**

---

## Rationale

Vite is the optimal choice for this tic-tac-toe game project because:

1. **Zero Configuration TypeScript Support**
   - Works out-of-box with `tsconfig.json`
   - No loaders or complex setup required
   - Perfect for strict mode and ES2020+ features

2. **Superior Development Experience**
   - Instant server startup (no bundling in dev mode)
   - Lightning-fast HMR that preserves game state
   - Immediate feedback loop essential for game development

3. **Perfect Fit for Vanilla Projects**
   - Designed for framework-free applications
   - No unnecessary abstraction overhead
   - Treats vanilla TypeScript as first-class citizen

4. **Canvas Game Development**
   - No special configuration for Canvas APIs
   - Excellent source maps for debugging game logic
   - Fast refresh without losing canvas context

5. **Production Ready**
   - Optimized builds via Rollup + esbuild
   - Code splitting and tree-shaking out-of-box
   - Modern ES module output suitable for browsers

6. **Future-Proof**
   - Strong community momentum in 2026
   - Active development and rapid bug fixes
   - Growing ecosystem of plugins

7. **Minimal Complexity**
   - Can start with zero config
   - Simple to add features incrementally
   - Low maintenance burden

---

## Alternatives Considered

### Why Not Webpack?

**Rejected Due To:**

- ❌ **Configuration Overhead:** Requires extensive setup for basic TypeScript + HMR
- ❌ **Slower Development:** Multi-second dev server startup and slower HMR
- ❌ **Complexity:** Overkill for a simple game project
- ❌ **Learning Curve:** Steep configuration learning curve unnecessary for this scope

**When To Use Webpack:**

- ✅ Complex build requirements (custom loaders, advanced optimization)
- ✅ Legacy project migration
- ✅ Specific ecosystem requirements (certain enterprise plugins)
- ✅ Projects requiring very fine-grained build control

### Why Not esbuild?

**Rejected Due To:**

- ❌ **HMR Limitations:** No built-in dev server with HMR (requires additional tooling)
- ❌ **Type Checking:** Strips types without validation (must run tsc separately)
- ❌ **Developer Experience:** Lacks integrated development workflow
- ❌ **DIY Approach:** Requires building dev infrastructure yourself

**When To Use esbuild:**

- ✅ As a build primitive within custom tooling
- ✅ Projects prioritizing absolute raw build speed
- ✅ Simple bundling without dev server needs
- ✅ As part of a larger tool (like Vite does internally)

---

## Implementation Recommendation

### Quick Start with Vite

1. **Initialize Project:**

   ```bash
   npm create vite@latest . -- --template vanilla-ts
   ```

2. **Minimal `vite.config.ts` (optional):**

   ```typescript
   import { defineConfig } from "vite";

   export default defineConfig({
     base: "./",
     build: {
       target: "es2020",
       sourcemap: true,
     },
   });
   ```

3. **Enable Type Checking (optional but recommended):**

   ```bash
   npm install -D vite-plugin-checker
   ```

   Add to config:

   ```typescript
   import checker from "vite-plugin-checker";

   export default defineConfig({
     plugins: [checker({ typescript: true })],
   });
   ```

4. **Development workflow:**
   ```bash
   npm run dev    # Instant dev server with HMR
   npm run build  # Optimized production build
   ```

### Expected Performance

- **Dev Server Start:** < 500ms
- **HMR Updates:** < 50ms (instant game logic updates)
- **Production Build:** < 2 seconds (for typical game size)
- **Type Checking:** Run in IDE or separate tsc watch process

---

## Conclusion

For a browser-based TypeScript tic-tac-toe game with Canvas rendering, **Vite provides the best balance of speed, simplicity, and developer experience**. It requires minimal configuration while delivering instant feedback during development, which is crucial for iterative game development. The strong 2026 ecosystem and community support ensure long-term viability without the complexity overhead of Webpack or the DIY requirements of raw esbuild.

---

---

# Testing Framework Research: Jest vs Vitest

## Project Context

**Target Application:** Browser-based TypeScript tic-tac-toe game with TDD workflow

**Key Requirements:**

- TypeScript strict mode support
- Test-First Development (TDD) with fast feedback loop
- Canvas API mocking capabilities
- Unit tests for game logic (no browser dependencies)
- Watch mode for continuous TDD workflow
- Integration with Vite build tool (already selected)

---

## 1. Test Execution Speed

### Vitest

- **Initial Run:** Very fast (< 1 second for typical test suite)
- **Watch Mode:** Near-instant (< 100ms) due to Vite's module graph
- **Test Isolation:** Fast - uses lightweight worker threads
- **Parallel Execution:** Excellent - runs tests concurrently by default
- **Module Resolution:** Leverages Vite's cached module graph (no re-bundling)
- **HMR for Tests:** Instant test re-runs on code changes
- **Cold Start:** Minimal - reuses Vite's transformation pipeline
- **Benchmark (100 unit tests):** ~400-800ms

### Jest

- **Initial Run:** Slower (2-5 seconds for typical test suite)
- **Watch Mode:** Moderate (300-1000ms), requires module re-transformation
- **Test Isolation:** Moderate - uses vm contexts or worker processes
- **Parallel Execution:** Good - worker-based parallelization
- **Module Resolution:** Independent resolution, no build tool synergy
- **HMR for Tests:** Not applicable - full module re-evaluation
- **Cold Start:** Slower - must transform all modules independently
- **Benchmark (100 unit tests):** ~2-4 seconds

**Winner:** Vitest - 3-5x faster in TDD watch mode, crucial for fast feedback loops

---

## 2. TypeScript Integration

### Vitest

- **Type Support:** First-class - inherits Vite's TypeScript config
- **tsconfig.json:** Automatically respects all compiler options
- **Setup Complexity:** Zero additional configuration needed
- **Type Checking:** Uses same tsconfig as application code
- **Strict Mode:** Full support out-of-box
- **ES Modules:** Native ESM support (no transform needed)
- **Import Aliases:** Automatically resolves path mappings from tsconfig
- **Type Inference:** Excellent - full IntelliSense in test files
- **Source Maps:** Perfect - same transformer as dev environment
- **No Transform Mismatches:** Single transformation pipeline

**Configuration Example:**

```typescript
// vitest.config.ts - inherits from vite.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // TypeScript works automatically
  },
});
```

### Jest

- **Type Support:** Good but requires additional setup
- **tsconfig.json:** Requires ts-jest or babel preset configuration
- **Setup Complexity:** Moderate - needs transformer configuration
- **Type Checking:** Separate from application build config
- **Strict Mode:** Full support with proper ts-jest configuration
- **ES Modules:** Experimental - requires additional flags and config
- **Import Aliases:** Must manually configure moduleNameMapper
- **Type Inference:** Good with @types/jest installed
- **Source Maps:** Good but requires config matching
- **Transform Mismatches:** Risk of dev/test behavior divergence

**Configuration Example:**

```javascript
// jest.config.js - requires explicit TypeScript setup
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // Must duplicate tsconfig paths
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          // Must duplicate or reference tsconfig
        },
      },
    ],
  },
};
```

**Winner:** Vitest - Zero-config TypeScript with guaranteed consistency with application code

---

## 3. Mocking Capabilities for Canvas API

### Vitest

- **Built-in Mocking:** Excellent spy/mock/stub utilities
- **Canvas Mocking:** Requires manual mock or jsdom-canvas
- **Happy-DOM Support:** Built-in alternative to jsdom (faster, lighter)
- **Custom DOM Environment:** Easy to configure via test environment
- **Vi.mock():** Simple module mocking similar to Jest
- **Method Mocking:** Full support for Canvas2D methods
- **Easy Setup:** Direct integration with test environment

**Canvas Mock Example:**

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom", // or 'happy-dom'
    setupFiles: ["./test/setup.ts"],
  },
});

// test/setup.ts
import { vi } from "vitest";

HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
  if (contextType === "2d") {
    return {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      // ... other Canvas2D methods
    };
  }
  return null;
});
```

### Jest

- **Built-in Mocking:** Excellent - industry standard mocking utilities
- **Canvas Mocking:** Requires manual mock or jest-canvas-mock
- **JSDOM Support:** Standard, well-established
- **Custom DOM Environment:** More complex configuration
- **jest.mock():** Powerful but more complex module mocking
- **Method Mocking:** Full support for Canvas2D methods
- **Setup:** Requires more configuration boilerplate

**Canvas Mock Example:**

```javascript
// jest.config.js
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["./test/setup.js"],
};

// test/setup.js
global.HTMLCanvasElement.prototype.getContext = jest.fn((contextType) => {
  if (contextType === "2d") {
    return {
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      strokeRect: jest.fn(),
      fillText: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      // ... other Canvas2D methods
    };
  }
  return null;
});
```

**Winner:** Tie - Both provide equivalent mocking capabilities; Vitest has slightly simpler setup

---

## 4. Configuration Simplicity

### Vitest

**Complexity:** ⭐ (1/5)

- **Minimal Config:** Often zero configuration needed
- **Vite Integration:** Inherits entire Vite config automatically
- **Single Config File:** Can extend vite.config.ts or use vitest.config.ts
- **Sensible Defaults:** Works out-of-box for most use cases
- **No Transform Config:** Uses Vite's existing transformation pipeline
- **Path Resolution:** Automatic from tsconfig.json

**Minimal Configuration:**

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true, // Optional: use global test APIs
    environment: "jsdom",
  },
});
```

Or extend existing Vite config:

```typescript
// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  // ... existing Vite config
  test: {
    environment: "jsdom",
  },
});
```

### Jest

**Complexity:** ⭐⭐⭐⭐ (4/5)

- **Extensive Config:** Requires detailed configuration for TypeScript
- **Independent Setup:** Completely separate from build tool
- **Multiple Config Concerns:** Transform, module resolution, environment, etc.
- **Manual Path Mapping:** Must duplicate tsconfig path aliases
- **Transform Config:** Requires explicit ts-jest or babel setup
- **ESM Challenges:** Additional config for ES modules

**Typical Configuration:**

```javascript
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
};
```

**Winner:** Vitest - Dramatically simpler with near-zero configuration needed

---

## 5. Vitest + Vite Compatibility

### Vitest

- **Native Integration:** Built specifically for Vite
- **Shared Configuration:** Uses same vite.config.ts
- **Module Resolution:** Identical to dev environment
- **Plugin Compatibility:** Works with all Vite plugins automatically
- **Transformation Pipeline:** Same as development server
- **No Duplication:** Zero configuration duplication
- **Import Behavior:** 100% consistent between dev and test
- **Asset Handling:** Handles assets same as Vite (images, CSS, etc.)
- **Ecosystem Alignment:** Part of the Vite ecosystem
- **Maintenance:** Single tool chain to maintain

**Benefits:**

- ✅ Zero configuration divergence
- ✅ "What you dev is what you test"
- ✅ No transform mismatches
- ✅ Simplified mental model
- ✅ Single source of truth for module resolution

### Jest

- **Vite Integration:** Not integrated - separate tool
- **Shared Configuration:** Requires manual duplication
- **Module Resolution:** Must manually replicate Vite's behavior
- **Plugin Compatibility:** No Vite plugin support
- **Transformation Pipeline:** Completely independent (ts-jest/babel)
- **Configuration Duplication:** Must mirror tsconfig and Vite config
- **Import Behavior:** Risk of dev/test environment divergence
- **Asset Handling:** Requires separate mock configuration
- **Ecosystem Alignment:** From different ecosystem (Facebook/Meta)
- **Maintenance:** Two separate tool chains

**Challenges:**

- ❌ Configuration drift risk
- ❌ Different module resolution behavior
- ❌ Must manually sync path aliases
- ❌ Higher cognitive overhead
- ❌ Potential for subtle bugs

**Winner:** Vitest - Purpose-built for Vite, eliminates configuration duplication and drift

---

## 6. TDD Workflow (Watch Mode & Fast Rebuilds)

### Vitest

- **Watch Mode:** Blazingly fast (< 100ms per file change)
- **Intelligent Re-runs:** Only re-runs affected tests via module graph
- **File Watching:** Uses Vite's battle-tested file watcher
- **Fast Feedback:** Near-instant feedback on code changes
- **UI Mode:** Built-in browser-based UI for test visualization
- **HMR Integration:** Leverages Vite's HMR for test updates
- **Incremental Updates:** Only transforms changed modules
- **Resource Efficiency:** Low memory footprint in watch mode
- **TDD Flow:** Natural red → green → refactor cycle
- **Test Filtering:** Fast pattern-based test filtering

**TDD Workflow:**

```bash
npm run test -- --watch --ui  # Browser UI for test results
```

**Watch Mode Features:**

- Instant feedback (< 100ms)
- Interactive test filtering
- Coverage updates in real-time
- Browser UI for visual feedback
- Keyboard shortcuts for test control

### Jest

- **Watch Mode:** Good but slower (300-1000ms per file change)
- **Intelligent Re-runs:** Uses git status and heuristics
- **File Watching:** Custom file watcher implementation
- **Fast Feedback:** Moderate - noticeable lag on changes
- **UI Mode:** No built-in UI (third-party extensions available)
- **HMR Integration:** Not applicable
- **Incremental Updates:** Re-transforms modules as needed
- **Resource Efficiency:** Higher memory usage over time
- **TDD Flow:** Functional but with more latency
- **Test Filtering:** Good pattern-based filtering

**TDD Workflow:**

```bash
npm run test -- --watch  # Terminal-only interface
```

**Watch Mode Features:**

- Moderate feedback speed (300-1000ms)
- Terminal-based filtering
- Coverage updates available
- Well-documented watch commands

**Winner:** Vitest - 3-10x faster watch mode, essential for effective TDD

---

## Decision

**Recommended Tool: Vitest**

---

## Rationale

Vitest is the optimal choice for this tic-tac-toe game project with TDD workflow because:

1. **Perfect Vite Integration**
   - Zero configuration overhead
   - Shares exact same module resolution and transformation
   - Eliminates risk of dev/test environment divergence
   - Single source of truth for all TypeScript configuration

2. **Superior TDD Experience**
   - Near-instant feedback (< 100ms) in watch mode
   - 3-5x faster than Jest for typical test suites
   - Built-in UI mode for visual test feedback
   - Excellent for red → green → refactor workflow

3. **TypeScript Excellence**
   - Automatically inherits tsconfig.json settings
   - Zero additional TypeScript configuration
   - Perfect type inference and IntelliSense
   - Guaranteed strict mode compliance

4. **Canvas API Mocking**
   - Equivalent mocking capabilities to Jest
   - Simpler setup with jsdom or happy-dom
   - Easy Canvas2D method mocking via vi.mock()
   - Lightweight happy-dom option for faster tests

5. **Configuration Simplicity**
   - Near-zero configuration required
   - Extends vite.config.ts seamlessly
   - No path alias duplication needed
   - Minimal maintenance burden

6. **Modern Architecture**
   - Native ES modules support (no experimental flags)
   - Leverages Vite's proven transformation pipeline
   - Worker-based parallel execution
   - Fast and efficient module graph reuse

7. **Excellent DX**
   - Browser-based UI for test results
   - Instant feedback on code changes
   - Lower cognitive overhead
   - Natural fit for Vite projects

---

## Alternatives Considered

### Why Not Jest?

**Rejected Due To:**

- ❌ **Slower Feedback Loop:** 3-10x slower watch mode undermines TDD effectiveness
- ❌ **Configuration Overhead:** Requires extensive setup for TypeScript + ESM
- ❌ **Configuration Duplication:** Must manually replicate Vite and tsconfig settings
- ❌ **Divergence Risk:** Separate transformation pipeline can cause dev/test inconsistencies
- ❌ **ESM Challenges:** Experimental ES module support requires additional configuration
- ❌ **No Vite Synergy:** Completely independent tool chain

**When To Use Jest:**

- ✅ Legacy projects already using Jest (migration cost)
- ✅ Projects using Webpack or non-Vite build tools
- ✅ Teams with deep Jest expertise unwilling to switch
- ✅ Specific Jest ecosystem requirements (certain plugins)
- ✅ Projects requiring Jest's snapshot testing features (though Vitest supports this too)

---

## Implementation Recommendation

### Quick Start with Vitest

1. **Install Vitest:**

   ```bash
   npm install -D vitest jsdom @vitest/ui
   ```

2. **Configure Vitest:**

   ```typescript
   // vite.config.ts
   import { defineConfig } from "vite";

   export default defineConfig({
     // ... existing Vite config
     test: {
       globals: true,
       environment: "jsdom",
       setupFiles: "./test/setup.ts",
       coverage: {
         provider: "v8",
         reporter: ["text", "html"],
       },
     },
   });
   ```

3. **Setup Canvas Mocking:**

   ```typescript
   // test/setup.ts
   import { vi } from "vitest";

   // Mock Canvas API
   HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
     if (contextType === "2d") {
       return {
         fillRect: vi.fn(),
         clearRect: vi.fn(),
         strokeRect: vi.fn(),
         fillText: vi.fn(),
         strokeText: vi.fn(),
         beginPath: vi.fn(),
         moveTo: vi.fn(),
         lineTo: vi.fn(),
         arc: vi.fn(),
         stroke: vi.fn(),
         fill: vi.fn(),
         closePath: vi.fn(),
         save: vi.fn(),
         restore: vi.fn(),
         setTransform: vi.fn(),
         measureText: vi.fn(() => ({ width: 0 })),
         // Add other Canvas2D methods as needed
       };
     }
     return null;
   });
   ```

4. **Add Test Scripts:**

   ```json
   // package.json
   {
     "scripts": {
       "test": "vitest",
       "test:ui": "vitest --ui",
       "test:coverage": "vitest --coverage"
     }
   }
   ```

5. **TDD Workflow:**
   ```bash
   npm run test:ui  # Opens browser UI with instant feedback
   # Or terminal-only:
   npm run test     # Watch mode by default
   ```

### Example Test File

```typescript
// src/game/Board.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { Board } from "./Board";

describe("Board", () => {
  let board: Board;

  beforeEach(() => {
    board = new Board();
  });

  it("should create a 3x3 empty board", () => {
    expect(board.size).toBe(3);
    expect(board.isEmpty()).toBe(true);
  });

  it("should place a marker at valid position", () => {
    const success = board.placeMarker(0, 0, "X");
    expect(success).toBe(true);
    expect(board.getCell(0, 0)).toBe("X");
  });

  it("should reject placing marker on occupied cell", () => {
    board.placeMarker(0, 0, "X");
    const success = board.placeMarker(0, 0, "O");
    expect(success).toBe(false);
  });

  it("should detect winning condition", () => {
    board.placeMarker(0, 0, "X");
    board.placeMarker(0, 1, "X");
    board.placeMarker(0, 2, "X");
    expect(board.checkWinner()).toBe("X");
  });
});
```

### Expected Performance

- **Initial Test Run:** < 1 second
- **Watch Mode Updates:** < 100ms per file change
- **100 Unit Tests:** ~400-800ms
- **Coverage Generation:** ~1-2 seconds
- **UI Mode Startup:** ~500ms

### TDD Workflow Benefits

- **Instant Feedback:** See test results immediately after code changes
- **Visual UI:** Browser-based interface for better test visibility
- **Efficient Iteration:** Focus on failing tests quickly
- **Low Friction:** Minimal delay between writing code and seeing results
- **Enhanced Focus:** Fast feedback keeps you in flow state

---

## Conclusion

For a browser-based TypeScript tic-tac-toe game developed with Vite and following TDD practices, **Vitest is the superior choice**. It provides near-perfect integration with the existing Vite toolchain, dramatically faster test execution (crucial for TDD), and requires virtually zero configuration. The 3-10x speed advantage in watch mode directly translates to a more effective TDD workflow, enabling rapid red → green → refactor cycles. Combined with TypeScript strict mode support out-of-box and equivalent Canvas mocking capabilities, Vitest offers the best developer experience while maintaining consistency between development and test environments.
