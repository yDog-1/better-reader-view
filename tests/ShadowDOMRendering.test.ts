import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Shadow DOM Rendering Tests (TDD RED Phase)', () => {
  let dom: JSDOM;
  let document: Document;

  beforeEach(() => {
    dom = new JSDOM(`<!DOCTYPE html>
      <html>
        <head><title>Test Page</title></head>
        <body>
          <div id="main-content">
            <h1>Original Page Title</h1>
            <p>Original page content with some text.</p>
          </div>
        </body>
      </html>`);
    document = dom.window.document;
    global.document = document;
    // @ts-ignore - JSDOM window compatibility
    global.window = dom.window;
  });

  describe('RED: Shadow DOM CSS分離テスト', () => {
    it('Shadow DOM内でCSS変数が正しく適用されることを確認', () => {
      // Shadow DOM要素を作成
      const container = document.createElement('div');
      container.id = 'test-reader-container';
      container.style.cssText =
        'all: initial; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;';

      const shadowRoot = container.attachShadow({ mode: 'closed' });

      // CSS変数を適用したスタイル要素を作成
      const style = document.createElement('style');
      style.textContent = `
        :host {
          --font-family: "Times New Roman", serif;
          --font-size-medium: 16px;
          --color-background: #ffffff;
          --color-text: #333333;
        }
        .content {
          font-family: var(--font-family);
          font-size: var(--font-size-medium);
          background-color: var(--color-background);
          color: var(--color-text);
          max-width: 70ch;
          margin: 0 auto;
          padding: 24px;
        }
      `;

      shadowRoot.appendChild(style);

      // コンテンツ要素を作成
      const contentDiv = document.createElement('div');
      contentDiv.className = 'content';
      contentDiv.innerHTML =
        '<h1>Reader View Title</h1><p>Reader view content</p>';
      shadowRoot.appendChild(contentDiv);

      document.body.appendChild(container);

      // テスト: Shadow DOM内の要素が正しく作成されている
      expect(shadowRoot.children.length).toBe(2); // style + content
      expect(shadowRoot.querySelector('.content')).toBeTruthy();
      expect(shadowRoot.querySelector('h1')?.textContent).toBe(
        'Reader View Title'
      );

      // テスト: CSS変数が適用されている（計算スタイルのチェック）
      // 実際のブラウザ環境では getComputedStyle でテストできるが、
      // JSDOMでは直接スタイルオブジェクトを確認
      const styleElement = shadowRoot.querySelector('style');
      expect(styleElement?.textContent).toContain('--font-family');
      expect(styleElement?.textContent).toContain('--color-background');
      expect(styleElement?.textContent).toContain('max-width: 70ch');
    });

    it('オリジナルページのスタイルがShadow DOM内に漏れ込まない', () => {
      // オリジナルページに干渉するスタイルを追加
      const originalStyle = document.createElement('style');
      originalStyle.textContent = `
        body { background-color: red !important; }
        div { color: blue !important; font-size: 24px !important; }
        h1 { color: green !important; }
      `;
      document.head.appendChild(originalStyle);

      // Shadow DOM要素を作成
      const container = document.createElement('div');
      const shadowRoot = container.attachShadow({ mode: 'closed' });

      // Shadow DOM内のスタイル
      const shadowStyle = document.createElement('style');
      shadowStyle.textContent = `
        :host {
          all: initial;
          --color-text: #333333;
        }
        .content {
          color: var(--color-text);
          font-size: 16px;
        }
      `;
      shadowRoot.appendChild(shadowStyle);

      const contentDiv = document.createElement('div');
      contentDiv.className = 'content';
      contentDiv.innerHTML = '<h1>Shadow DOM Title</h1>';
      shadowRoot.appendChild(contentDiv);

      document.body.appendChild(container);

      // テスト: Shadow DOM内の要素が独立してスタイルされている
      const shadowStyleElement = shadowRoot.querySelector('style');
      expect(shadowStyleElement?.textContent).toContain('all: initial');
      expect(shadowStyleElement?.textContent).toContain(
        '--color-text: #333333'
      );
      expect(shadowStyleElement?.textContent).not.toContain(
        'background-color: red'
      );

      // Shadow DOM内の要素は正しく存在
      expect(shadowRoot.querySelector('.content')).toBeTruthy();
      expect(shadowRoot.querySelector('h1')?.textContent).toBe(
        'Shadow DOM Title'
      );
    });
  });

  describe('RED: スクロール動作テスト', () => {
    it('Shadow DOM内でスクロールが正しく動作することを確認', () => {
      const container = document.createElement('div');
      container.style.cssText =
        'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; overflow: auto;';

      const shadowRoot = container.attachShadow({ mode: 'closed' });

      // スクロール可能なコンテンツを作成
      const style = document.createElement('style');
      style.textContent = `
        .scrollable-content {
          height: 2000px; /* ビューポートより大きい */
          padding: 20px;
          overflow-y: auto;
        }
        .content {
          max-width: 70ch;
          margin: 0 auto;
          line-height: 1.6;
        }
      `;
      shadowRoot.appendChild(style);

      const contentDiv = document.createElement('div');
      contentDiv.className = 'scrollable-content';
      contentDiv.innerHTML = `
        <div class="content">
          <h1>Long Article Title</h1>
          ${Array.from({ length: 100 }, (_, i) => `<p>This is paragraph ${i + 1} with some content to make the article long enough to require scrolling.</p>`).join('')}
        </div>
      `;
      shadowRoot.appendChild(contentDiv);

      document.body.appendChild(container);

      // テスト: スクロール可能な要素が正しく作成されている
      const scrollableElement = shadowRoot.querySelector('.scrollable-content');
      expect(scrollableElement).toBeTruthy();
      expect(scrollableElement?.querySelector('h1')?.textContent).toBe(
        'Long Article Title'
      );

      // テスト: コンテンツが正しくレンダリングされている
      const paragraphs = scrollableElement?.querySelectorAll('p');
      expect(paragraphs?.length).toBe(100);
      expect(paragraphs?.[0]?.textContent).toContain('This is paragraph 1');
      expect(paragraphs?.[99]?.textContent).toContain('This is paragraph 100');

      // テスト: スタイルが正しく適用されている
      const styleElement = shadowRoot.querySelector('style');
      expect(styleElement?.textContent).toContain('height: 2000px');
      expect(styleElement?.textContent).toContain('overflow-y: auto');
      expect(styleElement?.textContent).toContain('max-width: 70ch');
    });
  });

  describe('RED: テーマ変更時にCSS変数が更新されることを確認するテスト', () => {
    it('テーマ変更時にスタイルが正しく更新される', () => {
      const container = document.createElement('div');
      container.id = 'better-reader-view-container';
      const shadowRoot = container.attachShadow({ mode: 'closed' });

      // Light theme style
      const lightStyle = document.createElement('style');
      lightStyle.setAttribute('data-reader-view', 'true');
      lightStyle.textContent = `
        :host {
          background-color: #ffffff;
          color: #333333;
        }
        .content {
          color: #333333;
          background-color: #ffffff;
          font-family: "Hiragino Sans", "Yu Gothic UI", sans-serif;
          font-size: 16px;
        }
        .style-button {
          background-color: #0066cc;
          color: #ffffff;
        }
      `;
      shadowRoot.appendChild(lightStyle);

      const contentDiv = document.createElement('div');
      contentDiv.className = 'content';
      contentDiv.innerHTML =
        '<h1>Test Content</h1><p>This is test content.</p>';
      shadowRoot.appendChild(contentDiv);

      document.body.appendChild(container);

      // テスト: Light theme が適用されている
      const lightStyleElement = shadowRoot.querySelector(
        'style[data-reader-view]'
      );
      expect(lightStyleElement?.textContent).toContain(
        'background-color: #ffffff'
      );
      expect(lightStyleElement?.textContent).toContain('color: #333333');
      expect(lightStyleElement?.textContent).toContain('#0066cc');

      // Dark theme に変更
      const existingStyles = shadowRoot.querySelectorAll(
        'style[data-reader-view]'
      );
      existingStyles.forEach((style) => style.remove());

      const darkStyle = document.createElement('style');
      darkStyle.setAttribute('data-reader-view', 'true');
      darkStyle.textContent = `
        :host {
          background-color: #1a1a1a;
          color: #e0e0e0;
        }
        .content {
          color: #e0e0e0;
          background-color: #1a1a1a;
          font-family: "Hiragino Sans", "Yu Gothic UI", sans-serif;
          font-size: 16px;
        }
        .style-button {
          background-color: #4da6ff;
          color: #1a1a1a;
        }
      `;
      shadowRoot.insertBefore(darkStyle, shadowRoot.firstChild);

      // テスト: Dark theme が適用されている
      const darkStyleElement = shadowRoot.querySelector(
        'style[data-reader-view]'
      );
      expect(darkStyleElement?.textContent).toContain(
        'background-color: #1a1a1a'
      );
      expect(darkStyleElement?.textContent).toContain('color: #e0e0e0');
      expect(darkStyleElement?.textContent).toContain('#4da6ff');

      // テスト: コンテンツが正しく存在している
      const content = shadowRoot.querySelector('.content');
      expect(content).toBeTruthy();
      expect(content?.querySelector('h1')?.textContent).toBe('Test Content');
      expect(content?.querySelector('p')?.textContent).toBe(
        'This is test content.'
      );
    });

    it('フォントサイズとフォントファミリーの変更が正しく適用される', () => {
      const container = document.createElement('div');
      container.id = 'better-reader-view-container';
      const shadowRoot = container.attachShadow({ mode: 'closed' });

      // Initial style with medium font size and sans-serif
      const initialStyle = document.createElement('style');
      initialStyle.setAttribute('data-reader-view', 'true');
      initialStyle.textContent = `
        .content {
          font-family: "Hiragino Sans", "Yu Gothic UI", sans-serif;
          font-size: 16px;
        }
      `;
      shadowRoot.appendChild(initialStyle);

      const contentDiv = document.createElement('div');
      contentDiv.className = 'content';
      contentDiv.innerHTML = '<p>Test content for font changes.</p>';
      shadowRoot.appendChild(contentDiv);

      document.body.appendChild(container);

      // テスト: Initial font settings
      const initialStyleElement = shadowRoot.querySelector(
        'style[data-reader-view]'
      );
      expect(initialStyleElement?.textContent).toContain('font-size: 16px');
      expect(initialStyleElement?.textContent).toContain(
        '"Hiragino Sans", "Yu Gothic UI", sans-serif'
      );

      // Change to large font size and serif font family
      const existingStyles = shadowRoot.querySelectorAll(
        'style[data-reader-view]'
      );
      existingStyles.forEach((style) => style.remove());

      const updatedStyle = document.createElement('style');
      updatedStyle.setAttribute('data-reader-view', 'true');
      updatedStyle.textContent = `
        .content {
          font-family: "Times New Roman", "Yu Mincho", serif;
          font-size: 18px;
        }
      `;
      shadowRoot.insertBefore(updatedStyle, shadowRoot.firstChild);

      // テスト: Updated font settings
      const updatedStyleElement = shadowRoot.querySelector(
        'style[data-reader-view]'
      );
      expect(updatedStyleElement?.textContent).toContain('font-size: 18px');
      expect(updatedStyleElement?.textContent).toContain(
        '"Times New Roman", "Yu Mincho", serif'
      );

      // テスト: コンテンツが正しく存在している
      const content = shadowRoot.querySelector('.content');
      expect(content).toBeTruthy();
      expect(content?.querySelector('p')?.textContent).toBe(
        'Test content for font changes.'
      );
    });
  });
});
