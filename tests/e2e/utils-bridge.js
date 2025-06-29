/**
 * Firefox E2Eテスト用のUtilsブリッジ
 *
 * 実際のreader-utils.tsの核心機能をブラウザ環境で実行できるように
 * Reactやnode_modules依存を取り除いた形で提供
 */

/* global Readability, module */

/**
 * Type guard function: Check if article is valid Article type
 */
function isValidArticle(article) {
  if (!article || typeof article !== 'object') {
    return false;
  }

  return (
    typeof article.title === 'string' &&
    article.title.trim() !== '' &&
    typeof article.content === 'string' &&
    article.content.trim() !== '' &&
    typeof article.textContent === 'string' &&
    typeof article.length === 'number' &&
    typeof article.excerpt === 'string'
  );
}

/**
 * 純粋関数: documentから抽出し、DOMPurifyでサニタイズして{title, content}を返す
 * ブラウザ環境で実行するため、DOMPurifyは使用せず基本的なサニタイズのみ
 */
function extractContent(document) {
  // Mozilla Readabilityが利用可能かチェック
  if (typeof Readability === 'undefined') {
    console.warn(
      'Mozilla Readability not available, falling back to basic extraction'
    );
    return basicContentExtraction(document);
  }

  try {
    const documentClone = document.cloneNode(true);
    const article = new Readability(documentClone).parse();

    if (!isValidArticle(article)) {
      return null;
    }

    // 基本的なHTMLサニタイズ（DOMPurifyの代替）
    const sanitizedContent = basicHtmlSanitize(article.content);

    return {
      title: article.title,
      content: sanitizedContent,
    };
  } catch (error) {
    console.warn('Readability extraction failed:', error);
    return basicContentExtraction(document);
  }
}

/**
 * Mozilla Readabilityが利用できない場合のフォールバック
 */
function basicContentExtraction(document) {
  // article要素を探す
  let article = document.querySelector('article');

  // article要素がなければmain要素を探す
  if (!article) {
    article = document.querySelector('main');
  }

  // それでもなければ、一般的なコンテンツ領域を探す
  if (!article) {
    article = document.querySelector(
      '.content, .post, .entry, #content, #main'
    );
  }

  if (!article) {
    return null;
  }

  // タイトル抽出
  const titleElement =
    article.querySelector('h1, h2, .title, .headline') ||
    document.querySelector('title, h1');
  const title = titleElement ? titleElement.textContent.trim() : '';

  // コンテンツ抽出
  const content = article.innerHTML || '';

  // 基本的な妥当性チェック
  if (!title || !content || content.length < 100) {
    return null;
  }

  return {
    title,
    content: basicHtmlSanitize(content),
  };
}

/**
 * 基本的なHTMLサニタイズ（危険なタグ・属性を除去）
 */
function basicHtmlSanitize(html) {
  if (typeof html !== 'string') {
    return '';
  }

  // 危険なタグを除去
  const dangerousTags = [
    'script',
    'style',
    'iframe',
    'object',
    'embed',
    'form',
    'input',
  ];
  let sanitized = html;

  dangerousTags.forEach((tag) => {
    const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gis');
    sanitized = sanitized.replace(regex, '');

    // 自己完結タグも除去
    const selfClosingRegex = new RegExp(`<${tag}[^>]*/??>`, 'gis');
    sanitized = sanitized.replace(selfClosingRegex, '');
  });

  // 危険な属性を除去
  const dangerousAttrs = [
    'onclick',
    'onload',
    'onerror',
    'onmouseover',
    'onfocus',
    'onblur',
  ];
  dangerousAttrs.forEach((attr) => {
    const regex = new RegExp(`\\s${attr}\\s*=\\s*['"][^'"]*['"]`, 'gis');
    sanitized = sanitized.replace(regex, '');
  });

  return sanitized;
}

/**
 * DOM操作: 不要な要素を非表示にする
 */
function hideUnnecessaryElements(document) {
  const elementsToHide = [
    'nav',
    'aside',
    'footer',
    'header',
    '.advertisement',
    '.ads',
    '.ad',
    '.sidebar',
    '.menu',
    '.navigation',
    '.social',
    '.share',
    '.comments',
  ];

  let hiddenCount = 0;

  elementsToHide.forEach((selector) => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        if (element && element.style) {
          element.style.display = 'none';
          hiddenCount++;
        }
      });
    } catch (error) {
      console.warn(`Failed to hide elements with selector ${selector}:`, error);
    }
  });

  return {
    hiddenCount,
    success: hiddenCount > 0,
  };
}

/**
 * Reader Viewの動作をシミュレート
 */
function simulateReaderView(document) {
  try {
    // 1. コンテンツ抽出
    const content = extractContent(document);
    if (!content) {
      return {
        success: false,
        reason: 'content_extraction_failed',
        content: null,
        hiddenElements: 0,
      };
    }

    // 2. 不要要素の非表示
    const hiddenResult = hideUnnecessaryElements(document);

    return {
      success: true,
      content,
      hiddenElements: hiddenResult.hiddenCount,
      originalTitle: document.title,
    };
  } catch (error) {
    return {
      success: false,
      reason: 'execution_error',
      error: error.message,
      content: null,
      hiddenElements: 0,
    };
  }
}

// グローバルに関数を公開（Playwrightのpage.evaluate()で使用）
if (typeof window !== 'undefined') {
  window.ReaderUtils = {
    extractContent,
    isValidArticle,
    hideUnnecessaryElements,
    simulateReaderView,
    basicContentExtraction,
    basicHtmlSanitize,
  };
}

// CommonJS/ESModuleサポート（テスト環境用）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    extractContent,
    isValidArticle,
    hideUnnecessaryElements,
    simulateReaderView,
    basicContentExtraction,
    basicHtmlSanitize,
  };
}
