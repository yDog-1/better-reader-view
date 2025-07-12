import React, { useState, useEffect, useMemo } from 'react';
import { StyleController } from '../utils/StyleController';
import StylePanel from './StylePanel';

export interface ReaderViewProps {
  title: string;
  content: string;
  styleController: StyleController;
  shadowRoot: ShadowRoot;
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
    /* Shadow DOM Root - Contains all shared styles */
    :host {
      all: initial;
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: ${colors.background};
      z-index: 2147483647;
      overflow: auto;
      box-sizing: border-box;
      font-family: ${currentFontFamily};
      font-size: ${currentFontSize};
      line-height: 1.7;
      color: ${colors.text};
    }

    /* Selective reset for all elements in Shadow DOM - preserve font inheritance */
    *,
    *::before,
    *::after {
      margin: 0;
      padding: 0;
      border: 0;
      outline: 0;
      vertical-align: baseline;
      box-sizing: border-box;
    }

    /* Reader Container - Layout with proper background and scroll */
    .reader-container {
      display: block;
      width: 100%;
      height: 100%;
      background-color: ${colors.background};
      overflow: auto;
    }

    /* Content Container - Layout with inherited styles */
    .content-container {
      display: block;
      max-width: 70ch;
      margin: 24px auto;
      padding: 24px;
      background-color: ${colors.background};
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
      color: inherit;
    }

    /* Title Styles - Override font-size and line-height only */
    .title {
      display: block;
      font-size: calc(${currentFontSize} * 1.5);
      margin-bottom: 1em;
      font-weight: 600;
      line-height: 1.2;
      font-family: inherit;
      color: ${colors.text};
    }

    /* Content Area - Inherits all styles from :host */
    .content-area {
      display: block;
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
      color: inherit;
    }

    /* Style Button */
    .style-button {
      display: inline-block;
      position: fixed;
      top: 16px;
      right: 16px;
      padding: 8px 12px;
      background-color: ${colors.accent};
      color: ${colors.background};
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-family: ${currentFontFamily};
      cursor: pointer;
      z-index: 2147483648;
    }

    .style-button:hover {
      opacity: 0.8;
    }

    /* Content Element Styles with proper display and inheritance */
    .content-area p {
      display: block;
      font-size: ${currentFontSize};
      margin-bottom: 1em;
      line-height: 1.7;
      font-family: ${currentFontFamily};
      color: ${colors.text};
    }

    .content-area li {
      display: list-item;
      font-size: ${currentFontSize};
      margin-bottom: 0.5em;
      line-height: 1.7;
      font-family: ${currentFontFamily};
      color: ${colors.text};
    }

    .content-area blockquote {
      display: block;
      font-size: ${currentFontSize};
      margin: 1.5em 0;
      padding-left: 1em;
      border-left: 4px solid ${colors.border};
      font-style: italic;
      line-height: 1.7;
      font-family: ${currentFontFamily};
      color: ${colors.text};
    }

    .content-area a {
      color: ${colors.accent};
      text-decoration: underline;
      font-family: ${currentFontFamily};
      font-size: inherit;
    }

    .content-area img,
    .content-area video,
    .content-area figure {
      display: block;
      max-width: 100%;
      height: auto;
      margin: 1.5em 0;
    }

    .content-area pre {
      display: block;
      background-color: ${colors.border};
      padding: 1em;
      overflow-x: auto;
      border-radius: 4px;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
      font-size: 14px;
      color: ${colors.text};
    }

    .content-area code {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
      font-size: 14px;
      color: ${colors.text};
    }

    .content-area ul,
    .content-area ol {
      display: block;
      margin: 1em 0;
      padding-left: 2em;
    }

    .content-area ul {
      list-style-type: disc;
    }

    .content-area ol {
      list-style-type: decimal;
    }

    .content-area strong {
      font-weight: 600;
      font-family: ${currentFontFamily};
      color: ${colors.text};
    }

    .content-area em {
      font-style: italic;
      font-family: ${currentFontFamily};
      color: ${colors.text};
    }

    .content-area h1,
    .content-area h2,
    .content-area h3,
    .content-area h4,
    .content-area h5,
    .content-area h6 {
      display: block;
      font-weight: 600;
      margin-bottom: 0.8em;
      margin-top: 1.2em;
      color: ${colors.text};
      font-family: ${currentFontFamily};
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

    /* Ensure proper inheritance for content elements */
    .content-area * {
      font-family: inherit;
      color: inherit;
    }
  `;
}

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

  // Inject CSS into Shadow DOM
  useEffect(() => {
    if (!shadowRoot || typeof document === 'undefined') {
      return;
    }

    // Remove existing style elements to avoid duplicates
    const existingStyles = shadowRoot.querySelectorAll(
      'style[data-reader-view]'
    );
    existingStyles.forEach((style) => style.remove());

    // Inject base styles with CSS variables
    try {
      const style =
        shadowRoot.ownerDocument?.createElement('style') ||
        document.createElement('style');
      style.setAttribute('data-reader-view', 'true');
      style.textContent = generateShadowDOMStyles(styleController);
      shadowRoot.appendChild(style);
    } catch (error) {
      console.warn('Failed to inject styles into shadow root:', error);
    }
  }, [shadowRoot, styleController, styleVersion]);

  return (
    <div
      className={`reader-container ${styleController.getThemeClass()}`}
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
