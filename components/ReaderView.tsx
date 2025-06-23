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
  const [, forceUpdate] = useState({});

  const themeClass = styleController.getThemeClass();
  const inlineVars = styleController.getInlineVars();

  const handleStyleChange = () => {
    // Force re-render to apply new styles
    forceUpdate({});
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
