import React from 'react';
import ReactDOM from 'react-dom/client';
import type { ContentScriptContext } from 'wxt/utils/content-script-context';
import './style.css';
import ReaderView from '@/components/ReaderView';
import PopupMessage from '@/components/popupMsg';
import StyleProvider from '@/components/StyleProvider';
import { extractContent } from '@/utils/reader-utils';
import { StyleController } from '@/utils/StyleController';
import { createResourceManager } from '@/utils/WXTResourceManager';
import { createUIStateManager } from '@/utils/WXTUIStateManager';
import {
  StyleSystemInitializationError,
  ShadowDOMError,
  StorageError,
  RenderingError,
  ContentExtractionError,
  ErrorHandler,
  withErrorHandling,
  withAsyncErrorHandling,
} from '@/utils/errors';
import { StorageManager } from '@/utils/storage-config';

const articleErrorMessage = '記事が見つかりませんでした。';

export default defineContentScript({
  registration: 'runtime',
  matches: [],
  cssInjectionMode: 'ui',

  async main(ctx) {
    // WXTResourceManagerを作成
    const resourceManager = withErrorHandling(
      () => createResourceManager(ctx),
      (cause) => new ShadowDOMError('WXTResourceManagerの作成', cause)
    );

    if (!resourceManager) {
      ErrorHandler.handle(
        new ShadowDOMError('WXTResourceManagerの作成に失敗しました')
      );
      return;
    }

    // レガシーストレージからの移行を実行
    await withAsyncErrorHandling(
      () => StorageManager.migrateFromLegacyStorage(),
      (cause) => new StorageError('レガシーストレージからの移行', cause)
    );

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

    // UIStateManagerを作成
    const uiStateManager = withErrorHandling(
      () => createUIStateManager(resourceManager),
      (cause) => new ShadowDOMError('UIStateManagerの作成', cause)
    );

    if (!uiStateManager) {
      ErrorHandler.handle(
        new ShadowDOMError('UIStateManagerの作成に失敗しました')
      );
      return;
    }

    await toggleReaderView(
      ctx,
      resourceManager,
      styleController,
      uiStateManager
    );

    return;
  },
});

async function toggleReaderView(
  ctx: ContentScriptContext,
  resourceManager: NonNullable<ReturnType<typeof createResourceManager>>,
  styleController: StyleController,
  uiStateManager: NonNullable<ReturnType<typeof createUIStateManager>>
) {
  await withAsyncErrorHandling(
    async () => {
      const currentState = uiStateManager.getState();

      if (currentState.isReaderViewActive) {
        // リーダービューを無効化
        await deactivateReaderView(uiStateManager);
      } else {
        // リーダービューを有効化
        await activateReaderView(
          ctx,
          resourceManager,
          styleController,
          uiStateManager
        );
      }
      return true;
    },
    (cause) => new ShadowDOMError('リーダービューの切り替え', cause)
  );
}

async function activateReaderView(
  ctx: ContentScriptContext,
  resourceManager: NonNullable<ReturnType<typeof createResourceManager>>,
  styleController: StyleController,
  uiStateManager: NonNullable<ReturnType<typeof createUIStateManager>>
) {
  // 記事コンテンツを抽出
  const article = withErrorHandling(
    () => extractContent(document),
    (cause) => new ContentExtractionError('記事コンテンツの抽出', cause)
  );

  if (!article) {
    showPopupMessage(articleErrorMessage);
    return;
  }

  // WXTのcreateShadowRootUiを使用してShadow DOM UI作成
  await withAsyncErrorHandling(
    async () => {
      await createShadowRootUi(ctx, {
        name: 'better-reader-view',
        position: 'overlay',
        onMount: (container) => {
          // UIStateManagerの状態を更新
          uiStateManager.setShadowDOMAttached(true);

          // Reactコンポーネントをマウント
          const root = ReactDOM.createRoot(container);

          const handleClose = async () => {
            await deactivateReaderView(uiStateManager);
          };

          // StyleProviderでラップしてレンダリング
          root.render(
            <StyleProvider
              styleController={styleController}
              shadowRoot={container.getRootNode() as ShadowRoot}
              resourceManager={resourceManager}
            >
              <ReaderView article={article} onClose={handleClose} />
            </StyleProvider>
          );

          uiStateManager.setUIMounted(true);

          // リソースクリーンアップの登録
          resourceManager.registerCleanup(() => {
            try {
              root.unmount();
            } catch (error) {
              console.error('React root unmount エラー:', error);
            }
          });
        },
        onRemove: () => {
          uiStateManager.setShadowDOMAttached(false);
          uiStateManager.setUIMounted(false);
        },
      });

      // 状態を更新
      await uiStateManager.setReaderViewActive(
        true,
        window.location.href,
        document.title
      );
    },
    (cause) => new ShadowDOMError('Shadow DOM UI作成', cause)
  );
}

async function deactivateReaderView(
  uiStateManager: NonNullable<ReturnType<typeof createUIStateManager>>
) {
  // 状態を更新（この操作によりWXTResourceManagerが自動的にUIをクリーンアップ）
  await uiStateManager.setReaderViewActive(false);
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
