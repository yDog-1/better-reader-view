import ReactDOM from 'react-dom/client';
import './style.css';
import PopupMessage from '@/components/popupMsg';
import { activateReader } from '@/lib/sanitize-utils';

const articleErrorMessage = '記事が見つかりませんでした。';

const READER_VIEW_ACTIVE_KEY = 'readerViewActive';
const ORIGINAL_PAGE_HTML_KEY = 'originalPageHTML';
const ORIGINAL_PAGE_TITLE_KEY = 'originalPageTitle'; // タイトルも保存・復元

export default defineContentScript({
  registration: 'runtime',
  matches: [],
  cssInjectionMode: 'ui',

  async main() {
    // ctx は createUi で使うので引数として残す
    const isActive = sessionStorage.getItem(READER_VIEW_ACTIVE_KEY) === 'true';

    if (isActive) {
      deactivateReaderView();
    } else {
      activateReaderViewAndStoreOriginal();
    }
    // const ui = await createUi(ctx); // 元のコードにあったが、今回のリクエストとは直接関係ない
    // ui.mount();

    return;
  },
});

function activateReaderViewAndStoreOriginal() {
  const originalHTML = document.documentElement.innerHTML;
  const originalTitle = document.title;

  const success = activateReader(document);

  if (success) {
    sessionStorage.setItem(ORIGINAL_PAGE_HTML_KEY, originalHTML);
    sessionStorage.setItem(ORIGINAL_PAGE_TITLE_KEY, originalTitle);
    sessionStorage.setItem(READER_VIEW_ACTIVE_KEY, 'true');
  } else {
    showPopupMessage(articleErrorMessage);
    // 失敗した場合は保存した可能性のある情報をクリア
    sessionStorage.removeItem(ORIGINAL_PAGE_HTML_KEY);
    sessionStorage.removeItem(ORIGINAL_PAGE_TITLE_KEY);
  }
}

function deactivateReaderView() {
  const originalHTML = sessionStorage.getItem(ORIGINAL_PAGE_HTML_KEY);

  if (originalHTML) {
    document.documentElement.innerHTML = originalHTML;
    // タイトルも復元
    const originalTitle = sessionStorage.getItem(ORIGINAL_PAGE_TITLE_KEY);
    if (originalTitle) {
      document.title = originalTitle;
    }

    sessionStorage.removeItem(READER_VIEW_ACTIVE_KEY);
    sessionStorage.removeItem(ORIGINAL_PAGE_HTML_KEY);
    sessionStorage.removeItem(ORIGINAL_PAGE_TITLE_KEY);
  } else {
    showPopupMessage(
      '元のページ情報を復元できませんでした。ページをリロードしてください。'
    );
    // 念のためクリア
    sessionStorage.removeItem(READER_VIEW_ACTIVE_KEY);
    sessionStorage.removeItem(ORIGINAL_PAGE_HTML_KEY);
    sessionStorage.removeItem(ORIGINAL_PAGE_TITLE_KEY);
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
