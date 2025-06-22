import ReactDOM from 'react-dom/client';
import './style.css';
import PopupMessage from '@/components/popupMsg';
import { activateReader, deactivateReader } from '@/utils/reader-utils';

const articleErrorMessage = '記事が見つかりませんでした。';

const READER_VIEW_ACTIVE_KEY = 'readerViewActive';

export default defineContentScript({
  registration: 'runtime',
  matches: [],
  cssInjectionMode: 'ui',

  async main() {
    const isActive = sessionStorage.getItem(READER_VIEW_ACTIVE_KEY) === 'true';

    if (isActive) {
      deactivateReaderView();
    } else {
      activateReaderViewFunc();
    }

    return;
  },
});

function activateReaderViewFunc() {
  const success = activateReader(document);

  if (success) {
    sessionStorage.setItem(READER_VIEW_ACTIVE_KEY, 'true');
  } else {
    showPopupMessage(articleErrorMessage);
  }
}

function deactivateReaderView() {
  deactivateReader(document);
  sessionStorage.removeItem(READER_VIEW_ACTIVE_KEY);
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
