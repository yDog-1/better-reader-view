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
export const extractContent = (document: Document): { title: string; content: string } | null => {
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

// 型ガード関数: article が Article 型であるかをチェック
function isValidArticle(article: BaseArticle | null): article is Article {
  if (article === null) {
    return false;
  }
  return (
    typeof article.title === 'string' && typeof article.content === 'string'
  );
}