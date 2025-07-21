import { ThemeDefinition } from './types';

/**
 * 組み込みテーマの定義
 * 新しいテーマはここに追加するか、外部から registerTheme() で追加可能
 */
export const builtInThemes: ThemeDefinition[] = [
  {
    id: 'light',
    name: 'ライト',
    className: 'theme-light',
    cssVariables: {
      '--bg-color': '#ffffff',
      '--text-color': '#333333',
      '--link-color': '#0066cc',
      '--border-color': '#e0e0e0',
      '--panel-bg-color': '#f8f9fa',
      '--button-bg-color': '#ffffff',
      '--button-border-color': '#dee2e6',
      '--button-hover-bg-color': '#e9ecef',
      '--selection-bg-color': '#b3d4fc',
      '--code-bg-color': '#f8f9fa',
      '--blockquote-border-color': '#dee2e6',
      '--hr-color': '#e0e0e0',
    },
  },
  {
    id: 'dark',
    name: 'ダーク',
    className: 'theme-dark',
    cssVariables: {
      '--bg-color': '#1a1a1a',
      '--text-color': '#e0e0e0',
      '--link-color': '#66b3ff',
      '--border-color': '#404040',
      '--panel-bg-color': '#2d2d2d',
      '--button-bg-color': '#2d2d2d',
      '--button-border-color': '#404040',
      '--button-hover-bg-color': '#404040',
      '--selection-bg-color': '#4d5566',
      '--code-bg-color': '#2d2d2d',
      '--blockquote-border-color': '#404040',
      '--hr-color': '#404040',
    },
  },
  {
    id: 'sepia',
    name: 'セピア',
    className: 'theme-sepia',
    cssVariables: {
      '--bg-color': '#f4f1ea',
      '--text-color': '#5c4b37',
      '--link-color': '#8b4513',
      '--border-color': '#d4c5a9',
      '--panel-bg-color': '#ede6d3',
      '--button-bg-color': '#f4f1ea',
      '--button-border-color': '#d4c5a9',
      '--button-hover-bg-color': '#ede6d3',
      '--selection-bg-color': '#d4c5a9',
      '--code-bg-color': '#ede6d3',
      '--blockquote-border-color': '#d4c5a9',
      '--hr-color': '#d4c5a9',
    },
  },
];

/**
 * 組み込みテーマのIDの型定義
 * 型安全性のために使用
 */
export type BuiltInThemeId = 'light' | 'dark' | 'sepia';

/**
 * 特定の組み込みテーマを取得
 */
export function getBuiltInTheme(id: BuiltInThemeId): ThemeDefinition | null {
  return builtInThemes.find((theme) => theme.id === id) || null;
}
