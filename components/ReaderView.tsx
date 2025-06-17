import React from "react";
import {
  readerContainer,
  readerContent,
  readerTitle,
  readerByline,
  readerBody,
} from "../assets/reader.css";

interface Article {
  title: string;
  content: string;
  textContent: string;
  length: number;
  excerpt: string;
  byline: string;
  dir: string;
  siteName: string;
  lang: string;
}

interface CustomStyles {
  fontSize?: string;
  fontFamily?: string;
  backgroundColor?: string;
  textColor?: string;
}

interface ReaderViewProps {
  article: Article;
  isVisible: boolean;
  customStyles?: CustomStyles;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  article,
  isVisible,
}) => {
  const containerStyles = isVisible
    ? readerContainer
    : `${readerContainer} hidden`;

  return (
    <div
      data-testid="reader-view"
      className={containerStyles}
      style={{ display: isVisible ? "block" : "none" }}
    >
      <div className={readerContent}>
        <h1 className={readerTitle}>{article.title}</h1>
        {article.byline && <div className={readerByline}>{article.byline}</div>}
        <div
          className={readerBody}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </div>
  );
};
