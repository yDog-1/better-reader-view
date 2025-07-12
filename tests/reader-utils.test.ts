import { describe, it, expect, beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing';
import { JSDOM } from 'jsdom';
import { waitFor, act } from '@testing-library/react';
import {
  activateReader,
  deactivateReader,
  initializeReaderViewManager,
} from '@/utils/reader-utils';
import { StyleController } from '@/utils/StyleController';

describe('activateReader with Shadow DOM', () => {
  beforeEach(() => {
    fakeBrowser.reset();
    // StyleControllerを初期化
    const styleController = new StyleController();
    initializeReaderViewManager(styleController);
  });

  function createTestDocument(
    htmlContent: string,
    title: string = 'Test Document'
  ): Document {
    const jsdom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `);
    return jsdom.window.document;
  }

  it('should return true and add reader view container for valid article content', async () => {
    const htmlContent = `
      <article>
        <h1>Test Article Title</h1>
        <p>This is a comprehensive test article with substantial content that should be successfully processed by Mozilla Readability. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
        <p>Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
      </article>
    `;

    const doc = createTestDocument(htmlContent, 'Test Article');

    let result!: boolean;
    act(() => {
      result = activateReader(doc);
    });

    expect(result).toBe(true);

    // React renderingの完了を待つ
    await waitFor(() => {
      expect(doc.getElementById('better-reader-view-container')).toBeTruthy();
    });
    // タイトルが正しく設定されている
    expect(doc.title).toBe('Test Article');
    // 元のボディコンテンツが保存されている（非表示になっている）
    expect(doc.body.style.display).toBe('none');
  }, 10000);

  it('should return false for empty document', () => {
    const htmlContent = '';
    const doc = createTestDocument(htmlContent, '');
    const originalDisplay = doc.body.style.display;

    let result!: boolean;
    act(() => {
      result = activateReader(doc);
    });

    expect(result).toBe(false);
    expect(doc.body.style.display).toBe(originalDisplay);
    expect(doc.getElementById('better-reader-view-container')).toBeFalsy();
  });

  it('should handle document with navigation and sidebar content', () => {
    const htmlContent = `
      <nav>
        <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
        </ul>
      </nav>
      <main>
        <article>
          <h1>Main Article Content</h1>
          <p>This is the primary article content that should be extracted by Readability. The algorithm should focus on this main content and ignore the navigation and sidebar elements. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>
        </article>
      </main>
      <aside>
        <h3>Related Articles</h3>
        <ul>
          <li><a href="#article1">Article 1</a></li>
          <li><a href="#article2">Article 2</a></li>
        </ul>
      </aside>
    `;

    const doc = createTestDocument(htmlContent, 'Complex Page');
    let result!: boolean;
    act(() => {
      result = activateReader(doc);
    });

    expect(result).toBe(true);
    // リーダービューが正常に作成されている
    expect(doc.getElementById('better-reader-view-container')).toBeTruthy();
    // 元のコンテンツが保存されている（ナビゲーション要素の存在確認）
    expect(doc.body.innerHTML).toContain('<nav>');
    // 元のボディが非表示になっている
    expect(doc.body.style.display).toBe('none');
  });

  it('should handle document with mixed content types', () => {
    const htmlContent = `
      <header>
        <h1>Site Header</h1>
      </header>
      <article>
        <h2>Article Title</h2>
        <p>This article contains various types of content including text, links, and formatting. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
        <p>Here is a paragraph with <a href="#link">a link</a> and <strong>bold text</strong> and <em>italic text</em>. This should be preserved in the reader view output. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        <blockquote>
          <p>This is a blockquote that should be maintained in the reader view. It provides additional context and should be styled appropriately.</p>
        </blockquote>
        <p>Final paragraph to ensure sufficient content length. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
      </article>
      <footer>
        <p>Site Footer</p>
      </footer>
    `;

    const doc = createTestDocument(htmlContent, 'Mixed Content Page');
    let result!: boolean;
    act(() => {
      result = activateReader(doc);
    });

    expect(result).toBe(true);
    // リーダービューが正常に作成されている
    expect(doc.getElementById('better-reader-view-container')).toBeTruthy();
    // 元のコンテンツ構造が保存されている
    expect(doc.body.innerHTML).toContain('<header>');
    expect(doc.body.innerHTML).toContain('<footer>');
    // リーダービューが有効化されている
    expect(doc.body.style.display).toBe('none');
  });

  it('should handle deactivateReader correctly', () => {
    const htmlContent = `
      <article>
        <h1>Test Article</h1>
        <p>This is test content for deactivation. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <p>Additional content to ensure this passes Readability requirements. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      </article>
    `;

    const doc = createTestDocument(htmlContent, 'Deactivation Test');

    // リーダービューを有効化
    let activateResult!: boolean;
    act(() => {
      activateResult = activateReader(doc);
    });
    expect(activateResult).toBe(true);
    expect(doc.getElementById('better-reader-view-container')).toBeTruthy();
    expect(doc.body.style.display).toBe('none');

    // リーダービューを無効化
    act(() => deactivateReader(doc));
    // 元の状態に復元されている
    expect(doc.body.style.display).toBe('');
    expect(doc.getElementById('better-reader-view-container')).toBeFalsy();
  });

  it('should handle Japanese content correctly', () => {
    const htmlContent = `
      <article>
        <h1>日本語の記事タイトル</h1>
        <p>これは日本語で書かれた記事のコンテンツです。リーダービューが正しく日本語を処理できるかをテストしています。日本語の文字エンコーディングと表示が適切に機能することを確認します。</p>
        <p>ひらがな、カタカナ、漢字、そして英数字が混在した文章でも問題なく動作するはずです。Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <p>最後の段落で十分なコンテンツ長を確保します。Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. これでReadabilityの最小要件を満たすはずです。</p>
      </article>
    `;

    const doc = createTestDocument(htmlContent, '日本語テストページ');
    let result!: boolean;
    act(() => {
      result = activateReader(doc);
    });

    expect(result).toBe(true);
    expect(doc.body.style.display).toBe('none');
    expect(doc.getElementById('better-reader-view-container')).toBeTruthy();
    expect(doc.title).toBe('日本語テストページ');
  });

  it('should handle special characters and emojis', () => {
    const htmlContent = `
      <article>
        <h1>Special Characters & Emojis Test 🚀</h1>
        <p>This article contains various special characters: &lt; &gt; &amp; &quot; &#39; and Unicode symbols: ™ ® © § ¶ † ‡ • … ‰ ‱ ′ ″ ‴ ※ ‼ ⁇ ⁈ ⁉ ⁏ ⁗ ⁰ ¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹</p>
        <p>Emoji support test: 🌟 ⭐ 🎉 🎊 🚀 💡 📝 📚 🔥 ⚡ 🌈 🦄 🎯 🏆 💯 ✨ 🎨 🖥️ 📱 ⌚ 🎮 🎧 📸 🎬 🎵 🎶 Musical notes and technical symbols should be preserved.</p>
        <p>Mathematical symbols: ∀ ∃ ∄ ∅ ∆ ∇ ∈ ∉ ∋ ∌ ∏ ∐ ∑ − ∓ ∔ ∕ ∖ ∗ ∘ ∙ √ ∛ ∜ ∝ ∞ ∟ ∠ ∡ ∢ ∣ ∤ ∥ ∦ ∧ ∨ ∩ ∪ ∫ ∬ ∭ ∮ ∯ ∰ ∱ ∲ ∳ and more complex Unicode should work correctly.</p>
      </article>
    `;

    const doc = createTestDocument(htmlContent, 'Special Characters Test');
    let result!: boolean;
    act(() => {
      result = activateReader(doc);
    });

    expect(result).toBe(true);
    expect(doc.body.style.display).toBe('none');
    expect(doc.getElementById('better-reader-view-container')).toBeTruthy();
    expect(doc.title).toBe('Special Characters Test');
  });

  it('should handle content with images and videos', () => {
    const htmlContent = `
      <article>
        <h1>Media Content Test</h1>
        <p>This article contains various media elements that should be properly handled in reader view. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <img src="/test-image.jpg" alt="Test image description" width="800" height="600" />
        <p>Images should be responsive and maintain their alt text for accessibility. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <video controls width="640" height="360">
          <source src="/test-video.mp4" type="video/mp4" />
          <source src="/test-video.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
        <p>Videos should also be properly handled with their controls preserved. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        <figure>
          <img src="/figure-image.png" alt="Figure image" />
          <figcaption>This is a figure with caption that should be maintained</figcaption>
        </figure>
        <p>Figures with captions provide important context and should be preserved in reader view. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      </article>
    `;

    const doc = createTestDocument(htmlContent, 'Media Test');
    let result!: boolean;
    act(() => {
      result = activateReader(doc);
    });

    expect(result).toBe(true);
    expect(doc.body.style.display).toBe('none');
    expect(doc.getElementById('better-reader-view-container')).toBeTruthy();
    // Original media content should still be in the hidden body
    expect(doc.body.innerHTML).toContain('<img');
    expect(doc.body.innerHTML).toContain('<video');
    expect(doc.body.innerHTML).toContain('<figure>');
  });

  it('should handle documents with missing or empty titles', () => {
    const htmlContent = `
      <article>
        <h1>Extracted Article Title</h1>
        <p>This article has no document title but contains substantial content. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <p>The system should extract a title from the h1 element when document title is empty. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        <p>Additional content to ensure this passes Readability requirements. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
      </article>
    `;

    const doc = createTestDocument(htmlContent, '');
    const originalDisplay = doc.body.style.display;

    let result!: boolean;
    act(() => {
      result = activateReader(doc);
    });

    expect(result).toBe(false);
    expect(doc.body.style.display).toBe(originalDisplay);
    expect(doc.getElementById('better-reader-view-container')).toBeFalsy();
  });
});
