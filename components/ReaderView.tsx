import React, { useState, useEffect, useMemo } from 'react';
import { StyleController } from '../utils/StyleController';
import StylePanel from './StylePanel';
import readerViewCSS from './ReaderView.css?inline';
import stylePanelCSS from './StylePanel.css?inline';
import themeCSS from '../utils/theme.css?inline';
import {
  StyleSystemInitializationError,
  ShadowDOMError,
  RenderingError,
  withErrorHandling,
} from '../utils/errors';

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
  withErrorHandling(
    async () => {
      if (!styleController.isReady()) {
        await styleController.initializeStyles();
      }
      return true;
    },
    (cause) =>
      new StyleSystemInitializationError(
        'StyleController initialization failed in ReaderView',
        cause
      )
  );
};

/**
 * Inject CSS styles into Shadow DOM
 */
const injectCSSIntoShadowDOM = (shadowRoot: ShadowRoot | null): void => {
  if (!shadowRoot || typeof document === 'undefined') {
    return;
  }

  withErrorHandling(
    () => {
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

      return true;
    },
    (cause) => new ShadowDOMError('CSS injection into Shadow DOM', cause)
  );
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
    return (
      withErrorHandling(
        () => styleController.getCustomStyles(),
        (cause) => new RenderingError('ReaderView custom styles', cause)
      ) ?? {}
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleController, styleVersion]);

  const handleStyleChange = () => {
    // Increment styleVersion to trigger re-render
    setStyleVersion((prevVersion) => prevVersion + 1);
  };

  // Initialize StyleController and inject CSS into Shadow DOM
  useEffect(() => {
    const initStyles = async () => {
      withErrorHandling(
        async () => {
          await initializeStyleController(styleController);
          injectCSSIntoShadowDOM(shadowRoot);
          return true;
        },
        (cause) => new RenderingError('ReaderView style initialization', cause)
      );
    };

    initStyles();
  }, [shadowRoot, styleController, styleVersion]);

  const themeClass =
    withErrorHandling(
      () => styleController.getThemeClass(),
      (cause) => new RenderingError('ReaderView theme class', cause)
    ) ?? 'theme-light';

  const fontFamilyClass =
    withErrorHandling(
      () => styleController.getFontFamilyClass(),
      (cause) => new RenderingError('ReaderView font family class', cause)
    ) ?? 'font-sans';

  return (
    <div
      className={`reader-container ${themeClass} ${fontFamilyClass}`}
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
