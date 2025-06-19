import React from "react";
import {
  readerViewContainer,
  readerContent,
  readerTitle,
  readerArticleContent,
  closeButton,
  readerByline,
} from "../assets/content-script.css";
import { type Article } from "../types";

interface SafeReaderViewProps {
  article: Article;
  onClose: () => void;
}

export const SafeReaderView: React.FC<SafeReaderViewProps> = ({
  article,
  onClose,
}) => {
  // Handle escape key to close reader view
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className={readerViewContainer} data-testid="safe-reader-view">
      <div className={readerContent}>
        {/* Close button */}
        <button
          onClick={onClose}
          className={closeButton}
          aria-label="Close reader view"
        >
          ✕
        </button>

        {/* Article title */}
        <h1 className={readerTitle}>{article.title}</h1>

        {/* Article byline */}
        {article.byline && <div className={readerByline}>{article.byline}</div>}

        {/* Article content */}
        <div
          className={readerArticleContent}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </div>
  );
};
