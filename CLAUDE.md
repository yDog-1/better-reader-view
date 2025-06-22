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

- Main logic for toggling reader view
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

- `popupMsg.tsx`: Toast-style error notifications
- `ui.tsx`: Placeholder UI component (currently unused)

### Reader View Flow

1. User clicks extension icon → background script injects content script
2. Content script checks `sessionStorage.getItem('readerViewActive')`
3. **If inactive**:
   - Extract content using pure functions
   - Store original HTML in sessionStorage
   - Replace page with reader view HTML
4. **If active**:
   - Restore original HTML from sessionStorage
   - Clear sessionStorage keys

### Tech Stack

- **Framework**: WXT (Web Extension Toolkit) with React 19
- **Content Parsing**: @mozilla/readability for article extraction
- **HTML Sanitization**: DOMPurify for XSS prevention
- **State Management**: SessionStorage for toggle state and page backup
- **Testing**: Vitest with WXT testing utilities
- **Type Safety**: Full TypeScript with strict configuration
- **Build Tool**: Bun as package manager and task runner

### WXT Directory Structure

WXT follows a convention-over-configuration approach:

- **`entrypoints/`**: Extension entry points (background, content scripts)
- **`components/`**: React components (auto-imported project-wide)
- **`utils/`**: Generic utilities (auto-imported project-wide) - **contains core reader logic**
- **`public/`**: Static files (extension icons)
- **`tests/`**: Vitest test files (`*.test.ts`, `*.spec.ts`)

**Auto-Import System:**
WXT automatically imports from `components/`, `utils/`, `hooks/`, and `composables/` directories.

## Testing

This project uses Vitest with WXT's testing utilities for unit testing browser extension functionality.

### WXT Testing Setup

- WXT provides `WxtVitest` plugin with polyfills for extension APIs
- Uses `@webext-core/fake-browser` for mocking browser APIs
- Key utilities: `import { fakeBrowser } from 'wxt/testing'`
- Test files: `*.test.ts` or `*.spec.ts`

### Testing Focus

Current tests focus on pure functions in `utils/reader-utils.ts`:

- HTML generation and structure validation
- XSS prevention through DOMPurify sanitization
- CSS styling inclusion
- Edge cases (empty content, special characters)

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
