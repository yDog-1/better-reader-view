import DOMPurify from 'dompurify';
import type { Readability } from '@mozilla/readability';

type BaseArticle = typeof Readability.prototype.parse extends () => infer R
  ? R
  : never;

type Article = BaseArticle & {
  title: string;
  content: string;
};

/**
 * 純粋関数: documentから抽出し、DOMPurifyでサニタイズして{title, content}を返す
 */
export const extractContent = (
  document: Document
): { title: string; content: string } | null => {
  const documentClone = document.cloneNode(true) as Document;
  const article = new Readability(documentClone).parse();

  if (!isValidArticle(article)) {
    return null;
  }

  // DOMPurifyでサニタイズ
  const sanitizedContent = DOMPurify.sanitize(article.content);

  return {
    title: article.title,
    content: sanitizedContent,
  };
};

/**
 * 純粋関数: 分割代入で{title, content}を受け取り、htmlStringを返す
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
 * 純粋関数: documentを引数に受け取り、上記2つを組み合わせる
 */
export const activateReader = (document: Document): boolean => {
  const content = extractContent(document);
  if (!content) {
    return false;
  }

  const html = renderReaderView(content);
  document.documentElement.innerHTML = html;
  return true;
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
