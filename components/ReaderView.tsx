import React, { useState, useEffect } from 'react';
import { StyleController } from '../utils/StyleController';
import StylePanel from './StylePanel';

export interface ReaderViewProps {
  title: string;
  content: string;
  styleController: StyleController;
}

/**
 * Generate CSS styles for Shadow DOM to fix CSS variable application issues
 */
function generateShadowDOMStyles(styleController: StyleController): string {
  const config = styleController.getConfig();

  // Define theme colors based on current theme
  const themeColors = {
    light: {
      text: '#333333',
      background: '#ffffff',
      accent: '#0066cc',
      border: '#e0e0e0',
    },
    dark: {
      text: '#e0e0e0',
      background: '#1a1a1a',
      accent: '#4da6ff',
      border: '#404040',
    },
    sepia: {
      text: '#5c4b37',
      background: '#f4f1ea',
      accent: '#8b4513',
      border: '#d4c4a8',
    },
  };

  const colors = themeColors[config.theme];

  // Define font sizes
  const fontSizes = {
    small: '14px',
    medium: '16px',
    large: '18px',
    xlarge: '24px',
  };

  const currentFontSize = config.customFontSize
    ? `${config.customFontSize}px`
    : fontSizes[config.fontSize];

  // Font family mapping
  const fontFamilies = {
    'sans-serif': '"Hiragino Sans", "Yu Gothic UI", sans-serif',
    serif: '"Times New Roman", "Yu Mincho", serif',
    monospace: '"Consolas", "Monaco", monospace',
  };

  const currentFontFamily = fontFamilies[config.fontFamily];

  return `
    /* CSS Reset and Base Styles */
    :host {
      all: initial;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: ${colors.background};
      z-index: 2147483647;
      overflow: auto;
      box-sizing: border-box;
    }

    * {
      box-sizing: border-box;
    }

    /* Reader Container */
    .reader-container {
      all: initial;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: ${colors.background};
      z-index: 2147483647;
      overflow: auto;
      box-sizing: border-box;
      font-family: "Hiragino Sans", "Yu Gothic UI", sans-serif;
    }

    /* Content Container - Fixed margins and max-width */
    .content-container {
      font-family: ${currentFontFamily};
      line-height: 1.7;
      max-width: 70ch;
      margin: 24px auto;
      padding: 24px;
      color: ${colors.text};
      font-size: ${currentFontSize};
      box-sizing: border-box;
    }

    /* Title Styles */
    .title {
      font-size: calc(${currentFontSize} * 1.5);
      margin-bottom: 1em;
      color: ${colors.text};
      font-weight: 600;
      font-family: ${currentFontFamily};
      line-height: 1.2;
    }

    /* Content Area */
    .content-area {
      font-size: ${currentFontSize};
      color: ${colors.text};
    }

    /* Style Button */
    .style-button {
      position: fixed;
      top: 16px;
      right: 16px;
      padding: 8px 12px;
      background-color: ${colors.accent};
      color: ${colors.background};
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-family: inherit;
      cursor: pointer;
      z-index: 2147483648;
    }

    .style-button:hover {
      opacity: 0.8;
    }

    /* Content Element Styles */
    .content-area * {
      all: unset;
      display: revert;
      box-sizing: border-box;
    }

    .content-area p,
    .content-area li,
    .content-area blockquote {
      font-size: ${currentFontSize};
      margin-bottom: 1em;
      line-height: 1.7;
      font-family: ${currentFontFamily};
      color: ${colors.text};
    }

    .content-area a {
      color: ${colors.accent};
      text-decoration: underline;
    }

    .content-area img,
    .content-area video,
    .content-area figure {
      max-width: 100%;
      height: auto;
      margin: 1.5em 0;
      display: block;
    }

    .content-area pre {
      background-color: ${colors.border};
      padding: 1em;
      overflow-x: auto;
      border-radius: 4px;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
      font-size: 14px;
    }

    .content-area code {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
      font-size: 14px;
    }

    .content-area ul,
    .content-area ol {
      margin: 1em 0;
      padding-left: 2em;
    }

    .content-area blockquote {
      margin: 1.5em 0;
      padding-left: 1em;
      border-left: 4px solid ${colors.border};
      font-style: italic;
    }

    .content-area strong {
      font-weight: 600;
    }

    .content-area em {
      font-style: italic;
    }

    .content-area h1,
    .content-area h2,
    .content-area h3,
    .content-area h4,
    .content-area h5,
    .content-area h6 {
      font-weight: 600;
      margin-bottom: 0.8em;
      margin-top: 1.2em;
      color: ${colors.text};
    }

    .content-area h1 {
      font-size: calc(${currentFontSize} * 1.5);
    }

    .content-area h2 {
      font-size: calc(${currentFontSize} * 1.3);
    }

    .content-area h3,
    .content-area h4,
    .content-area h5,
    .content-area h6 {
      font-size: calc(${currentFontSize} * 1.1);
    }
  `;
}

const ReaderView: React.FC<ReaderViewProps> = ({
  title: articleTitle,
  content: articleContent,
  styleController,
}) => {
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [styleVersion, setStyleVersion] = useState(0);

  // Re-compute vars when styleVersion changes to ensure fresh values
  const inlineVars = styleController.getInlineVars();

  // Use styleVersion to ensure re-render dependency tracking
  void styleVersion;

  const handleStyleChange = () => {
    // Increment styleVersion to trigger re-render
    setStyleVersion((prevVersion) => prevVersion + 1);
  };

  // Inject CSS into Shadow DOM
  useEffect(() => {
    const shadowRoot = document.querySelector(
      '#better-reader-view-container'
    )?.shadowRoot;
    if (shadowRoot) {
      // Remove existing style elements to avoid duplicates
      const existingStyles = shadowRoot.querySelectorAll(
        'style[data-reader-view]'
      );
      existingStyles.forEach((style) => style.remove());

      // Inject base styles with CSS variables
      const style = document.createElement('style');
      style.setAttribute('data-reader-view', 'true');
      style.textContent = generateShadowDOMStyles(styleController);
      shadowRoot.insertBefore(style, shadowRoot.firstChild);
    }
  }, [styleController, styleVersion]);

  return (
    <div className="reader-container" style={inlineVars}>
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
        <h1 className="title">{articleTitle}</h1>
        <div
          className="content-area"
          dangerouslySetInnerHTML={{ __html: articleContent }}
        />
      </div>
    </div>
  );
};

export default ReaderView;
