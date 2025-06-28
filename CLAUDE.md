# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

- `bun dev` - Start development server for Chrome
- `bun run dev:firefox` - Start development server for Firefox
- `bun run build` - Build extension for production (Chrome)
- `bun run build:firefox` - Build extension for Firefox
- `bun run zip` - Create distributable zip for Chrome
- `bun run zip:firefox` - Create distributable zip for Firefox
- `bun run compile` - Type check without emitting files

### Testing

- `bun test` - Run unit tests in watch mode (uses Vitest)
- `bun run test:e2e` - Run E2E tests with Playwright
- `bun run test:e2e:headed` - Run E2E tests in headed mode (visible browser)
- `bun run test:e2e:debug` - Run E2E tests in debug mode with Playwright inspector
- Run single test: `bunx vitest tests/specific-test.test.ts`

### Code Quality

- `bun run lint` - Run ESLint on codebase
- `bun fmt` - Format code with Prettier
- `bun run fix` - Auto-fix issues (lint + format combined)
- `bun run ci` - Complete quality check (fix + test + test:e2e + compile)

## Git Workflow

- Do not commit without explicit permission from the user
- Before committing, always run: `bun run ci`

## CI/CD

The project uses GitHub Actions with Playwright's official workflow pattern:

- **CI Environment**: Automatically detects CI via `process.env.CI` for headless browser testing
- **Playwright Setup**: Uses `bunx playwright install --with-deps` for browser dependencies
- **Test Reports**: Uploaded as artifacts with 30-day retention
- **Quality Gates**: All tests, linting, formatting, and TypeScript compilation must pass

## Architecture

This is a WXT-based browser extension that implements a reader view using a functional programming approach with pure functions.

### Core Implementation

#### Background Script (`entrypoints/background.ts`)

- Handles browser action clicks
- Injects content script into active tab

#### Content Script (`entrypoints/content/index.tsx`)

- Main logic for toggling reader view using React components
- Renders ReaderView component in isolated Shadow DOM
- Uses sessionStorage for state persistence with keys:
  - `readerViewActive`: Boolean state
  - `originalPageHTML`: Backup of original page
  - `originalPageTitle`: Original page title
- Japanese error messages for user-facing text
- React-based popup notifications for errors

#### Pure Functions Library (`utils/reader-utils.ts`)

**Core pure functions that can be imported and tested independently:**

- `extractContent(document: Document)`: Extracts article content using Mozilla Readability

  - Returns `{ title: string, content: string } | null`
  - Uses document cloning to avoid side effects
  - Includes DOMPurify sanitization for security
  - Includes type guards for robust error handling

- `renderReaderView(content: { title: string, content: string })`: Generates reader view HTML

  - Returns complete HTML document string
  - Includes embedded CSS for typography and layout

- `activateReader(document: Document)`: Orchestrates content extraction and rendering
  - Combines the above pure functions
  - Modifies `document.documentElement.innerHTML` when successful
  - Returns boolean indicating success/failure

#### Shared Components (`components/`)

- `ReaderView.tsx`: Main reader view component with extracted content display
- `StylePanel.tsx`: Customizable style controls for theme, font size, and layout
- `popupMsg.tsx`: Toast-style error notifications

### Reader View Flow

1. User clicks extension icon → background script injects content script
2. Content script checks `sessionStorage.getItem('readerViewActive')`
3. **If inactive**:
   - Extract content using pure functions
   - Store original HTML in sessionStorage
   - Create Shadow DOM with React ReaderView component
   - StyleController manages theme and user preferences
4. **If active**:
   - Restore original HTML from sessionStorage
   - Clear sessionStorage keys
   - Remove Shadow DOM

### Tech Stack

- **Framework**: WXT (Web Extension Toolkit) with React 19
- **Content Parsing**: @mozilla/readability for article extraction
- **HTML Sanitization**: DOMPurify for XSS prevention
- **Styling**: Vanilla Extract for type-safe CSS-in-JS
- **State Management**: SessionStorage for toggle state and StyleController for theme management
- **Testing**: Vitest with WXT testing utilities, dual testing approach (standard + integration)
- **Type Safety**: Full TypeScript with strict configuration
- **Build Tool**: Bun as package manager and task runner

### WXT Directory Structure

WXT follows a convention-over-configuration approach:

