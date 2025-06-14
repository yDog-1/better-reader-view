import React from 'react'

interface Article {
  title: string
  content: string
  textContent: string
  length: number
  excerpt: string
  byline: string
  dir: string
  siteName: string
  lang: string
}

interface CustomStyles {
  fontSize?: string
  fontFamily?: string
  backgroundColor?: string
  textColor?: string
}

interface ReaderViewProps {
  article: Article
  isVisible: boolean
  customStyles?: CustomStyles
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  article,
  isVisible,
  customStyles = {}
}) => {
  const {
    fontSize = '16px',
    fontFamily = 'system-ui, -apple-system, sans-serif',
    backgroundColor = '#ffffff',
    textColor = '#000000'
  } = customStyles

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor,
    color: textColor,
    fontFamily,
    fontSize,
    lineHeight: '1.6',
    overflowY: 'auto',
    zIndex: 999999,
    padding: 0,
    margin: 0,
    boxSizing: 'border-box',
    display: isVisible ? 'block' : 'none'
  }

  const contentStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px'
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '2.5em',
    fontWeight: 'bold',
    marginBottom: '0.5em',
    lineHeight: '1.2'
  }

  const bylineStyle: React.CSSProperties = {
    fontSize: '0.9em',
    opacity: 0.7,
    marginBottom: '2em'
  }

  const articleContentStyle: React.CSSProperties = {
    fontSize: '1em',
    lineHeight: '1.8'
  }

  return (
    <div data-testid="reader-view" style={containerStyle}>
      <div style={contentStyle}>
        <h1 style={titleStyle}>{article.title}</h1>
        {article.byline && (
          <div style={bylineStyle}>{article.byline}</div>
        )}
        <div
          style={articleContentStyle}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </div>
  )
}