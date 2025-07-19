import ReactDOM from 'react-dom/client';
import './style.css';
import PopupMessage from '@/components/popupMsg';
import {
  activateReader,
  deactivateReader,
  initializeReaderViewManager,
} from '@/utils/reader-utils';
import { StyleController } from '@/utils/StyleController';

const articleErrorMessage = '記事が見つかりませんでした。';

const READER_VIEW_ACTIVE_KEY = 'readerViewActive';

export default defineContentScript({
  registration: 'runtime',
  matches: [],
  cssInjectionMode: 'ui',

  async main() {
    // StyleControllerを初期化
    const styleController = new StyleController();

    // ストレージから設定を読み込み
    try {
      await styleController.loadFromStorage();
    } catch (error) {
      console.warn('設定の読み込みに失敗しました:', error);
      // デフォルト設定で続行
    }

    // ReaderViewManagerを初期化
    initializeReaderViewManager(styleController);

    toggleReaderView();
    return;
  },
});

function toggleReaderView() {
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
}

function showPopupMessage(message: string) {
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
      console.error(
        'Cannot show popup: no body or documentElement found to append the container.'
      );
      return;
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
}
