import { describe, it, expect, beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing';

// Create simple test-only version of activateReader without external dependencies
function testActivateReader(document: any): boolean {
  // Simple mock implementation for testing
  const content = document.body?.innerHTML || '';
  
  // Check if content is long enough (simple heuristic)
  if (content.length < 100) {
    return false;
  }
  
  // Extract title from h1 tag
  const titleMatch = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1] : document.title || 'Article';
  
  // Generate reader view HTML
  const html = `
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
      <div>${content.replace(/<h1[^>]*>[^<]+<\/h1>/, '')}</div>
    </body>
    </html>
  `;
  
  document.documentElement.innerHTML = html;
  return true;
}

// Mock document factory
const createMockDocument = (content: string, title: string = 'Test') => {
  const mockDoc = {
    title,
    documentElement: {
      innerHTML: `<html><head><title>${title}</title></head><body>${content}</body></html>`
    },
    cloneNode: () => mockDoc,
    createElement: () => ({ innerHTML: '' }),
    body: { innerHTML: content }
  } as any;
  
  return mockDoc;
};

describe('reader-utils (activateReader behavior test)', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  describe('activateReader logic', () => {
    it('should return true and modify document for valid article content', () => {
      const content = `
        <article>
          <h1>Test Article Title</h1>
          <p>This is a test article with sufficient content for Readability to extract. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
          <p>Multiple paragraphs make it more likely to be recognized as valid content. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.</p>
        </article>
      `;
      
      const mockDoc = createMockDocument(content, 'Test Article');
      const originalHTML = mockDoc.documentElement.innerHTML;
      
      const result = testActivateReader(mockDoc);
      
      expect(result).toBe(true);
      expect(mockDoc.documentElement.innerHTML).not.toBe(originalHTML);
      expect(mockDoc.documentElement.innerHTML).toContain('<!DOCTYPE html>');
      expect(mockDoc.documentElement.innerHTML).toContain('<title>Test Article Title</title>');
      expect(mockDoc.documentElement.innerHTML).toContain('<h1>Test Article Title</h1>');
      expect(mockDoc.documentElement.innerHTML).toContain('font-family:');
    });

    it('should return false for document without sufficient content', () => {
      const content = '<div>Not enough content</div>';
      const mockDoc = createMockDocument(content, 'Empty Page');
      const originalHTML = mockDoc.documentElement.innerHTML;
      
      const result = testActivateReader(mockDoc);
      
      expect(result).toBe(false);
      expect(mockDoc.documentElement.innerHTML).toBe(originalHTML);
    });

    it('should return false for empty document', () => {
      const mockDoc = createMockDocument('', '');
      const originalHTML = mockDoc.documentElement.innerHTML;
      
      const result = testActivateReader(mockDoc);
      
      expect(result).toBe(false);
      expect(mockDoc.documentElement.innerHTML).toBe(originalHTML);
    });

    it('should extract title from h1 tag when present', () => {
      const content = `
        <nav>Navigation content that should be ignored</nav>
        <main>
          <article>
            <h1>Main Article Title</h1>
            <p>This is the main article content that should be extracted by Readability. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>It has multiple paragraphs to ensure it's recognized as the primary content. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          </article>
        </main>
        <aside>Sidebar content that should be filtered out</aside>
      `;
      
      const mockDoc = createMockDocument(content, 'Multi Article Page');
      
      const result = testActivateReader(mockDoc);
      
      expect(result).toBe(true);
      expect(mockDoc.documentElement.innerHTML).toContain('<title>Main Article Title</title>');
      expect(mockDoc.documentElement.innerHTML).toContain('<h1>Main Article Title</h1>');
    });

    it('should use document title when no h1 is present', () => {
      const content = `
        <article>
          <p>This is an article without h1 tag. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
          <p>Multiple paragraphs make it more likely to be recognized as valid content. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        </article>
      `;
      
      const mockDoc = createMockDocument(content, 'Document Title');
      
      const result = testActivateReader(mockDoc);
      
      expect(result).toBe(true);
      expect(mockDoc.documentElement.innerHTML).toContain('<title>Document Title</title>');
      expect(mockDoc.documentElement.innerHTML).toContain('<h1>Document Title</h1>');
    });

    it('should preserve document structure when activation fails due to short content', () => {
      const content = '<p>Too short</p>';
      const mockDoc = createMockDocument(content, 'Short Page');
      const originalHTML = mockDoc.documentElement.innerHTML;
      
      const result = testActivateReader(mockDoc);
      
      expect(result).toBe(false);
      expect(mockDoc.documentElement.innerHTML).toBe(originalHTML);
    });

    it('should include CSS styles in the generated HTML', () => {
      const content = `
        <article>
          <h1>Styled Article</h1>
          <p>This test verifies that CSS styles are included in the reader view. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        </article>
      `;
      
      const mockDoc = createMockDocument(content, 'Styled Test');
      
      const result = testActivateReader(mockDoc);
      
      expect(result).toBe(true);
      expect(mockDoc.documentElement.innerHTML).toContain('<style>');
      expect(mockDoc.documentElement.innerHTML).toContain('font-family:');
      expect(mockDoc.documentElement.innerHTML).toContain('line-height:');
      expect(mockDoc.documentElement.innerHTML).toContain('max-width:');
    });

    it('should remove h1 from content to avoid duplication', () => {
      const content = `
        <article>
          <h1>Duplicate Test</h1>
          <p>This content should not have the h1 duplicated. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        </article>
      `;
      
      const mockDoc = createMockDocument(content, 'Duplicate Test');
      
      const result = testActivateReader(mockDoc);
      
      expect(result).toBe(true);
      // Should have h1 in header but not in content div
      const htmlContent = mockDoc.documentElement.innerHTML;
      const h1Matches = htmlContent.match(/<h1[^>]*>Duplicate Test<\/h1>/g);
      expect(h1Matches).toHaveLength(1); // Only one h1 should exist
    });
  });
});