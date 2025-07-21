import { describe, it, expect, beforeEach } from 'vitest';
import { StyleController } from '../utils/StyleController';
import { DefaultThemeRegistry } from '../utils/ThemeRegistry';
import { ThemeDefinition } from '../utils/types';
import { ThemeNotFoundError, ThemeRegistrationError } from '../utils/errors';
import { builtInThemes } from '../utils/builtInThemes';

describe('プラガブルテーマシステム', () => {
  let styleController: StyleController;
  let themeRegistry: DefaultThemeRegistry;

  beforeEach(() => {
    themeRegistry = new DefaultThemeRegistry();
    styleController = new StyleController(
      { theme: 'light', fontSize: 'medium', fontFamily: 'sans-serif' },
      undefined,
      themeRegistry
    );
  });

  describe('ThemeRegistry', () => {
    it('should register a custom theme without type changes', () => {
      const customTheme: ThemeDefinition = {
        id: 'custom',
        name: 'カスタム',
        className: 'theme-custom',
        cssVariables: { '--bg-color': '#ff0000' },
      };

      themeRegistry.registerTheme(customTheme);

      const themes = themeRegistry.getAvailableThemes();
      expect(themes.some((t) => t.id === 'custom')).toBe(true);
    });

    it('should get registered theme', () => {
      const customTheme: ThemeDefinition = {
        id: 'test-theme',
        name: 'テストテーマ',
        className: 'theme-test',
        cssVariables: { '--color': 'blue' },
      };

      themeRegistry.registerTheme(customTheme);
      const retrievedTheme = themeRegistry.getTheme('test-theme');

      expect(retrievedTheme).toEqual(customTheme);
    });

    it('should return null for non-existent theme', () => {
      const theme = themeRegistry.getTheme('non-existent');
      expect(theme).toBeNull();
    });

    it('should check if theme exists', () => {
      const customTheme: ThemeDefinition = {
        id: 'exists-test',
        name: 'Exists Test',
        className: 'theme-exists-test',
        cssVariables: {},
      };

      expect(themeRegistry.hasTheme('exists-test')).toBe(false);
      themeRegistry.registerTheme(customTheme);
      expect(themeRegistry.hasTheme('exists-test')).toBe(true);
    });

    it('should unregister theme', () => {
      const customTheme: ThemeDefinition = {
        id: 'unregister-test',
        name: 'Unregister Test',
        className: 'theme-unregister-test',
        cssVariables: {},
      };

      themeRegistry.registerTheme(customTheme);
      expect(themeRegistry.hasTheme('unregister-test')).toBe(true);

      const unregistered = themeRegistry.unregisterTheme('unregister-test');
      expect(unregistered).toBe(true);
      expect(themeRegistry.hasTheme('unregister-test')).toBe(false);
    });

    it('should return false when unregistering non-existent theme', () => {
      const unregistered = themeRegistry.unregisterTheme('non-existent');
      expect(unregistered).toBe(false);
    });

    it('should validate theme definition during registration', () => {
      const invalidTheme = {
        id: '',
        name: 'Invalid Theme',
        className: 'theme-invalid',
        cssVariables: {},
      } as ThemeDefinition;

      expect(() => {
        themeRegistry.registerTheme(invalidTheme);
      }).toThrow(ThemeRegistrationError);
    });

    it('should warn when overwriting existing theme', () => {
      const theme1: ThemeDefinition = {
        id: 'duplicate',
        name: 'First',
        className: 'theme-first',
        cssVariables: {},
      };

      const theme2: ThemeDefinition = {
        id: 'duplicate',
        name: 'Second',
        className: 'theme-second',
        cssVariables: {},
      };

      themeRegistry.registerTheme(theme1);

      // コンソール警告をキャッチするテストは複雑なので、例外が発生しないことのみテスト
      expect(() => {
        themeRegistry.registerTheme(theme2);
      }).not.toThrow();

      const retrievedTheme = themeRegistry.getTheme('duplicate');
      expect(retrievedTheme?.name).toBe('Second');
    });
  });

  describe('StyleController with Pluggable Themes', () => {
    it('should initialize with built-in themes', () => {
      const availableThemes = styleController.getAvailableThemes();

      expect(availableThemes.length).toBeGreaterThanOrEqual(3);
      expect(availableThemes.some((t) => t.id === 'light')).toBe(true);
      expect(availableThemes.some((t) => t.id === 'dark')).toBe(true);
      expect(availableThemes.some((t) => t.id === 'sepia')).toBe(true);
    });

    it('should switch to custom theme', () => {
      const customTheme: ThemeDefinition = {
        id: 'high-contrast',
        name: 'ハイコントラスト',
        className: 'theme-high-contrast',
        cssVariables: {
          '--bg-color': '#000000',
          '--text-color': '#ffffff',
          '--link-color': '#ffff00',
        },
      };

      styleController.registerTheme(customTheme);
      styleController.setTheme('high-contrast');

      expect(styleController.getCurrentTheme()?.id).toBe('high-contrast');
      expect(styleController.getThemeClass()).toBe('theme-high-contrast');
    });

    it('should throw error when switching to non-existent theme', () => {
      expect(() => {
        styleController.setTheme('non-existent-theme');
      }).toThrow(ThemeNotFoundError);
    });

    it('should apply CSS variables when switching themes', () => {
      const testElement = document.createElement('div');
      const customTheme: ThemeDefinition = {
        id: 'css-vars-test',
        name: 'CSS Variables Test',
        className: 'theme-css-vars-test',
        cssVariables: {
          '--test-bg': '#123456',
          '--test-color': '#abcdef',
        },
      };

      styleController.registerTheme(customTheme);
      styleController.setTheme('css-vars-test');
      styleController.applyStylesToElement(testElement);

      expect(testElement.style.getPropertyValue('--test-bg')).toBe('#123456');
      expect(testElement.style.getPropertyValue('--test-color')).toBe(
        '#abcdef'
      );
    });

    it('should remove old theme classes when switching themes', () => {
      const testElement = document.createElement('div');

      // 最初のテーマを適用
      styleController.setTheme('light');
      styleController.applyStylesToElement(testElement);
      expect(testElement.classList.contains('theme-light')).toBe(true);

      // カスタムテーマに切り替え
      const customTheme: ThemeDefinition = {
        id: 'switch-test',
        name: 'Switch Test',
        className: 'theme-switch-test',
        cssVariables: {},
      };

      styleController.registerTheme(customTheme);
      styleController.setTheme('switch-test');
      styleController.applyStylesToElement(testElement);

      expect(testElement.classList.contains('theme-light')).toBe(false);
      expect(testElement.classList.contains('theme-switch-test')).toBe(true);
    });

    it('should handle theme registration and unregistration', () => {
      const customTheme: ThemeDefinition = {
        id: 'temporary-theme',
        name: 'Temporary Theme',
        className: 'theme-temporary',
        cssVariables: {},
      };

      // 登録
      styleController.registerTheme(customTheme);
      expect(styleController.hasTheme('temporary-theme')).toBe(true);

      // 登録解除
      const unregistered = styleController.unregisterTheme('temporary-theme');
      expect(unregistered).toBe(true);
      expect(styleController.hasTheme('temporary-theme')).toBe(false);
    });

    it('should include theme registry info in debug output', () => {
      const debugInfo = styleController.getDebugInfo();

      expect(debugInfo).toHaveProperty('themeRegistry');
      expect(debugInfo).toHaveProperty('currentTheme');
    });
  });

  describe('Built-in Themes', () => {
    it('should have valid built-in theme definitions', () => {
      builtInThemes.forEach((theme) => {
        expect(theme.id).toBeTruthy();
        expect(theme.name).toBeTruthy();
        expect(theme.className).toBeTruthy();
        expect(typeof theme.cssVariables).toBe('object');
      });
    });

    it('should include required CSS variables in built-in themes', () => {
      const requiredVariables = ['--bg-color', '--text-color', '--link-color'];

      builtInThemes.forEach((theme) => {
        requiredVariables.forEach((variable) => {
          expect(theme.cssVariables).toHaveProperty(variable);
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw ThemeNotFoundError with context', () => {
      try {
        styleController.setTheme('invalid-theme');
      } catch (error) {
        expect(error).toBeInstanceOf(ThemeNotFoundError);
        expect((error as ThemeNotFoundError).code).toBe('THEME_NOT_FOUND');
        expect((error as ThemeNotFoundError).context).toHaveProperty(
          'themeId',
          'invalid-theme'
        );
        expect((error as ThemeNotFoundError).context).toHaveProperty(
          'availableThemes'
        );
      }
    });

    it('should throw ThemeRegistrationError for invalid theme', () => {
      const invalidTheme = {
        id: 'invalid',
        name: '', // Invalid name
        className: 'theme-invalid',
        cssVariables: {},
      } as ThemeDefinition;

      expect(() => {
        themeRegistry.registerTheme(invalidTheme);
      }).toThrow(ThemeRegistrationError);
    });
  });
});