- **`entrypoints/`**: Extension entry points (background, content scripts)
- **`components/`**: React components (auto-imported project-wide)
- **`utils/`**: Generic utilities (auto-imported project-wide) - **contains core reader logic**
- **`public/`**: Static files (extension icons)
- **`tests/`**: Comprehensive test suite with dual approach (standard + integration tests)

**Auto-Import System:**
WXT automatically imports from `components/`, `utils/`, `hooks/`, and `composables/` directories.

## Testing

This project uses a modern testing approach combining unit tests and E2E tests for comprehensive coverage.

### Testing Strategy

1. **Unit Tests** (`vitest.config.ts`)

   - Uses `happy-dom` environment for fast execution
   - Component and utility function testing
   - Setup file: `tests/setup.ts`
   - Patterns: `*.test.ts`, `*.test.tsx`

2. **E2E Tests** (`playwright.config.ts`)

   - Real browser testing with Playwright
   - Complete user workflows and browser extension behavior
   - Setup file: `tests/e2e/`
   - Patterns: `tests/e2e/*.spec.ts`

3. **Error Scenario Tests** (`tests/error-scenarios.test.tsx`)
   - Comprehensive error handling validation
   - Edge cases and failure recovery testing
   - Browser compatibility and permission errors

### Test Coverage

- **Component Tests**: ReaderView, StylePanel with user interactions
- **Unit Tests**: StyleController, reader utilities, pure functions
- **E2E Tests**: Complete browser extension workflows
- **Error Handling**: DOM manipulation, storage, and component errors

### Key Testing Utilities

- `@testing-library/react` and `@testing-library/jest-dom` for component testing
- `@playwright/test` for E2E browser automation
- Custom mocks for Vanilla Extract CSS-in-JS (unit tests only)
- Real browser APIs and Shadow DOM in E2E tests

### CI/E2E Testing Specifics

- **Environment Detection**: Tests automatically switch to headless mode in CI (`process.env.CI === 'true'`)
- **Browser Extension Loading**: Custom Playwright fixtures load WXT-built extension from `.output/chrome-mv3`
- **Service Worker Integration**: Extension ID extraction from background service worker URL
- **ESLint Configuration**: E2E tests have access to Node.js `process` global for environment detection

## Development Patterns

- **Pure Functions**: Core logic separated into testable, side-effect-free functions
- **Type Safety**: Full TypeScript with strict configuration and type guards
- **Functional Programming**: Emphasis on immutability and pure function composition
- **Component Architecture**: Modern React patterns with Shadow DOM isolation
- **CSS-in-JS**: Vanilla Extract for type-safe styling with theme management
- **Error Handling**: Graceful fallbacks with user-friendly Japanese error messages
- **HTML Security**: DOMPurify sanitization to prevent XSS vulnerabilities
- **Browser Extension Best Practices**: Minimal permissions, isolated execution context

## Key Utilities and Classes

### StyleController (`utils/StyleController.ts`)

Manages theme and styling preferences:

- Theme management (light/dark/auto)
- Font size and family customization
- Column width and line height controls
- Immutable configuration updates
- Persistence via localStorage

### Error Handling (`utils/errors.ts`)

Custom error types with Japanese user messages:

- `ReaderViewError`: Base error class
- `ContentExtractionError`: Content parsing failures
- `RenderingError`: UI rendering issues

### Theme System (`utils/theme.css.ts`)

Vanilla Extract theme definitions:

- Color schemes for light/dark modes
- Typography scales and font families
- Layout spacing and breakpoints
- Japanese font support

## WXT-Specific Features

### Auto-Import System

WXT automatically imports from:

- `components/` - React components
- `utils/` - Utilities and business logic
- `hooks/` - Custom React hooks
- `composables/` - Composition functions

### Extension Globals

ESLint is configured with WXT-specific globals:

- `defineBackground`: For background script entry points
- `defineContentScript`: For content script entry points
- `createShadowRootUi`: For shadow DOM UI creation

## Important Implementation Notes

- **Japanese Localization**: User-facing error messages and comments are in Japanese
- **Security**: All content extraction uses DOMPurify sanitization to prevent XSS attacks
- **State Persistence**: Reader view state persists across page reloads using sessionStorage
- **Shadow DOM Isolation**: UI components render in isolated Shadow DOM to avoid CSS conflicts
- **Extension Permissions**: Minimal permissions approach with content script injection only when needed
- **Browser Compatibility**: Chrome MV3 focused with Firefox support available via separate build commands
