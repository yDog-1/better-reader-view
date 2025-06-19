// Common type definitions for Better Reader View
import { type Theme } from "../assets/css-variables";

/**
 * Article type for reader view content
 * Based on Mozilla Readability API result with extended properties
 */
export interface Article {
  title: string;
  content: string;
  textContent: string;
  length: number;
  excerpt: string;
  byline: string | null;
  dir: string | null;
  siteName: string | null;
  lang: string | null;
}

/**
 * Settings interface for user preferences
 */
export interface Settings {
  fontSize: string;
  fontFamily: string;
  theme: Theme;
  backgroundColor: string;
  textColor: string;
}

/**
 * Custom styles interface for dynamic styling
 */
export interface CustomStyles {
  fontSize?: string;
  fontFamily?: string;
  backgroundColor?: string;
  textColor?: string;
  theme?: Theme;
}

/**
 * Type guard function: Check if article is valid Article type
 */
export function isValidArticle(article: unknown): article is Article {
  if (!article || typeof article !== "object") {
    return false;
  }

  const candidateArticle = article as Partial<Article>;

  return (
    typeof candidateArticle.title === "string" &&
    candidateArticle.title.trim() !== "" &&
    typeof candidateArticle.content === "string" &&
    candidateArticle.content.trim() !== "" &&
    typeof candidateArticle.textContent === "string" &&
    typeof candidateArticle.length === "number" &&
    typeof candidateArticle.excerpt === "string"
  );
}

/**
 * Type guard function: Check if settings object is valid
 */
export function isValidSettings(obj: unknown): obj is Settings {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  const candidate = obj as Partial<Settings>;

  return (
    typeof candidate.fontSize === "string" &&
    typeof candidate.fontFamily === "string" &&
    typeof candidate.theme === "string" &&
    ["light", "dark", "sepia"].includes(candidate.theme as string) &&
    typeof candidate.backgroundColor === "string" &&
    typeof candidate.textColor === "string"
  );
}
