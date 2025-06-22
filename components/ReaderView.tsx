import React from 'react';

export interface ReaderViewProps {
  title: string;
  content: string;
}

const ReaderView: React.FC<ReaderViewProps> = ({ title, content }) => {
  return (
    <div
      style={{
        all: 'initial',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#fff',
        zIndex: 2147483647,
        overflow: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
          lineHeight: '1.7',
          maxWidth: '70ch',
          margin: '2rem auto',
          padding: '2rem',
          color: '#1a1a1a',
          fontSize: '16px',
          boxSizing: 'border-box',
        }}
      >
        <style>
          {`
            * {
              all: unset;
              display: revert;
              box-sizing: border-box;
            }
            h1 { 
              font-size: 2.2em; 
              margin-bottom: 1em; 
              color: #000; 
              font-weight: 600;
              font-family: inherit;
              line-height: 1.2;
            }
            p, li, blockquote { 
              font-size: 1.1em; 
              margin-bottom: 1em;
              line-height: inherit;
              font-family: inherit;
            }
            a { 
              color: #007bff;
              text-decoration: underline;
            }
            img, video, figure { 
              max-width: 100%; 
              height: auto; 
              margin: 1.5em 0;
              display: block;
            }
            pre { 
              background-color: #f0f0f0; 
              padding: 1em; 
              overflow-x: auto; 
              border-radius: 4px;
              font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
            }
            code { 
              font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
            }
            ul, ol {
              margin: 1em 0;
              padding-left: 2em;
            }
            blockquote {
              margin: 1.5em 0;
              padding-left: 1em;
              border-left: 4px solid #ccc;
              font-style: italic;
            }
            strong {
              font-weight: bold;
            }
            em {
              font-style: italic;
            }
          `}
        </style>
        <h1>{title}</h1>
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};

export default ReaderView;
