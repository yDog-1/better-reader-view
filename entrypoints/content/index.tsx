import React from 'react';
import ReactDOM from 'react-dom/client';
import type { ContentScriptContext } from 'wxt/utils/content-script-context';
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root';
import DOMPurify from 'dompurify';
import { Readability } from '@mozilla/readability';
import './style.css';
import ReaderView from '@/components/ReaderView';
import PopupMessage from '@/components/popupMsg';
import { StyleController } from '@/utils/StyleController';
import { isValidArticle } from '@/utils/typeGuards';
import type { Article } from '@/utils/types';
import {
  StyleSystemInitializationError,
  ShadowDOMError,
  StorageError,
  ArticleExtractionError,
  RenderingError,
  ErrorHandler,
  withErrorHandling,
  withAsyncErrorHandling,
} from '@/utils/errors';
import { StorageManager } from '@/utils/storage-config';
import { StyleProvider } from '@/components/StyleProvider';
import { WXTUIStateManager } from '@/utils/WXTUIStateManager';
import { WXTResourceManager } from '@/utils/WXTResourceManager';

const articleErrorMessage = '記事が見つかりませんでした。';

// 記事抽出関数
function extractContent(document: Document): Article | null {
  const documentClone = document.cloneNode(true) as Document;
  const article = new Readability(documentClone).parse();

  if (!isValidArticle(article)) {
    return null;
  }

  // DOMPurify でサニタイズ
  const sanitizedContent = DOMPurify.sanitize(article.content);

  return {
    title: article.title,
    content: sanitizedContent,
    textContent: article.textContent || '',
    length: article.length || 0,
    excerpt: article.excerpt || '',
    byline: article.byline || '',
    dir: article.dir || '',
    siteName: article.siteName || '',
    lang: article.lang || '',
    publishedTime: article.publishedTime || '',
  } as Article;
}

export default defineContentScript({
  registration: 'runtime',
  matches: [],
  cssInjectionMode: 'ui',

  async main(ctx: ContentScriptContext) {
    // WXTUIStateManagerを使用してStyleControllerを初期化
    const styleController = withErrorHandling(
      () =>
        WXTUIStateManager.createInstance(
          'styleController',
          ctx,
          () => new StyleController()
        ),
      (cause) =>
        new StyleSystemInitializationError(
          'StyleControllerの作成に失敗しました',
          cause
        )
    );

    if (!styleController) {
      ErrorHandler.handle(
        new StyleSystemInitializationError(
          'StyleControllerの初期化に失敗しました'
        )
      );
      return;
    }

    // レガシーストレージからの移行を実行
    await withAsyncErrorHandling(
      () => StorageManager.migrateFromLegacyStorage(),
      (cause) => new StorageError('レガシーストレージからの移行', cause)
    );

    // ストレージから設定を読み込み
    await withAsyncErrorHandling(
      () => styleController.loadFromStorage(),
      (cause) =>
        new StorageError('コンテンツスクリプトでのスタイル設定読み込み', cause)
    );

    await toggleReaderView(ctx, styleController);

    return;
  },
});

async function toggleReaderView(
  ctx: ContentScriptContext,
  styleController: StyleController
) {
  await withAsyncErrorHandling(
    async () => {
      // リソースマネージャーを初期化
      if (!resourceManager) {
        resourceManager = new WXTResourceManager(ctx);
      }

      // ストレージから状態を取得
      const state = await StorageManager.getReaderViewState();
      const isActive = state.isActive;

      if (isActive) {
        // リーダービューを無効化
        await deactivateReaderView();
      } else {
        // リーダービューを有効化
        await activateReaderView(ctx, styleController);
      }
      return true;
    },
    (cause) => new ShadowDOMError('リーダービューの切り替え', cause)
  );
}

// WXTのcreateShadowRootUiの戻り値の型を定義
interface WXTShadowRootUI {
  mount(): void;
  remove(): void;
}

let currentUI: WXTShadowRootUI | null = null;
let resourceManager: WXTResourceManager | null = null;

async function activateReaderView(
  ctx: ContentScriptContext,
  styleController: StyleController
) {
  // 記事の抽出
  const article = withErrorHandling(
    () => extractContent(document),
    (cause) => new ArticleExtractionError(cause)
  );

  if (!article) {
    showPopupMessage(articleErrorMessage);
    return;
  }

  // WXTのcreateShadowRootUiを使用してShadow DOM UI作成
  await withAsyncErrorHandling(
    async () => {
      const ui = await createShadowRootUi(ctx, {
        name: 'better-reader-view',
        position: 'overlay',
        anchor: 'body',
        isolateEvents: false,
        onMount: (container: HTMLElement, shadow: ShadowRoot) => {
          // Reactコンポーネントをマウント
          const root = ReactDOM.createRoot(container);

          // StyleProviderでラップしたReaderViewコンポーネントをレンダリング
          root.render(
            <StyleProvider container={container} ctx={ctx}>
              <ReaderView
                title={article.title}
                content={article.content}
                styleController={styleController}
                shadowRoot={shadow}
              />
            </StyleProvider>
          );

          // React rootを返すことで、onRemoveで自動的にunmountされる
          return root;
        },
        onRemove: (root: ReactDOM.Root | undefined) => {
          // React rootのアンマウント
          root?.unmount();
        },
      });

      // UIをマウント
      ui.mount();
      currentUI = ui;

      // 状態を更新
      await StorageManager.activateReaderView(
        window.location.href,
        document.title
      );
    },
    (cause) => new ShadowDOMError('Shadow DOM UI作成', cause)
  );
}

async function deactivateReaderView() {
  await withAsyncErrorHandling(
    async () => {
      // UIをクリーンアップ
      if (currentUI) {
        currentUI.remove();
        currentUI = null;
      }

      // 状態を更新
      await StorageManager.deactivateReaderView();
    },
    (cause) => new ShadowDOMError('リーダービューの無効化', cause)
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
        container.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 2147483647;
          max-width: 300px;
        `;
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
      root.render(
        <PopupMessage
          message={message}
          onClose={() => {
            try {
              root.unmount();
              container?.remove();
            } catch (error) {
              console.error('ポップアップメッセージの削除中にエラー:', error);
            }
          }}
        />
      );

      // 3秒後に自動的に削除（WXTResourceManagerを使用）
      if (resourceManager) {
        resourceManager.addTimer(() => {
          try {
            root.unmount();
            container?.remove();
          } catch (error) {
            console.error('ポップアップメッセージの削除中にエラー:', error);
          }
        }, 3000);
      } else {
        // フォールバック: 通常のsetTimeout
        setTimeout(() => {
          try {
            root.unmount();
            container?.remove();
          } catch (error) {
            console.error('ポップアップメッセージの削除中にエラー:', error);
          }
        }, 3000);
      }
    },
    (cause) => new RenderingError('ポップアップメッセージ表示', cause)
  );
}
