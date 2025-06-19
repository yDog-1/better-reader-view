import React from "react";
import ReactDOM from "react-dom/client";
import PopupMessage from "../../components/PopupMsg";
import { SafeReaderView } from "../../components/SafeReaderView";
import { Readability } from "@mozilla/readability";
import { type Article, isValidArticle } from "../../types";

const articleErrorMessage = "記事が見つかりませんでした。";

const READER_VIEW_ACTIVE_KEY = "readerViewActive";
const READER_VIEW_CONTAINER_ID = "better-reader-view-container";

// Global variables for managing the reader view
let readerViewRoot: ReactDOM.Root | null = null;
let readerViewContainer: HTMLElement | null = null;
let originalBodyOverflow: string | null = null;

export default defineContentScript({
  registration: "runtime",
  matches: [],
  cssInjectionMode: "ui",

  async main() {
    const isActive = sessionStorage.getItem(READER_VIEW_ACTIVE_KEY) === "true";

    if (isActive) {
      deactivateReaderView();
    } else {
      activateReaderViewSafely();
    }

    return;
  },
});

function activateReaderViewSafely() {
  // Parse article content using Readability
  const documentClone = document.cloneNode(true) as Document;
  const article = new Readability(documentClone).parse();

  if (isValidArticle(article)) {
    createReaderViewContainer(article);
    sessionStorage.setItem(READER_VIEW_ACTIVE_KEY, "true");
  } else {
    showPopupMessage(articleErrorMessage);
  }
}

function createReaderViewContainer(article: Article) {
  // Clean up any existing reader view
  if (readerViewContainer) {
    deactivateReaderView();
  }

  // Create container element
  readerViewContainer = document.createElement("div");
  readerViewContainer.id = READER_VIEW_CONTAINER_ID;

  // Hide page content behind reader view
  originalBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  // Append to body
  document.body.appendChild(readerViewContainer);

  // Create React root and render
  try {
    readerViewRoot = ReactDOM.createRoot(readerViewContainer);
    readerViewRoot.render(
      React.createElement(SafeReaderView, {
        article,
        onClose: deactivateReaderView,
      }),
    );
  } catch (error) {
    console.error("Failed to create reader view:", error);
    deactivateReaderView();
    showPopupMessage("リーダービューの作成に失敗しました。");
  }
}

function deactivateReaderView() {
  // Clean up React root
  if (readerViewRoot) {
    try {
      readerViewRoot.unmount();
    } catch (error) {
      console.warn("Failed to unmount React root:", error);
    }
    readerViewRoot = null;
  }

  // Remove container element
  if (readerViewContainer && readerViewContainer.parentNode) {
    readerViewContainer.parentNode.removeChild(readerViewContainer);
    readerViewContainer = null;
  }

  // Restore body overflow
  if (originalBodyOverflow !== null) {
    document.body.style.overflow = originalBodyOverflow;
    originalBodyOverflow = null;
  }

  // Update session storage
  sessionStorage.removeItem(READER_VIEW_ACTIVE_KEY);
}

function showPopupMessage(message: string) {
  const containerId = "reader-view-popup-container";
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement("div");
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
        "Cannot show popup: no body or documentElement found to append the container.",
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
