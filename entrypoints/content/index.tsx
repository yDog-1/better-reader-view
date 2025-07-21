import ReactDOM from 'react-dom/client';
import './style.css';
import PopupMessage from '@/components/popupMsg';
import {
  activateReader,
  deactivateReader,
  createReaderViewManager,
} from '@/utils/reader-utils';
import { StyleController } from '@/utils/StyleController';
import {
  StyleSystemInitializationError,
  ShadowDOMError,
  StorageError,
  RenderingError,
  ErrorHandler,
  withErrorHandling,
  withAsyncErrorHandling,
} from '@/utils/errors';

const articleErrorMessage = '記事が見つかりませんでした。';

const READER_VIEW_ACTIVE_KEY = 'readerViewActive';

export default defineContentScript({
  registration: 'runtime',
  matches: [],
  cssInjectionMode: 'ui',

  async main() {
    // StyleControllerを初期化
    const styleController = withErrorHandling(
      () => new StyleController(),
      (cause) =>
        new StyleSystemInitializationError(
          'StyleControllerの作成に失敗しました',
          cause
        )
    );

    if (!styleController) {
      ErrorHandler.handle(
        new StyleSystemInitializationError(
          'StyleControllerの作成に失敗しました'
        )
      );
      return;
    }

    // ストレージから設定を読み込み
    await withAsyncErrorHandling(
      () => styleController.loadFromStorage(),
      (cause) =>
        new StorageError('コンテンツスクリプトでのスタイル設定読み込み', cause)
    );

    // ReaderViewManagerを作成（関数型アプローチ）
    const readerViewManager = createReaderViewManager(styleController);

    if (!readerViewManager) {
      ErrorHandler.handle(
        new ShadowDOMError('ReaderViewManagerの作成に失敗しました')
      );
      return;
    }

    toggleReaderView(readerViewManager);
    return;
  },
});

function toggleReaderView(
  readerViewManager: NonNullable<ReturnType<typeof createReaderViewManager>>
) {
  withErrorHandling(
    () => {
      const isActive =
        sessionStorage.getItem(READER_VIEW_ACTIVE_KEY) === 'true';

      if (isActive) {
        // リーダービューを無効化
        deactivateReader(readerViewManager, document);
        sessionStorage.removeItem(READER_VIEW_ACTIVE_KEY);
      } else {
        // リーダービューを有効化
        const success = activateReader(readerViewManager, document);

        if (success) {
          sessionStorage.setItem(READER_VIEW_ACTIVE_KEY, 'true');
        } else {
          showPopupMessage(articleErrorMessage);
        }
      }
      return true;
    },
    (cause) => new ShadowDOMError('リーダービューの切り替え', cause)
  );
}

function showPopupMessage(message: string) {
  withErrorHandling(
    () => {
      const containerId = 'reader-view-popup-container';
      let container = document.getElementById(containerId);
      if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        // body が存在する場合のみ body に追加する
        if (document.body) {
          document.body.appendChild(container);
        } else if (document.documentElement) {
          // body がまだ利用できない場合 (例: DOMContentLoaded 前)、documentElement に追加
          document.documentElement.appendChild(container);
        } else {
          // 通常ここには来ないはずだが、フォールバック
          throw new Error(
            'ポップアップを表示できません: コンテナを追加するbodyまたはdocumentElementが見つかりません。'
          );
        }
      }
      const root = ReactDOM.createRoot(container);

      const handleClose = () => {
        withErrorHandling(
          () => {
            root.unmount();
            if (container && container.parentNode) {
              // container が null でないことを確認
              container.parentNode.removeChild(container);
            }
            return true;
          },
          (cause) => new RenderingError('ポップアップクローズ', cause)
        );
      };

      root.render(<PopupMessage message={message} onClose={handleClose} />);
      return true;
    },
    (cause) => new RenderingError('ポップアップメッセージ', cause)
  );
}

// グローバル関数として登録してエラーハンドラーから使用可能にする
(globalThis as Record<string, unknown>).showPopupMessage = showPopupMessage;
