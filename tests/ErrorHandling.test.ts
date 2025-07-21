import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  BaseReaderViewError,
  ArticleExtractionError,
  ThemeNotFoundError,
  ShadowDOMError,
  StyleSystemInitializationError,
  StorageError,
  RenderingError,
  ErrorHandler,
  withErrorHandling,
  withAsyncErrorHandling,
} from '@/utils/errors';

describe('Error Handling System', () => {
  beforeEach(() => {
    // Reset console and global state before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up global state
    delete (globalThis as Record<string, unknown>).showPopupMessage;
  });

  describe('BaseReaderViewError', () => {
    it('should create proper error with required properties', () => {
      class TestError extends BaseReaderViewError {
        readonly code = 'TEST_ERROR';
        readonly userMessage = 'テストエラーです。';
      }

      const error = new TestError('Test message');

      expect(error.code).toBe('TEST_ERROR');
      expect(error.userMessage).toBe('テストエラーです。');
      expect(error.message).toBe('Test message');
      expect(error.name).toBe('TestError');
      expect(error).toBeInstanceOf(BaseReaderViewError);
      expect(error).toBeInstanceOf(Error);
    });

    it('should include context and cause information', () => {
      class TestError extends BaseReaderViewError {
        readonly code = 'TEST_ERROR';
        readonly userMessage = 'テストエラーです。';
      }

      const originalError = new Error('Original error');
      const context = { testKey: 'testValue' };
      const error = new TestError('Test message', context, originalError);

      expect(error.context).toEqual(context);
      expect(error.cause).toBe(originalError);
    });
  });

  describe('Specific Error Classes', () => {
    it('should create ArticleExtractionError with correct properties', () => {
      const originalError = new Error('Parse failed');
      const error = new ArticleExtractionError(originalError);

      expect(error.code).toBe('ARTICLE_EXTRACTION_FAILED');
      expect(error.userMessage).toBe('記事が見つかりませんでした。');
      expect(error.cause).toBe(originalError);
      expect(error).toBeInstanceOf(ArticleExtractionError);
    });

    it('should create ThemeNotFoundError with theme information', () => {
      const error = new ThemeNotFoundError('invalid-theme', ['light', 'dark']);

      expect(error.code).toBe('THEME_NOT_FOUND');
      expect(error.userMessage).toBe('指定されたテーマが見つかりません。');
      expect(error.context).toEqual({
        themeId: 'invalid-theme',
        availableThemes: ['light', 'dark'],
      });
    });

    it('should create ShadowDOMError with operation context', () => {
      const originalError = new Error('DOM operation failed');
      const error = new ShadowDOMError('create', originalError);

      expect(error.code).toBe('SHADOW_DOM_ERROR');
      expect(error.userMessage).toBe('Reader Viewの表示に失敗しました。');
      expect(error.context).toEqual({ operation: 'create' });
      expect(error.cause).toBe(originalError);
    });

    it('should create StorageError with operation context', () => {
      const originalError = new Error('Storage quota exceeded');
      const error = new StorageError('save', originalError);

      expect(error.code).toBe('STORAGE_ERROR');
      expect(error.userMessage).toBe('設定の保存に失敗しました。');
      expect(error.context).toEqual({ operation: 'save' });
      expect(error.cause).toBe(originalError);
    });

    it('should create RenderingError with component context', () => {
      const originalError = new Error('React render failed');
      const error = new RenderingError('StylePanel', originalError);

      expect(error.code).toBe('RENDERING_ERROR');
      expect(error.userMessage).toBe('コンポーネントの表示に失敗しました。');
      expect(error.context).toEqual({ component: 'StylePanel' });
      expect(error.cause).toBe(originalError);
    });
  });

  describe('ErrorHandler', () => {
    it('should handle errors in development environment', () => {
      // Mock import.meta.env.MODE for testing
      vi.stubEnv('MODE', 'development');

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const error = new ArticleExtractionError();
      ErrorHandler.handle(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ARTICLE_EXTRACTION_FAILED] 記事コンテンツの抽出に失敗しました',
        expect.objectContaining({
          context: {},
          cause: undefined,
          stack: expect.any(String),
        })
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'User notification: 記事が見つかりませんでした。'
      );

      // Restore environment
      vi.unstubAllEnvs();
    });

    it('should handle errors in production environment', () => {
      // Mock import.meta.env.MODE for testing
      vi.stubEnv('MODE', 'production');

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const error = new ThemeNotFoundError('invalid-theme');
      ErrorHandler.handle(error);

      expect(consoleSpy).toHaveBeenCalledWith(
        'ReaderView Error Report',
        expect.objectContaining({
          code: 'THEME_NOT_FOUND',
          message: "テーマ 'invalid-theme' が見つかりません",
          userMessage: '指定されたテーマが見つかりません。',
          context: expect.any(Object),
          timestamp: expect.any(String),
        })
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'User notification: 指定されたテーマが見つかりません。'
      );

      // Restore environment
      vi.unstubAllEnvs();
    });

    it('should fallback to console warning when showPopupMessage is not available', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const error = new StorageError('load');
      ErrorHandler.handle(error);

      expect(consoleSpy).toHaveBeenCalledWith(
        'User notification: 設定の保存に失敗しました。'
      );
    });
  });

  describe('withErrorHandling utility', () => {
    it('should execute operation successfully and return result', () => {
      const mockOperation = vi.fn().mockReturnValue('success');
      const mockErrorFactory = vi.fn();

      const result = withErrorHandling(mockOperation, mockErrorFactory);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalled();
      expect(mockErrorFactory).not.toHaveBeenCalled();
    });

    it('should handle errors and return null', () => {
      const mockOperation = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      const mockErrorFactory = vi
        .fn()
        .mockReturnValue(new ArticleExtractionError());
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = withErrorHandling(mockOperation, mockErrorFactory);

      expect(result).toBeNull();
      expect(mockOperation).toHaveBeenCalled();
      expect(mockErrorFactory).toHaveBeenCalledWith(expect.any(Error));
      expect(consoleSpy).toHaveBeenCalledWith(
        'User notification: 記事が見つかりませんでした。'
      );
    });

    it('should handle non-Error thrown values', () => {
      const mockOperation = vi.fn().mockImplementation(() => {
        throw 'String error';
      });
      const mockErrorFactory = vi
        .fn()
        .mockReturnValue(new ArticleExtractionError());
      vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = withErrorHandling(mockOperation, mockErrorFactory);

      expect(result).toBeNull();
      expect(mockErrorFactory).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'String error',
        })
      );
    });

    it('should handle object thrown values', () => {
      const mockOperation = vi.fn().mockImplementation(() => {
        throw { code: 'UNKNOWN', detail: 'Something went wrong' };
      });
      const mockErrorFactory = vi
        .fn()
        .mockReturnValue(new ArticleExtractionError());

      const result = withErrorHandling(mockOperation, mockErrorFactory);

      expect(result).toBeNull();
      expect(mockErrorFactory).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('code'),
        })
      );
    });

    it('should call ErrorHandler.handle with created error', () => {
      const mockOperation = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      const testError = new ShadowDOMError('test');
      const mockErrorFactory = vi.fn().mockReturnValue(testError);
      const handleSpy = vi
        .spyOn(ErrorHandler, 'handle')
        .mockImplementation(() => {});

      withErrorHandling(mockOperation, mockErrorFactory);

      expect(handleSpy).toHaveBeenCalledWith(testError);
    });
  });

  describe('withAsyncErrorHandling utility', () => {
    it('should execute async operation successfully and return result', async () => {
      const mockOperation = vi.fn().mockResolvedValue('async success');
      const mockErrorFactory = vi.fn();

      const result = await withAsyncErrorHandling(
        mockOperation,
        mockErrorFactory
      );

      expect(result).toBe('async success');
      expect(mockOperation).toHaveBeenCalled();
      expect(mockErrorFactory).not.toHaveBeenCalled();
    });

    it('should handle async errors and return null', async () => {
      const mockOperation = vi
        .fn()
        .mockRejectedValue(new Error('Async test error'));
      const mockErrorFactory = vi
        .fn()
        .mockReturnValue(new StorageError('async'));
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await withAsyncErrorHandling(
        mockOperation,
        mockErrorFactory
      );

      expect(result).toBeNull();
      expect(mockOperation).toHaveBeenCalled();
      expect(mockErrorFactory).toHaveBeenCalledWith(expect.any(Error));
      expect(consoleSpy).toHaveBeenCalledWith(
        'User notification: 設定の保存に失敗しました。'
      );
    });
  });

  describe('Type Safety and Guards', () => {
    it('should handle showPopupMessage type guard correctly', () => {
      const mockShowPopup = vi.fn();
      (globalThis as Record<string, unknown>).showPopupMessage = mockShowPopup;

      const error = new ArticleExtractionError();
      ErrorHandler.handle(error);

      expect(mockShowPopup).toHaveBeenCalledWith(
        '記事が見つかりませんでした。'
      );
    });

    it('should fallback when showPopupMessage is not a function', () => {
      (globalThis as Record<string, unknown>).showPopupMessage =
        'not a function';
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const error = new ArticleExtractionError();
      ErrorHandler.handle(error);

      expect(consoleSpy).toHaveBeenCalledWith(
        'User notification: 記事が見つかりませんでした。'
      );
    });

    it('should handle various error types in withErrorHandling', () => {
      const testCases = [
        { thrown: new Error('Error instance'), expected: 'Error instance' },
        { thrown: 'String error', expected: 'String error' },
        {
          thrown: { custom: 'object' },
          expected: expect.stringContaining('custom'),
        },
        { thrown: 42, expected: '42' },
        { thrown: null, expected: 'null' },
        { thrown: undefined, expected: 'undefined' },
      ];

      testCases.forEach(({ thrown, expected }) => {
        const mockOperation = vi.fn().mockImplementation(() => {
          throw thrown;
        });
        const mockErrorFactory = vi
          .fn()
          .mockReturnValue(new ArticleExtractionError());

        withErrorHandling(mockOperation, mockErrorFactory);

        expect(mockErrorFactory).toHaveBeenCalledWith(
          expect.objectContaining({ message: expected })
        );
        mockErrorFactory.mockClear();
      });
    });
  });

  describe('Error Integration', () => {
    it('should maintain proper error inheritance chain', () => {
      const errors = [
        new ArticleExtractionError(),
        new ThemeNotFoundError('test'),
        new ShadowDOMError('test'),
        new StyleSystemInitializationError('test'),
        new StorageError('test'),
        new RenderingError('test'),
      ];

      errors.forEach((error) => {
        expect(error).toBeInstanceOf(BaseReaderViewError);
        expect(error).toBeInstanceOf(Error);
        expect(error.code).toBeDefined();
        expect(error.userMessage).toBeDefined();
        expect(typeof error.code).toBe('string');
        expect(typeof error.userMessage).toBe('string');
      });
    });

    it('should provide consistent Japanese user messages', () => {
      const errors = [
        new ArticleExtractionError(),
        new ThemeNotFoundError('test'),
        new ShadowDOMError('test'),
        new StyleSystemInitializationError('test'),
        new StorageError('test'),
        new RenderingError('test'),
      ];

      errors.forEach((error) => {
        // All user messages should be in Japanese (hiragana, katakana, or kanji)
        expect(error.userMessage).toMatch(
          /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/
        );
        expect(error.userMessage).toMatch(/。$/); // End with Japanese period
      });
    });
  });
});
