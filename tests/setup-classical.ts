import '@testing-library/jest-dom';
import { vi, beforeAll, afterAll } from 'vitest';

/**
 * 古典学派テスト用セットアップ
 * モックを最小限に抑制し、実際のプロダクション環境に近い状態でテストを実行
 */

// Browser APIs のモック（必要最小限）
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(() => undefined),
    removeItem: vi.fn(() => undefined),
    clear: vi.fn(() => undefined),
  },
  writable: true,
});

// Performance API のモック
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
  },
  writable: true,
});

// Shadow DOM のポリフィル（テスト環境で必要）
if (typeof window !== 'undefined' && !window.Element.prototype.attachShadow) {
  window.Element.prototype.attachShadow = function (_options) {
    const shadowRoot = document.createElement('div');
    shadowRoot.style.cssText = 'all: initial;';
    this.appendChild(shadowRoot);
    return shadowRoot as unknown as ShadowRoot;
  };
}

// createRoot のモック（React 18対応）
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
    unmount: vi.fn(),
  })),
}));

// vanilla-extract CSS-in-JS の最小限モック（ビルドツール依存のため）
vi.mock('@vanilla-extract/dynamic', () => ({
  assignInlineVars: vi.fn((vars: Record<string, string>) => vars),
}));

// CSS modules の基本モック（テスト環境の制約のため）
vi.mock('../utils/theme.css.ts', () => ({
  themeVars: {
    color: {
      text: '--text-color',
      background: '--bg-color',
      accent: '--accent-color',
      border: '--border-color',
    },
    font: {
      family: '--font-family',
      size: {
        small: '--font-size-small',
        medium: '--font-size-medium',
        large: '--font-size-large',
        xlarge: '--font-size-xlarge',
      },
      weight: {
        normal: '--font-weight-normal',
        bold: '--font-weight-bold',
      },
    },
    spacing: {
      small: '--spacing-small',
      medium: '--spacing-medium',
      large: '--spacing-large',
    },
    borderRadius: {
      small: '--border-radius-small',
      medium: '--border-radius-medium',
    },
  },
  lightTheme: 'light-theme-class',
  darkTheme: 'dark-theme-class',
  sepiaTheme: 'sepia-theme-class',
}));

vi.mock('../components/ReaderView.css.ts', () => ({
  readerContainer: 'reader-container',
  contentContainer: 'content-container',
  title: 'title',
  contentArea: 'content-area',
  styleButton: 'style-button',
}));

vi.mock('../components/StylePanel.css.ts', () => ({
  panel: 'panel',
  panelTitle: 'panel-title',
  controlGroup: 'control-group',
  label: 'label',
  select: 'select',
  button: 'button',
  closeButton: 'close-button',
}));

// Console エラーを抑制（テスト実行時の見やすさのため）
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
