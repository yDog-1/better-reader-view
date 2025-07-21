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
import { StorageManager } from '@/utils/storage-config';
import { BrowserAPIManager } from '@/utils/BrowserAPIManager';

const articleErrorMessage = '記事が見つかりませんでした。';

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

    await toggleReaderView(readerViewManager);
    return;
  },
});

async function toggleReaderView(
  readerViewManager: NonNullable<ReturnType<typeof createReaderViewManager>>
) {
  await withAsyncErrorHandling(
    async () => {
      // WXT Storage APIを使用してFeature Detectionと共に状態を取得
      const isActive = await BrowserAPIManager.safeAsyncAPICall(
        async () => {
          const state = await StorageManager.getReaderViewState();
          return state.isActive;
        },
        false,
        'storage.session'
      );

      if (isActive) {
        // リーダービューを無効化
        deactivateReader(readerViewManager, document);
        await BrowserAPIManager.safeAsyncAPICall(
          () => StorageManager.deactivateReaderView(),
          undefined,
          'storage.session'
        );
      } else {
        // リーダービューを有効化
        const success = activateReader(readerViewManager, document);

        if (success) {
          await BrowserAPIManager.safeAsyncAPICall(
            () =>
              StorageManager.activateReaderView(
                window.location.href,
                document.title
              ),
            undefined,
            'storage.session'
          );
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
          const renderingError = new RenderingError(
            'PopupMessage',
            new Error(
              'ポップアップを表示できません: コンテナを追加するbodyまたはdocumentElementが見つかりません。'
            )
          );
          ErrorHandler.handle(renderingError);
          throw renderingError;
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
