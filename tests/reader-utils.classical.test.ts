/**
 * @vitest-environment happy-dom
 * @vitest-setup ../tests/setup-classical.ts
 */
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import {
  extractContent,
  isValidArticle,
  type Article,
} from '@/utils/reader-utils';

/**
 * 古典学派アプローチによるreader-utilsのテスト
 * - 実装詳細ではなく行動をテスト
 * - モックを最小限に抑制
 * - Given-When-Then パターンを採用
 * - テストデータビルダーで再利用可能なテストデータを生成
 */

// テストデータビルダー
class DocumentBuilder {
  private title: string = 'Default Title';
  private htmlContent: string = '';

  withTitle(title: string): DocumentBuilder {
    this.title = title;
    return this;
  }

  withArticleContent(content: string): DocumentBuilder {
    this.htmlContent = `<article>${content}</article>`;
    return this;
  }

  withComplexLayout(mainContent: string): DocumentBuilder {
    this.htmlContent = `
      <nav>
        <ul>
          <li><a href="#home">ホーム</a></li>
          <li><a href="#about">About</a></li>
        </ul>
      </nav>
      <main>
        <article>${mainContent}</article>
      </main>
      <aside>
        <h3>関連記事</h3>
        <ul>
          <li><a href="#article1">記事1</a></li>
          <li><a href="#article2">記事2</a></li>
        </ul>
      </aside>
      <footer>
        <p>© 2024 テストサイト</p>
      </footer>
    `;
    return this;
  }

  withMinimalValidContent(): DocumentBuilder {
    return this.withArticleContent(`
      <h1>最小限の有効な記事</h1>
      <p>これは最小限の有効な記事コンテンツです。Readabilityアルゴリズムが正しく処理できる十分な長さのテキストを含んでいます。Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      <p>追加の段落でコンテンツの長さを確保します。Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.</p>
    `);
  }

  withRichContent(): DocumentBuilder {
    return this.withArticleContent(`
      <h1>リッチコンテンツの記事</h1>
      <p>この記事には<strong>太字</strong>、<em>斜体</em>、<a href="#link">リンク</a>などの様々な要素が含まれています。</p>
      <blockquote>
        <p>これは引用ブロックです。重要な情報を強調するために使用されます。</p>
      </blockquote>
      <ul>
        <li>リスト項目1</li>
        <li>リスト項目2</li>
        <li>リスト項目3</li>
      </ul>
      <p>最後の段落で十分なコンテンツ長を確保します。Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
    `);
  }

  withJapaneseContent(): DocumentBuilder {
    return this.withTitle('日本語の記事タイトル').withArticleContent(`
      <h1>日本語記事のテスト</h1>
      <p>これは日本語で書かれた記事です。ひらがな、カタカナ、漢字が正しく処理されることを確認します。</p>
      <p>技術記事では英数字も多用されます。JavaScript、HTML、CSS等の専門用語が含まれることがあります。</p>
      <p>十分な長さのコンテンツでReadabilityアルゴリズムの最小要件を満たします。日本語の文字エンコーディングも適切に処理される必要があります。</p>
    `);
  }

  withMediaElements(): DocumentBuilder {
    return this.withArticleContent(`
      <h1>メディア要素を含む記事</h1>
      <p>この記事には画像と動画が含まれています。</p>
      <img src="/test-image.jpg" alt="テスト画像" width="400" height="300" />
      <p>画像の説明文です。アルトテキストがアクセシビリティのために重要です。</p>
      <video controls width="640" height="360">
        <source src="/test-video.mp4" type="video/mp4" />
        <source src="/test-video.webm" type="video/webm" />
        お使いのブラウザは動画タグをサポートしていません。
      </video>
      <p>動画コンテンツの説明も含まれます。十分な長さのテキストでReadabilityの要件を満たします。</p>
    `);
  }

  withInsufficientContent(): DocumentBuilder {
    return this.withArticleContent(`<p>短</p>`);
  }

  withEmptyContent(): DocumentBuilder {
    this.htmlContent = '';
    return this;
  }

