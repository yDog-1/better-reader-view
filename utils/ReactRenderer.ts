import ReactDOM from 'react-dom/client';
import React from 'react';
import ReaderView from '~/components/ReaderView';
import type { ReactRenderer } from './types';
import type { StyleController } from './StyleController';

/**
 * React コンポーネントのレンダリングを担当するクラス
 * React 固有の処理を分離して単体テストを容易にする
 */
export class ReactComponentRenderer implements ReactRenderer {
  /**
   * ReaderView コンポーネントを Shadow DOM にレンダリング
   */
  render(
    content: { title: string; content: string },
    shadowRoot: ShadowRoot,
    styleController: StyleController
  ): ReactDOM.Root {
    try {
      const root = ReactDOM.createRoot(shadowRoot);
      root.render(
        React.createElement(ReaderView, {
          ...content,
          styleController,
          shadowRoot,
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
  unmount(root: ReactDOM.Root): void {
    try {
      root.unmount();
    } catch (error) {
      console.warn('React root のアンマウントに失敗しました:', error);
    }
  }
}
