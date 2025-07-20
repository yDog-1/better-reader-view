import { ReaderViewError } from './types';

/**
 * カスタムエラークラスの基底クラス
 */
export abstract class BaseReaderViewError
  extends Error
  implements ReaderViewError
{
  abstract readonly code: string;
  readonly context?: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;

    // Error.captureStackTrace が利用可能な場合に使用
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

  constructor(reason: string, originalError?: Error) {
    super(`スタイルシステムの初期化に失敗しました: ${reason}`, {
      reason,
      originalError: originalError?.message,
    });
  }
}

/**
 * CSS変数の適用に失敗した場合のエラー
 */
export class CSSVariableApplicationError extends BaseReaderViewError {
  readonly code = 'CSS_VARIABLE_APPLICATION_ERROR';

  constructor(variableName: string, value: string, originalError?: Error) {
    super(`CSS変数 '${variableName}' の適用に失敗しました`, {
      variableName,
      value,
      originalError: originalError?.message,
    });
  }
}
