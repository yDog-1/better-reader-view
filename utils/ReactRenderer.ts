import ReactDOM from 'react-dom/client';
import React from 'react';
import ReaderView from '~/components/ReaderView';
import type { ReactRenderer, Article } from './types';
import { ErrorHandler, ShadowDOMError } from './errors';
import { isReactRoot } from './typeGuards';

/**
 * React コンポーネントのレンダリングを担当するクラス
 * React 固有の処理を分離して単体テストを容易にする
 */
export class ReactComponentRenderer implements ReactRenderer {
  /**
   * ReaderView コンポーネントを Shadow DOM にレンダリング
   */
  render(
    article: Article,
    shadowRoot: ShadowRoot,
    onClose: () => void
  ): ReactDOM.Root {
    try {
      const root = ReactDOM.createRoot(shadowRoot);
      root.render(
        React.createElement(ReaderView, {
          article,
          onClose,
        })
      );
      return root;
    } catch (error) {
      throw new Error(
        `React コンポーネントのレンダリングに失敗しました: ${error}`
      );
    }
  }

  /**
   * React root をアンマウント
   */
  unmount(root: unknown): void {
    if (!isReactRoot(root)) {
      const reactRootError = new ShadowDOMError('React root validation');
      ErrorHandler.handle(reactRootError);
      return;
    }

    try {
      root.unmount();
    } catch (error) {
      const unmountError = new ShadowDOMError(
        'React root unmount',
        error as Error
      );
      ErrorHandler.handle(unmountError);
    }
  }
}
