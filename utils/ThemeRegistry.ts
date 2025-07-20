import { ThemeDefinition, ThemeRegistry } from './types';
import { ThemeRegistrationError } from './errors';

/**
 * プラガブルテーマシステムの実装
 * Open/Closed Principle に従った設計で、型修正なしで新しいテーマを追加可能
 */
export class DefaultThemeRegistry implements ThemeRegistry {
  private themes = new Map<string, ThemeDefinition>();

  /**
   * テーマを登録
   */
  registerTheme(theme: ThemeDefinition): void {
    // バリデーション
    if (!theme.id || typeof theme.id !== 'string') {
      throw new ThemeRegistrationError(
        theme.id || 'unknown',
        'テーマIDが無効です'
      );
    }

    if (!theme.name || typeof theme.name !== 'string') {
      throw new ThemeRegistrationError(theme.id, 'テーマ名が無効です');
    }

    if (!theme.className || typeof theme.className !== 'string') {
      throw new ThemeRegistrationError(theme.id, 'クラス名が無効です');
    }

    if (!theme.cssVariables || typeof theme.cssVariables !== 'object') {
      throw new ThemeRegistrationError(theme.id, 'CSS変数が無効です');
    }

    // 重複チェック
    if (this.themes.has(theme.id)) {
      console.warn(
        `テーマ '${theme.id}' は既に登録されています。上書きします。`
      );
    }

    this.themes.set(theme.id, theme);
  }

  /**
   * テーマの登録を解除
   */
  unregisterTheme(themeId: string): boolean {
    return this.themes.delete(themeId);
  }

  /**
   * テーマを取得
   */
  getTheme(themeId: string): ThemeDefinition | null {
    return this.themes.get(themeId) || null;
  }

  /**
   * 利用可能なテーマの一覧を取得
   */
  getAvailableThemes(): ThemeDefinition[] {
    return Array.from(this.themes.values());
  }

  /**
   * テーマが存在するかチェック
   */
  hasTheme(themeId: string): boolean {
    return this.themes.has(themeId);
  }

  /**
   * テーマIDの一覧を取得
   */
  getThemeIds(): string[] {
    return Array.from(this.themes.keys());
  }

  /**
   * 登録されているテーマ数を取得
   */
  getThemeCount(): number {
    return this.themes.size;
  }

  /**
   * 全てのテーマを削除
   */
  clear(): void {
    this.themes.clear();
  }

  /**
   * デバッグ情報を取得
   */
  getDebugInfo(): object {
    return {
      themeCount: this.themes.size,
      themeIds: this.getThemeIds(),
      themes: this.getAvailableThemes().map((theme) => ({
        id: theme.id,
        name: theme.name,
        className: theme.className,
        variableCount: Object.keys(theme.cssVariables).length,
      })),
    };
  }
}
