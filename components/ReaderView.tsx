import React, { useState, useEffect, useMemo } from 'react';
import { StyleController } from '../utils/StyleController';
import StylePanel from './StylePanel';
import readerViewCSS from './ReaderView.css?inline';
import stylePanelCSS from './StylePanel.css?inline';
import themeCSS from '../utils/theme.css?inline';

export interface ReaderViewProps {
  title: string;
  content: string;
  styleController: StyleController;
  shadowRoot: ShadowRoot;
}

/**
 * Initialize StyleController asynchronously
 */
const initializeStyleController = async (
  styleController: StyleController
): Promise<void> => {
  try {
    if (!styleController.isReady()) {
      await styleController.initializeStyles();
    }
  } catch (error) {
    console.warn('スタイルシステムの初期化に失敗しました:', error);
  }
};

/**
 * Inject CSS styles into Shadow DOM
 */
const injectCSSIntoShadowDOM = (shadowRoot: ShadowRoot | null): void => {
  if (!shadowRoot || typeof document === 'undefined') {
    return;
  }

  try {
    // Remove existing style elements to avoid duplicates
    const existingStyles = shadowRoot.querySelectorAll(
      'style[data-reader-view]'
    );
    existingStyles.forEach((style) => style.remove());

    // Inject theme CSS
    const themeStyle =
      shadowRoot.ownerDocument?.createElement('style') ||
      document.createElement('style');
    themeStyle.setAttribute('data-reader-view', 'theme');
    themeStyle.textContent = themeCSS;
    shadowRoot.appendChild(themeStyle);

    // Inject ReaderView CSS
    const readerViewStyle =
      shadowRoot.ownerDocument?.createElement('style') ||
      document.createElement('style');
    readerViewStyle.setAttribute('data-reader-view', 'reader-view');
    readerViewStyle.textContent = readerViewCSS;
    shadowRoot.appendChild(readerViewStyle);

    // Inject StylePanel CSS
    const stylePanelStyle =
      shadowRoot.ownerDocument?.createElement('style') ||
      document.createElement('style');
    stylePanelStyle.setAttribute('data-reader-view', 'style-panel');
    stylePanelStyle.textContent = stylePanelCSS;
    shadowRoot.appendChild(stylePanelStyle);
  } catch (error) {
    console.warn('Shadow DOMへのCSS注入に失敗しました:', error);
  }
};

const ReaderView: React.FC<ReaderViewProps> = ({
  title: articleTitle,
  content: articleContent,
  styleController,
  shadowRoot,
}) => {
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [styleVersion, setStyleVersion] = useState(0);

  // Get custom styles from StyleController - recalculate when styleVersion changes
  const customStyles = useMemo(() => {
    return styleController.getCustomStyles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleController, styleVersion]);

  const handleStyleChange = () => {
    // Increment styleVersion to trigger re-render
    setStyleVersion((prevVersion) => prevVersion + 1);
  };

  // Initialize StyleController and inject CSS into Shadow DOM
  useEffect(() => {
    const initStyles = async () => {
      await initializeStyleController(styleController);
      injectCSSIntoShadowDOM(shadowRoot);
    };

    initStyles();
  }, [shadowRoot, styleController, styleVersion]);

  return (
    <div
      className={`reader-container ${styleController.getThemeClass()} ${styleController.getFontFamilyClass()}`}
      style={customStyles}
    >
      <button
        className="style-button"
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

      <div className="content-container">
        <h1 className="reader-title">{articleTitle}</h1>
        <div
          className="content-area"
          dangerouslySetInnerHTML={{ __html: articleContent }}
        />
      </div>
    </div>
  );
};

export default ReaderView;
