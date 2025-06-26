/**
 * Better Reader View用のカスタムエラー型定義
 */

export enum ReaderViewErrorType {
  REACT_UNMOUNT_FAILED = 'REACT_UNMOUNT_FAILED',
  POPUP_CONTAINER_CREATION_FAILED = 'POPUP_CONTAINER_CREATION_FAILED',
  STYLE_SAVE_FAILED = 'STYLE_SAVE_FAILED',
  STYLE_LOAD_FAILED = 'STYLE_LOAD_FAILED',
}

export interface ReaderViewErrorDetails {
  type: ReaderViewErrorType;
  message: string;
  originalError?: unknown;
}

export class ReaderViewError extends Error {
  public readonly type: ReaderViewErrorType;
  public readonly originalError?: unknown;

  constructor(details: ReaderViewErrorDetails) {
    super(details.message);
    this.name = 'ReaderViewError';
    this.type = details.type;
    this.originalError = details.originalError;
  }
}

/**
 * React rootのアンマウント失敗エラーを作成
 */
export const createReactUnmountError = (originalError: unknown): ReaderViewError => {
  return new ReaderViewError({
    type: ReaderViewErrorType.REACT_UNMOUNT_FAILED,
    message: 'React rootのアンマウントに失敗しました',
    originalError,
  });
};

/**
 * ポップアップコンテナ作成失敗エラーを作成
 */
export const createPopupContainerError = (): ReaderViewError => {
  return new ReaderViewError({
    type: ReaderViewErrorType.POPUP_CONTAINER_CREATION_FAILED,
    message: 'ポップアップコンテナの作成に失敗しました。bodyまたはdocumentElementが見つかりません。',
  });
};

/**
 * スタイル設定保存失敗エラーを作成
 */
export const createStyleSaveError = (originalError: unknown): ReaderViewError => {
  return new ReaderViewError({
    type: ReaderViewErrorType.STYLE_SAVE_FAILED,
    message: 'スタイル設定の保存に失敗しました',
    originalError,
  });
};

/**
 * スタイル設定読み込み失敗エラーを作成
 */
export const createStyleLoadError = (originalError: unknown): ReaderViewError => {
  return new ReaderViewError({
    type: ReaderViewErrorType.STYLE_LOAD_FAILED,
    message: 'スタイル設定の読み込みに失敗しました',
    originalError,
  });
};