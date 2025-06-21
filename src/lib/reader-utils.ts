import { Readability } from '@mozilla/readability';
import DOMPurify from 'dompurify';

// Readability.prototype.parse の戻り値の型 (ParseResult)
type BaseArticle = typeof Readability.prototype.parse extends () => infer R
  ? R
  : never;

// title と content が string であることを保証する Article 型
export type Article = BaseArticle & {
  title: string;
  content: string;
};

// 型ガード関数: article が Article 型であるかをチェック
function isValidArticle(article: BaseArticle | null): article is Article {
  if (article === null) {
    return false;
  }
  return (
    typeof article.title === 'string' && typeof article.content === 'string'
  );
}

/**
 * 純粋関数: documentを受け取り、コンテンツを抽出する
 * @param document - 解析対象のDocument
 * @returns 抽出されたタイトルとコンテンツ、または null
 */
export const extractContent = (
  document: Document
): { title: string; content: string } | null => {
  // Readabilityには現在のdocumentのクローンを渡す
  const documentClone = document.cloneNode(true) as Document;
  const article = new Readability(documentClone).parse();

  if (isValidArticle(article)) {
    return {
      title: DOMPurify.sanitize(article.title),
      content: DOMPurify.sanitize(article.content),
    };
  }

  return null;
};

/**
 * 純粋関数: コンテンツを受け取り、レンダリング用のHTML文字列を生成する
 * @param param0 - タイトルとコンテンツを含むオブジェクト（分割代入）
 * @returns レンダリング用のHTML文字列
 */
export const renderReaderView = ({
  title,
  content,
}: {
  title: string;
  content: string;
}): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif; line-height: 1.7; max-width: 70ch; margin: 2rem auto; padding: 2rem; background-color: #fff; color: #1a1a1a; }
        h1 { font-size: 2.2em; margin-bottom: 1em; color: #000; font-weight: 600;}
        p, li, blockquote { font-size: 1.1em; margin-bottom: 1em; }
        a { color: #007bff; }
        img, video, figure { max-width: 100%; height: auto; margin: 1.5em 0; }
        pre { background-color: #f0f0f0; padding: 1em; overflow-x: auto; border-radius: 4px; }
        code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div>${content}</div>
    </body>
    </html>
  `;
};

/**
 * リーダービューをアクティベートする関数
 * 上記の純粋関数を組み合わせて使用する
 * @param document - 対象のDocument
 * @returns 成功した場合true、失敗した場合false
 */
export const activateReader = (document: Document): boolean => {
  const content = extractContent(document);
  if (content) {
    const html = renderReaderView(content);
    document.documentElement.innerHTML = html;
    return true;
  }
  return false;
};
