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

import type { Article } from '../utils/types';

export interface ReaderViewProps {
  article: Article;
  onClose: () => void;
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

const ReaderView: React.FC<ReaderViewProps> = ({ article, onClose }) => {
  return (
    <div className="reader-container">
      <div className="reader-header">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h1 className="reader-title">{article.title}</h1>
        {article.byline && <div className="reader-byline">{article.byline}</div>}
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
