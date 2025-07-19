# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `bun dev` - Start development server for Chrome
- `bun run dev:firefox` - Start development server for Firefox
- `bun run build` - Build extension for production (Chrome)
- `bun run build:firefox` - Build extension for Firefox
- `bun run zip` - Create distributable zip for Chrome
- `bun run zip:firefox` - Create distributable zip for Firefox
- `bun run compile` - Type check without emitting files
- `bun test` - Run tests in watch mode (uses `bunx vitest`)
- `bun test run` - Run tests once without watch mode
- `bun test <pattern>` - Run specific test files (e.g., `bun test ReaderView`)
- `bun run lint` - Run ESLint on codebase
- `bun fmt` - Format code with Prettier (`prettier --write .`)
- `bun run fix` - Auto-fix issues (lint + format): `eslint . --fix && prettier --write .`

## Git Workflow

- Do not commit without explicit permission from the user
- Before committing, always run: `bun run fix && bun run test && bun run compile`

## Architecture

This is a WXT-based browser extension that implements a reader view using a functional programming approach with pure functions.

### Core Implementation

#### Background Script (`entrypoints/background.ts`)

- Handles browser action clicks
- Injects content script into active tab

#### Content Script (`entrypoints/content/index.tsx`)

- Main logic for toggling reader view using `ReaderViewManager`
- Initializes `StyleController` for theme management
- Japanese error messages for user-facing text
- React-based popup notifications for errors

#### Core System (`utils/reader-utils.ts`)

**ReaderViewManager Class:**

- Manages reader view lifecycle and Shadow DOM rendering
- Uses `browser.storage.session` for state persistence
- Creates isolated Shadow DOM to avoid CSS conflicts with host page

**Key Functions:**

- `extractContent(document: Document)`: Extracts article content using Mozilla Readability

  - Returns `Article` interface with metadata (title, content, byline, etc.)
  - Uses document cloning to avoid side effects
  - Includes DOMPurify sanitization for security

- `activateReader(document: Document)`: Creates Shadow DOM reader view

  - Uses `ReaderViewManager` to render React components in Shadow DOM
  - Preserves original page for restoration
  - Returns boolean indicating success/failure

- `deactivateReader()`: Restores original page content
  - Removes Shadow DOM reader view
  - Cleans up storage state

#### React Components (`components/`)

- `ReaderView.tsx`: Main reader view component with article content and style controls
- `StylePanel.tsx`: Settings panel for theme, font size, and font family selection
- `popupMsg.tsx`: Toast-style error notifications
- `ui.tsx`: Placeholder UI component (currently unused)

### Reader View Flow

1. User clicks extension icon → background script injects content script
2. Content script initializes `StyleController` and checks `browser.storage.session` state
3. **If inactive**:
   - Extract content using `extractContent()` with Mozilla Readability
   - Create Shadow DOM container to isolate styles
   - Render React `ReaderView` component with `StylePanel` controls
   - Store state in `browser.storage.session`
4. **If active**:
   - Remove Shadow DOM reader view
   - Clear browser storage state

### Tech Stack

- **Framework**: WXT (Web Extension Toolkit) with React 19
- **Content Parsing**: @mozilla/readability for article extraction
- **HTML Sanitization**: DOMPurify for XSS prevention
- **State Management**: Browser storage API (`browser.storage.session`)
- **Style System**: CSS-in-JS with Shadow DOM isolation and `StyleController`
- **Testing**: Vitest with WXT testing utilities and JSDOM
- **Type Safety**: Full TypeScript with strict configuration
- **Build Tool**: Bun as package manager and task runner

### WXT Directory Structure

WXT follows a convention-over-configuration approach:

- **`entrypoints/`**: Extension entry points (background, content scripts)
- **`components/`**: React components (auto-imported project-wide)
- **`utils/`**: Core utilities (auto-imported project-wide):
  - `reader-utils.ts`: Main reader logic and ReaderViewManager
  - `StyleController.ts`: Theme and style management
  - `StyleSheetManager.ts`: CSS injection for Shadow DOM
  - `types.ts`: TypeScript interfaces and type definitions
  - `theme.css`: CSS variables for theming
- **`public/`**: Static files (extension icons)
- **`tests/`**: Vitest test files (`*.test.ts`, `*.spec.ts`)

**Auto-Import System:**
WXT automatically imports from `components/`, `utils/`, `hooks/`, and `composables/` directories.

## Testing

This project uses Vitest with WXT's testing utilities for unit testing browser extension functionality.

### WXT Testing Setup

- **Test Runner**: Vitest with `happy-dom` environment for fast DOM simulation
- **Extension APIs**: WXT provides `WxtVitest` plugin with `fakeBrowser` for mocking
- **DOM Testing**: JSDOM for complex document manipulation tests
- **React Testing**: `@testing-library/react` for component testing
- Test files: `*.test.ts` or `*.spec.ts`

### Testing Focus

Tests cover multiple architectural layers:

**Core Functions** (`reader-utils.test.ts`):

- Content extraction with Mozilla Readability
- Shadow DOM rendering and lifecycle management
- ReaderViewManager state handling

**React Components** (`ReaderView.test.tsx`, `StylePanel.test.tsx`):

- Component rendering and user interactions
- StyleController integration
- Theme switching and style application

**System Integration** (`*Integration.test.ts`):

- End-to-end reader view activation/deactivation
- Cross-component communication
- Browser storage persistence

### Styling Architecture

This project uses CSS-in-JS with inline CSS imports and CSS variables for theming:

- **CSS Modules**: `ReaderView.css`, `StylePanel.css`, and `theme.css` imported as `?inline` strings
- **Theme System**: CSS custom properties (variables) defined in `utils/theme.css`
- **Shadow DOM**: Styles are injected into Shadow DOM to avoid page conflicts
- **StyleController**: Manages theme switching and style injection

#### Testing CSS Components

- **Theme Classes**: Test theme class application via `styleController.getThemeClass()`
- **CSS Injection**: Verify styles are properly injected into Shadow DOM
- **Dynamic Styling**: Test theme switching and font size adjustments

```typescript
// Test theme application
expect(element).toHaveClass(styleController.getThemeClass());

// Test style injection in Shadow DOM
expect(shadowRoot.querySelector('style')).toContainText('theme-light');
```

## Development Patterns

- **Pure Functions**: Core logic separated into testable, side-effect-free functions
- **Type Safety**: Full TypeScript with strict configuration and type guards
- **Functional Programming**: Emphasis on immutability and pure function composition
- **Error Handling**: Graceful fallbacks with user-friendly Japanese error messages
- **HTML Security**: DOMPurify sanitization to prevent XSS vulnerabilities

## Extension Globals

ESLint is configured with WXT-specific globals:

- `defineBackground`: For background script entry points
- `defineContentScript`: For content script entry points
- `createShadowRootUi`: For shadow DOM UI creation (currently unused)
