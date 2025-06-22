import { describe, it, expect, beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing';
import { JSDOM } from 'jsdom';
import { activateReader } from '@/utils/reader-utils';

describe('activateReader', () => {
  beforeEach(() => {
    fakeBrowser.reset();
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

  it('should return true and transform document for valid article content', () => {
    const htmlContent = `
      <article>
        <h1>Test Article Title</h1>
        <p>This is a comprehensive test article with substantial content that should be successfully processed by Mozilla Readability. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
        <p>Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
      </article>
    `;

    const doc = createTestDocument(htmlContent, 'Test Article');
    const originalHTML = doc.documentElement.innerHTML;

    const result = activateReader(doc);

    expect(result).toBe(true);
    expect(doc.documentElement.innerHTML).not.toBe(originalHTML);
    expect(doc.documentElement.innerHTML).toContain('<body>');
    expect(doc.documentElement.innerHTML).toContain('<style>');
    expect(doc.documentElement.innerHTML).toContain('font-family:');
    expect(doc.title).toBe('Test Article');
  });

  it('should return false for empty document', () => {
    const htmlContent = '';
    const doc = createTestDocument(htmlContent, '');
    const originalHTML = doc.documentElement.innerHTML;

    const result = activateReader(doc);

    expect(result).toBe(false);
    expect(doc.documentElement.innerHTML).toBe(originalHTML);
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
    const result = activateReader(doc);

    expect(result).toBe(true);
    expect(doc.documentElement.innerHTML).toContain('<body>');
    expect(doc.documentElement.innerHTML).toContain('<style>');
    expect(doc.documentElement.innerHTML).not.toContain('<nav>');
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
    const result = activateReader(doc);

    expect(result).toBe(true);
    expect(doc.documentElement.innerHTML).not.toContain('<header>');
    expect(doc.documentElement.innerHTML).not.toContain('<footer>');
    expect(doc.documentElement.innerHTML).toContain('<body>');
    expect(doc.documentElement.innerHTML).toContain('<style>');
    expect(doc.documentElement.innerHTML).toContain('line-height:');
    expect(doc.documentElement.innerHTML).toContain('max-width:');
  });

  it('should sanitize content and prevent XSS', () => {
    const htmlContent = `
      <article>
        <h1>Security Test Article</h1>
        <p>This article tests XSS prevention. The following script should be removed by DOMPurify: <script>alert('xss')</script></p>
        <p>This content should be clean and safe. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <p>Additional content to ensure this passes Readability checks. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      </article>
    `;

    const doc = createTestDocument(htmlContent, 'Security Test');
    const result = activateReader(doc);

    expect(result).toBe(true);
    expect(doc.documentElement.innerHTML).not.toContain('<script>');
    expect(doc.documentElement.innerHTML).not.toContain('alert(');
    expect(doc.documentElement.innerHTML).toContain(
      'This content should be clean'
    );
  });

  it('should include proper CSS styling in generated HTML', () => {
    const htmlContent = `
      <article>
        <h1>Styling Test</h1>
        <p>This test verifies that the generated reader view includes proper CSS styling for typography and layout. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        <p>The styles should include font family, line height, max width, and other typography settings. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.</p>
      </article>
    `;

    const doc = createTestDocument(htmlContent, 'Styling Test');
    const result = activateReader(doc);

    expect(result).toBe(true);

    const html = doc.documentElement.innerHTML;
    expect(html).toContain('<style>');
    expect(html).toContain('font-family: -apple-system');
    expect(html).toContain('line-height: 1.7');
    expect(html).toContain('max-width: 70ch');
    expect(html).toContain('margin: 2rem auto');
    expect(html).toContain('background-color: #fff');
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
    const result = activateReader(doc);

    expect(result).toBe(true);
    expect(doc.documentElement.innerHTML).toContain('日本語の記事タイトル');
    expect(doc.documentElement.innerHTML).toContain('これは日本語で書かれた');
    expect(doc.documentElement.innerHTML).toContain('ひらがな、カタカナ、漢字');
    // Document title comes from createTestDocument parameter
    expect(doc.documentElement.innerHTML).toContain(
      '<title>日本語テストページ</title>'
    );
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
    const result = activateReader(doc);

    expect(result).toBe(true);
    expect(doc.documentElement.innerHTML).toContain('🚀');
    expect(doc.documentElement.innerHTML).toContain('🌟');
    expect(doc.documentElement.innerHTML).toContain('&lt;');
    expect(doc.documentElement.innerHTML).toContain('™');
    expect(doc.documentElement.innerHTML).toContain('∀');
    // Document title comes from createTestDocument parameter
    expect(doc.documentElement.innerHTML).toContain(
      '<title>Special Characters Test</title>'
    );
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
    const result = activateReader(doc);

    expect(result).toBe(true);
    expect(doc.documentElement.innerHTML).toContain('<img');
    expect(doc.documentElement.innerHTML).toContain(
      'alt="Test image description"'
    );
    expect(doc.documentElement.innerHTML).toContain('<video');
    expect(doc.documentElement.innerHTML).toContain('controls');
    expect(doc.documentElement.innerHTML).toContain('<figure>');
    expect(doc.documentElement.innerHTML).toContain('<figcaption>');
    expect(doc.documentElement.innerHTML).toContain('max-width: 100%');
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
    const originalHTML = doc.documentElement.innerHTML;

    const result = activateReader(doc);

    expect(result).toBe(false);
    expect(doc.documentElement.innerHTML).toEqual(originalHTML);
  });
});
