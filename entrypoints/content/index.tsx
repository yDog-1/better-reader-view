import ReactDOM from 'react-dom/client';
import './style.css';
import PopupMessage from '@/components/popupMsg';
import {
  activateReader,
  deactivateReader,
  initializeReaderViewManager,
} from '@/utils/reader-utils';
import { StyleController } from '@/utils/StyleController';
import { createPopupContainerError } from '@/utils/errors';

const articleErrorMessage = '記事が見つかりませんでした。';

const READER_VIEW_ACTIVE_KEY = 'readerViewActive';

export default defineContentScript({
  registration: 'runtime',
  matches: [],
  cssInjectionMode: 'ui',

  async main() {
    try {
      // StyleControllerを初期化
      const styleController = new StyleController();

      // ストレージから設定を読み込み
      styleController.loadFromStorage();

      // ReaderViewManagerを初期化
      initializeReaderViewManager(styleController);

      toggleReaderView();
    } catch (error) {
      // エラーをユーザーに通知
      const errorMessage = error instanceof Error ? error.message : 'エラーが発生しました';
      showPopupMessage(errorMessage);
    }
    return;
  },
});

function toggleReaderView() {
  try {
    const isActive = sessionStorage.getItem(READER_VIEW_ACTIVE_KEY) === 'true';

    if (isActive) {
      // リーダービューを無効化
      deactivateReader(document);
      sessionStorage.removeItem(READER_VIEW_ACTIVE_KEY);
    } else {
      // リーダービューを有効化
      const success = activateReader(document);

      if (success) {
        sessionStorage.setItem(READER_VIEW_ACTIVE_KEY, 'true');
      } else {
        showPopupMessage(articleErrorMessage);
      }
    }
  } catch (error) {
    // エラーをユーザーに通知
    const errorMessage = error instanceof Error ? error.message : 'エラーが発生しました';
    showPopupMessage(errorMessage);
  }
}

function showPopupMessage(message: string) {
  try {
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
        throw createPopupContainerError();
      }
    }
    const root = ReactDOM.createRoot(container);

    const handleClose = () => {
      root.unmount();
      if (container && container.parentNode) {
        // container が null でないことを確認
        container.parentNode.removeChild(container);
      }
    };

    root.render(<PopupMessage message={message} onClose={handleClose} />);
  } catch (error) {
    // showPopupMessage自体がエラーした場合のフォールバック
    // 無限ループを防ぐため、windowオブジェクトを使用
    window.alert(error instanceof Error ? error.message : 'エラーが発生しました');
  }
}
