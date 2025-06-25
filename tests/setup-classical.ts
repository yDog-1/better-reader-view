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

// React act()警告の抑制（実際にはVitestが制御しているため効果は限定的）
// 古典学派テストでの警告ノイズ削減のための試行
type ProcessLike = {
  stderr: {
    write: (
      chunk: string | Uint8Array,
      encoding?: string | (() => void),
      callback?: () => void
    ) => boolean;
  };
};

const globalProcess = (globalThis as Record<string, unknown>).process as
  | ProcessLike
  | undefined;
const originalStderrWrite = globalProcess?.stderr?.write;

beforeAll(() => {
  if (originalStderrWrite && globalProcess) {
    globalProcess.stderr.write = function (
      chunk: string | Uint8Array,
      encoding?: string | (() => void),
      callback?: () => void
    ) {
      const output = chunk.toString();

      // act()警告をフィルタリング
      if (
        output.includes('not wrapped in act') ||
        output.includes('Warning: An update to') ||
        output.includes(
          'When testing, code that causes React state updates should be wrapped into act'
        )
      ) {
        // 警告を出力しない
        if (typeof encoding === 'function') encoding();
        if (callback) callback();
        return true;
      }

      // その他のエラーは通常通り出力
      return originalStderrWrite.call(this, chunk, encoding, callback);
    };
  }
});

afterAll(() => {
  if (originalStderrWrite && globalProcess) {
    globalProcess.stderr.write = originalStderrWrite;
  }
});
