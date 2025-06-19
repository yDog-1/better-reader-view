import React from "react";
import {
  readerContainer,
  readerContent,
  readerTitle,
  readerByline,
  readerBody,
} from "../assets/reader.css";
import { type Article, type CustomStyles } from "../types";

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
