import React, { useState } from 'react';
import { StyleController } from '../utils/StyleController';
import {
  readerContainer,
  contentContainer,
  title,
  contentArea,
  styleButton,
} from './ReaderView.css';
import StylePanel from './StylePanel';

export interface ReaderViewProps {
  title: string;
  content: string;
  styleController: StyleController;
}

const ReaderView: React.FC<ReaderViewProps> = ({
  title: articleTitle,
  content: articleContent,
  styleController,
}) => {
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [styleVersion, setStyleVersion] = useState(0);

  // Re-compute theme and vars when styleVersion changes to ensure fresh values
  const themeClass = styleController.getThemeClass();
  const inlineVars = styleController.getInlineVars();

  // Use styleVersion to ensure re-render dependency tracking
  void styleVersion;

  const handleStyleChange = () => {
    // Increment styleVersion to trigger re-render
    setStyleVersion((prevVersion) => prevVersion + 1);
  };

  return (
    <div className={`${readerContainer} ${themeClass}`} style={inlineVars}>
      <button
        className={styleButton}
        onClick={() => setShowStylePanel(!showStylePanel)}
      >
        スタイル
      </button>

      {showStylePanel && (
        <StylePanel
          styleController={styleController}
          onClose={() => setShowStylePanel(false)}
          onStyleChange={handleStyleChange}
        />
      )}

      <div className={contentContainer}>
        <h1 className={title}>{articleTitle}</h1>
        <div
          className={contentArea}
          dangerouslySetInnerHTML={{ __html: articleContent }}
        />
      </div>
    </div>
  );
};

export default ReaderView;
