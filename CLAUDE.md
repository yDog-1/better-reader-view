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
- `bun run test:integration` - Run integration tests with classical approach
- Run single test: `bunx vitest tests/specific-test.test.ts`

### Code Quality

- `bun run lint` - Run ESLint on codebase
- `bun fmt` - Format code with Prettier
- `bun run fix` - Auto-fix issues (lint + format combined)
- `bun run ci` - Complete quality check (fix + test + test:integration + compile)

## Git Workflow

- Do not commit without explicit permission from the user
- Before committing, always run: `bun run fix && bun test && bun run test:integration && bun run compile`

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

This project uses a comprehensive dual testing approach with Vitest for browser extension functionality.

### Dual Testing Strategy

1. **Standard Unit Tests** (`vitest.config.ts`)

   - Uses `happy-dom` environment for fast execution
   - Comprehensive mocking for CSS-in-JS and components
   - Setup file: `tests/setup.ts`
   - Patterns: `*.test.ts`, `*.spec.ts`

2. **Integration Tests** (`vitest.integration.config.ts`)
   - Classical testing approach with minimal mocking
   - Real Shadow DOM polyfills for realistic browser behavior
   - Setup file: `tests/setup-integration.ts`
   - Patterns: `*.classical.test.ts`, `*.classical.test.tsx`

### Test Coverage

- **Component Tests**: ReaderView, StylePanel with user interactions
- **Unit Tests**: StyleController, reader utilities, error handling
- **Integration Tests**: End-to-end reader view functionality
- **E2E Scenarios**: Complete user workflows with real DOM behavior

### Key Testing Utilities

- `@testing-library/react` and `@testing-library/jest-dom` for component testing
- Custom mocks for Vanilla Extract CSS-in-JS
- Shadow DOM polyfills for realistic browser extension testing
- WXT browser API mocking via `@webext-core/fake-browser`

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
