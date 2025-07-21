import { ReaderViewError } from './types';

/**
 * Base class for all Reader View errors
 * Provides consistent error structure with error codes, user messages, and context
 */
export abstract class BaseReaderViewError
  extends Error
  implements ReaderViewError
{
  abstract readonly code: string;
  abstract readonly userMessage: string;
  readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    context?: Record<string, unknown>,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;

    // Use Error.captureStackTrace if it is available
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * テーマが見つからない場合のエラー
 */
export class ThemeNotFoundError extends BaseReaderViewError {
  readonly code = 'THEME_NOT_FOUND';
  readonly userMessage = '指定されたテーマが見つかりません。';

  constructor(themeId: string, availableThemes: string[] = []) {
    super(`テーマ '${themeId}' が見つかりません`, {
      themeId,
      availableThemes,
    });
  }
}

/**
 * テーマの登録に失敗した場合のエラー
 */
export class ThemeRegistrationError extends BaseReaderViewError {
  readonly code = 'THEME_REGISTRATION_ERROR';
  readonly userMessage = 'テーマの登録に失敗しました。';

  constructor(themeId: string, reason: string) {
    super(`テーマ '${themeId}' の登録に失敗しました: ${reason}`, {
      themeId,
      reason,
    });
  }
}

/**
 * スタイルシステムの初期化に失敗した場合のエラー
 */
export class StyleSystemInitializationError extends BaseReaderViewError {
  readonly code = 'STYLE_SYSTEM_INITIALIZATION_ERROR';
  readonly userMessage = 'スタイルの初期化に失敗しました。';

  constructor(reason: string, originalError?: Error) {
    super(
      `スタイルシステムの初期化に失敗しました: ${reason}`,
      {
        reason,
        originalError: originalError?.message,
      },
      originalError
    );
  }
}

/**
 * CSS変数の適用に失敗した場合のエラー
 */
export class CSSVariableApplicationError extends BaseReaderViewError {
  readonly code = 'CSS_VARIABLE_APPLICATION_ERROR';
  readonly userMessage = 'スタイルの適用に失敗しました。';

  constructor(variableName: string, value: string, originalError?: Error) {
    super(
      `CSS変数 '${variableName}' の適用に失敗しました`,
      {
        variableName,
        value,
        originalError: originalError?.message,
      },
      originalError
    );
  }
}

/**
 * 記事コンテンツの抽出に失敗した場合のエラー
 */
export class ArticleExtractionError extends BaseReaderViewError {
  readonly code = 'ARTICLE_EXTRACTION_FAILED';
  readonly userMessage = '記事が見つかりませんでした。';

  constructor(cause?: Error) {
    super('記事コンテンツの抽出に失敗しました', {}, cause);
  }
}

/**
 * Shadow DOM操作に失敗した場合のエラー
 */
export class ShadowDOMError extends BaseReaderViewError {
  readonly code = 'SHADOW_DOM_ERROR';
  readonly userMessage = 'Reader Viewの表示に失敗しました。';

  constructor(operation: string, cause?: Error) {
    super(
      `Shadow DOM操作が失敗しました: ${operation}`,
      {
        operation,
      },
      cause
    );
  }
}

/**
 * ストレージ操作に失敗した場合のエラー
 */
export class StorageError extends BaseReaderViewError {
  readonly code = 'STORAGE_ERROR';
  readonly userMessage = '設定の保存に失敗しました。';

  constructor(operation: string, cause?: Error) {
    super(
      `ストレージ操作が失敗しました: ${operation}`,
      {
        operation,
      },
      cause
    );
  }
}

/**
 * Reactレンダリングに失敗した場合のエラー
 */
export class RenderingError extends BaseReaderViewError {
  readonly code = 'RENDERING_ERROR';
  readonly userMessage = 'コンポーネントの表示に失敗しました。';

  constructor(component: string, cause?: Error) {
    super(
      `Reactコンポーネントのレンダリングに失敗しました: ${component}`,
      {
        component,
      },
      cause
    );
  }
}

/**
 * Error handler utility class for unified error processing
 */
export class ErrorHandler {
  /**
   * Check if running in development environment using WXT's built-in environment variables
   */
  private static isDevelopment(): boolean {
    return import.meta.env.MODE === 'development';
  }

  /**
   * Check if running in production environment using WXT's built-in environment variables
   */
  private static isProduction(): boolean {
    return import.meta.env.MODE === 'production';
  }

  /**
   * Handle a ReaderViewError with consistent logging and user notification
   */
  static handle(error: BaseReaderViewError): void {
    // Development environment logging
    if (this.isDevelopment()) {
      console.error(`[${error.code}] ${error.message}`, {
        context: error.context,
        cause: error.cause,
        stack: error.stack,
      });
    }

    // User notification
    this.notifyUser(error.userMessage);

    // Production error reporting
    if (this.isProduction()) {
      this.reportError(error);
    }
  }

  /**
   * Type guard to check if showPopupMessage function is available
   */
  private static isShowPopupMessageAvailable(
    globalObject: Record<string, unknown>
  ): boolean {
    return (
      'showPopupMessage' in globalObject &&
      typeof globalObject.showPopupMessage === 'function'
    );
  }

  /**
   * Notify user with error message using popupMsg component
   */
  private static notifyUser(message: string): void {
    // Try to use the global showPopupMessage function if available
    const globalObject = globalThis as Record<string, unknown>;
    if (this.isShowPopupMessageAvailable(globalObject)) {
      (globalObject.showPopupMessage as (message: string) => void)(message);
    } else {
      // Fallback to console warning if popupMsg is not available
      console.warn(`User notification: ${message}`);
    }
  }

  /**
   * Type guard to check if running in browser environment
   */
  private static isBrowserEnvironment(): boolean {
    return typeof window !== 'undefined' && typeof navigator !== 'undefined';
  }

  /**
   * Get browser information safely
   */
  private static getBrowserInfo(): { userAgent?: string; url?: string } {
    if (!this.isBrowserEnvironment()) {
      return {};
    }

    return {
      userAgent: globalThis.navigator.userAgent,
      url: globalThis.location.href,
    };
  }

  /**
   * Report error to telemetry/monitoring service in production
   */
  private static reportError(error: BaseReaderViewError): void {
    // This would integrate with a telemetry service in a real implementation
    // For now, we'll use a structured console log that can be picked up by monitoring
    const reportData = {
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      context: error.context,
      timestamp: new Date().toISOString(),
      ...this.getBrowserInfo(),
    };

    console.error('ReaderView Error Report', reportData);
  }
}

/**
 * Type guard to check if an unknown value is an Error
 */
function isError(value: unknown): value is Error {
  return (
    value instanceof Error ||
    (typeof value === 'object' &&
      value !== null &&
      'name' in value &&
      'message' in value &&
      typeof (value as Record<string, unknown>).name === 'string' &&
      typeof (value as Record<string, unknown>).message === 'string')
  );
}

/**
 * Safely convert unknown error to Error instance
 */
function toError(error: unknown): Error {
  if (isError(error)) {
    return error;
  }

  // Convert non-Error values to Error instances
  if (typeof error === 'string') {
    return new Error(error);
  }

  if (typeof error === 'object' && error !== null) {
    return new Error(JSON.stringify(error));
  }

  return new Error(String(error));
}

/**
 * Utility function for standardized error handling with try-catch patterns
 */
export function withErrorHandling<T>(
  operation: () => T,
  errorFactory: (cause: Error) => BaseReaderViewError
): T | null {
  try {
    return operation();
  } catch (error) {
    const errorInstance = toError(error);
    const readerError = errorFactory(errorInstance);
    ErrorHandler.handle(readerError);
    return null;
  }
}

/**
 * Async version of withErrorHandling for Promise-based operations
 */
export async function withAsyncErrorHandling<T>(
  operation: () => Promise<T>,
  errorFactory: (cause: Error) => BaseReaderViewError
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    const errorInstance = toError(error);
    const readerError = errorFactory(errorInstance);
    ErrorHandler.handle(readerError);
    return null;
  }
}