  withSpecialCharacters(): DocumentBuilder {
    return this.withTitle('特殊文字テスト 🚀').withArticleContent(`
      <h1>特殊文字とエモジのテスト 🌟</h1>
      <p>HTML実体参照: &lt; &gt; &amp; &quot; &#39;</p>
      <p>Unicode記号: ™ ® © § ¶ † ‡ • … ‰</p>
      <p>エモジ: 🎉 🎊 💡 📝 📚 🔥 ⚡ 🌈 🦄</p>
      <p>数学記号: ∀ ∃ ∅ ∆ ∇ ∈ ∉ ∋ ∌ ∑ ∞ ∠ ∧ ∨</p>
      <p>十分な長さのコンテンツでReadabilityアルゴリズムの処理を確認します。</p>
    `);
  }

  build(): Document {
    const jsdom = new JSDOM(`
      <!DOCTYPE html>
      <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <title>${this.title}</title>
        </head>
        <body>
          ${this.htmlContent}
        </body>
      </html>
    `);
    return jsdom.window.document;
  }
}

// テストヘルパー関数
function createDocument(): DocumentBuilder {
  return new DocumentBuilder();
}

describe('reader-utils: Content Extraction (Classical Approach)', () => {
  describe('extractContent 関数', () => {
    describe('正常なコンテンツ抽出', () => {
      it('Given: 最小限の有効な記事, When: コンテンツを抽出, Then: タイトルとコンテンツが返される', () => {
        // Given
        const document = createDocument()
          .withTitle('テスト記事')
          .withMinimalValidContent()
          .build();

        // When
        const result = extractContent(document);

        // Then
        expect(result).not.toBeNull();
        expect(result!.title).toBe('テスト記事');
        expect(result!.content).toContain('最小限の有効な記事');
        expect(result!.content).toContain('Lorem ipsum');
      });

      it('Given: リッチな要素を含む記事, When: コンテンツを抽出, Then: HTML要素が適切に保持される', () => {
        // Given
        const document = createDocument()
          .withTitle('リッチコンテンツ')
          .withRichContent()
          .build();

        // When
        const result = extractContent(document);

        // Then
        expect(result).not.toBeNull();
        expect(result!.content).toContain('<strong>太字</strong>');
        expect(result!.content).toContain('<em>斜体</em>');
        expect(result!.content).toContain('<a href="#link">リンク</a>');
        expect(result!.content).toContain('<blockquote>');
        expect(result!.content).toContain('<ul>');
      });

      it('Given: 複雑なレイアウトの記事, When: コンテンツを抽出, Then: メインコンテンツのみが抽出される', () => {
        // Given
        const mainContent = `
          <h1>メインコンテンツ</h1>
          <p>これがメインの記事内容です。ナビゲーションやサイドバーは除外されるべきです。十分な長さのコンテンツでReadabilityの要件を満たします。</p>
          <p>追加の段落でコンテンツの品質を確保します。Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        `;
        const document = createDocument()
          .withTitle('複雑なレイアウト')
          .withComplexLayout(mainContent)
          .build();

        // When
        const result = extractContent(document);

        // Then
        expect(result).not.toBeNull();
        expect(result!.content).toContain('メインコンテンツ');
        expect(result!.content).toContain('メインの記事内容');
        // ナビゲーション要素は含まれないはず
        expect(result!.content).not.toContain('ホーム');
        expect(result!.content).not.toContain('関連記事');
      });

      it('Given: 日本語記事, When: コンテンツを抽出, Then: 日本語が適切に処理される', () => {
        // Given
        const document = createDocument().withJapaneseContent().build();

        // When
        const result = extractContent(document);

        // Then
        expect(result).not.toBeNull();
        expect(result!.title).toBe('日本語の記事タイトル');
        expect(result!.content).toContain('ひらがな、カタカナ、漢字');
        expect(result!.content).toContain('JavaScript、HTML、CSS');
      });

      it('Given: 特殊文字とエモジを含む記事, When: コンテンツを抽出, Then: 特殊文字が適切に保持される', () => {
        // Given
        const document = createDocument().withSpecialCharacters().build();

        // When
        const result = extractContent(document);

        // Then
        expect(result).not.toBeNull();
        expect(result!.title).toContain('🚀');
        expect(result!.content).toContain('&lt; &gt; &amp;');
        expect(result!.content).toContain('🎉 🎊 💡');
        expect(result!.content).toContain('∀ ∃ ∅');
      });

      it('Given: メディア要素を含む記事, When: コンテンツを抽出, Then: メディア要素が適切に処理される', () => {
        // Given
        const document = createDocument()
          .withTitle('メディアテスト')
          .withMediaElements()
          .build();

        // When
        const result = extractContent(document);

        // Then
        expect(result).not.toBeNull();
        expect(result!.content).toContain('<img');
        expect(result!.content).toContain('alt="テスト画像"');
        expect(result!.content).toContain('<video');
        expect(result!.content).toContain('controls');
      });
    });

    describe('コンテンツ抽出の失敗ケース', () => {
      it('Given: 空のドキュメント, When: コンテンツを抽出, Then: nullが返される', () => {
        // Given
        const document = createDocument().withEmptyContent().build();

        // When
        const result = extractContent(document);

        // Then
        expect(result).toBeNull();
      });

      it('Given: 不十分なコンテンツ, When: コンテンツを抽出, Then: 短いコンテンツでも抽出される（実際のReadabilityの動作）', () => {
        // Given
        const document = createDocument().withInsufficientContent().build();

        // When
        const result = extractContent(document);

        // Then: Mozilla Readabilityは短いコンテンツでも抽出することがある
        // この動作は実際のライブラリの仕様
        expect(result).not.toBeNull();
        expect(result!.title).toBe('Default Title');
        expect(result!.content).toContain('短');
      });

      it('Given: タイトルなしの記事, When: コンテンツを抽出, Then: nullが返される', () => {
        // Given
        const document = createDocument()
          .withTitle('')
          .withMinimalValidContent()
          .build();

        // When
        const result = extractContent(document);

        // Then
        expect(result).toBeNull();
      });
    });
  });

  describe('isValidArticle 関数', () => {
    describe('有効な記事の検証', () => {
      it('Given: 完全な記事オブジェクト, When: 検証, Then: trueが返される', () => {
        // Given
        const validArticle: Article = {
          title: 'テスト記事',
          content: '<p>コンテンツ</p>',
          textContent: 'コンテンツ',
          length: 100,
          excerpt: '抜粋',
          byline: '著者名',
          dir: 'ltr',
          siteName: 'サイト名',
          lang: 'ja',
        };

        // When
        const result = isValidArticle(validArticle);

        // Then
        expect(result).toBe(true);
      });

      it('Given: 最小限の有効な記事, When: 検証, Then: trueが返される', () => {
        // Given
        const minimalArticle = {
          title: 'タイトル',
          content: 'コンテンツ',
          textContent: 'コンテンツ',
          length: 10,
          excerpt: '抜粋',
          byline: null,
          dir: null,
          siteName: null,
          lang: null,
        };

        // When
        const result = isValidArticle(minimalArticle);

        // Then
        expect(result).toBe(true);
      });
    });

    describe('無効な記事の検証', () => {
      it('Given: null, When: 検証, Then: falseが返される', () => {
        // Given & When
        const result = isValidArticle(null);

        // Then
        expect(result).toBe(false);
      });

      it('Given: undefined, When: 検証, Then: falseが返される', () => {
        // Given & When
        const result = isValidArticle(undefined);

        // Then
        expect(result).toBe(false);
      });

      it('Given: 空のタイトルを持つ記事, When: 検証, Then: falseが返される', () => {
        // Given
        const invalidArticle = {
          title: '',
          content: 'コンテンツ',
          textContent: 'コンテンツ',
          length: 10,
          excerpt: '抜粋',
        };

        // When
        const result = isValidArticle(invalidArticle);

        // Then
        expect(result).toBe(false);
      });

      it('Given: 空のコンテンツを持つ記事, When: 検証, Then: falseが返される', () => {
        // Given
        const invalidArticle = {
          title: 'タイトル',
          content: '',
          textContent: 'テキスト',
          length: 10,
          excerpt: '抜粋',
        };

        // When
        const result = isValidArticle(invalidArticle);

        // Then
        expect(result).toBe(false);
      });

      it('Given: 必須プロパティが欠如した記事, When: 検証, Then: falseが返される', () => {
        // Given
        const incompleteArticle = {
          title: 'タイトル',
          content: 'コンテンツ',
          // textContent, length, excerpt が欠如
        };

        // When
        const result = isValidArticle(incompleteArticle);

        // Then
        expect(result).toBe(false);
      });

      it('Given: 不正な型のプロパティを持つ記事, When: 検証, Then: falseが返される', () => {
        // Given
        const invalidTypeArticle = {
          title: 123, // 数値（文字列であるべき）
          content: 'コンテンツ',
          textContent: 'テキスト',
          length: 10,
          excerpt: '抜粋',
        };

        // When
        const result = isValidArticle(invalidTypeArticle);

        // Then
        expect(result).toBe(false);
      });
    });
  });
});
