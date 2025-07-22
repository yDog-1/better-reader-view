import React from 'react';

import type { Article } from '../utils/types';

export interface ReaderViewProps {
  article: Article;
  onClose: () => void;
}

const ReaderView: React.FC<ReaderViewProps> = ({ article, onClose }) => {
  return (
    <div className="reader-container">
      <div className="reader-header">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h1 className="reader-title">{article.title}</h1>
        {article.byline && (
          <div className="reader-byline">{article.byline}</div>
        )}
      </div>

      <div className="content-container">
        <div
          className="content-area"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </div>
  );
};

export default ReaderView;
