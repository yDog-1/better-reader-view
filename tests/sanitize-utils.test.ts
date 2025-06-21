import { describe, it, expect, beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing';
import { extractContent, renderReaderView, activateReader } from '@/lib/sanitize-utils';

// Mock DOM for testing
const createMockDocument = (title: string, content: string): Document => {
  const mockDoc = new DOMParser().parseFromString(`
    <!DOCTYPE html>
    <html>
    <head><title>${title}</title></head>
    <body>
      <article>
        <h1>${title}</h1>
        <p>${content}</p>
      </article>
    </body>
    </html>
  `, 'text/html');
  
  return mockDoc;
};

describe('sanitize-utils', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  describe('extractContent', () => {
    it('should extract content from valid document', () => {
      const mockDoc = createMockDocument('Test Article', 'This is test content');
      const result = extractContent(mockDoc);
      
      expect(result).not.toBeNull();
      expect(result?.title).toBe('Test Article');
      expect(result?.content).toContain('This is test content');
    });

    it('should return null for invalid document', () => {
      const emptyDoc = new DOMParser().parseFromString('<html></html>', 'text/html');
      const result = extractContent(emptyDoc);
      
      expect(result).toBeNull();
    });

    it('should sanitize content using DOMPurify', () => {
      const maliciousContent = '<script>alert("xss")</script>Safe content';
      const mockDoc = createMockDocument('Test', maliciousContent);
      const result = extractContent(mockDoc);
      
      expect(result?.content).not.toContain('<script>');
      expect(result?.content).toContain('Safe content');
    });
  });

  describe('renderReaderView', () => {
    it('should render HTML with title and content using destructuring', () => {
      const content = { title: 'Test Title', content: '<p>Test content</p>' };
      const html = renderReaderView(content);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<title>Test Title</title>');
      expect(html).toContain('<h1>Test Title</h1>');
      expect(html).toContain('<div><p>Test content</p></div>');
    });

    it('should include CSS styles in rendered HTML', () => {
      const content = { title: 'Test', content: 'Content' };
      const html = renderReaderView(content);
      
      expect(html).toContain('<style>');
      expect(html).toContain('font-family:');
      expect(html).toContain('line-height:');
    });

    it('should handle empty content', () => {
      const content = { title: '', content: '' };
      const html = renderReaderView(content);
      
      expect(html).toContain('<title></title>');
      expect(html).toContain('<h1></h1>');
      expect(html).toContain('<div></div>');
    });
  });

  describe('activateReader', () => {
    it('should return true for valid document', () => {
      const mockDoc = createMockDocument('Test Article', 'Valid content');
      // Create a spy for documentElement.innerHTML
      const originalInnerHTML = mockDoc.documentElement.innerHTML;
      let capturedHTML = '';
      Object.defineProperty(mockDoc.documentElement, 'innerHTML', {
        get: () => capturedHTML || originalInnerHTML,
        set: (value) => { capturedHTML = value; },
        configurable: true
      });
      
      const result = activateReader(mockDoc);
      
      expect(result).toBe(true);
      expect(capturedHTML).toContain('<!DOCTYPE html>');
    });

    it('should return false for invalid document', () => {
      const emptyDoc = new DOMParser().parseFromString('<html></html>', 'text/html');
      const result = activateReader(emptyDoc);
      
      expect(result).toBe(false);
    });

    it('should modify document.documentElement.innerHTML on success', () => {
      const mockDoc = createMockDocument('Test', 'Content');
      const originalHTML = mockDoc.documentElement.innerHTML;
      let modifiedHTML = '';
      
      Object.defineProperty(mockDoc.documentElement, 'innerHTML', {
        get: () => modifiedHTML || originalHTML,
        set: (value) => { modifiedHTML = value; },
        configurable: true
      });
      
      activateReader(mockDoc);
      
      expect(modifiedHTML).not.toBe(originalHTML);
      expect(modifiedHTML).toContain('<!DOCTYPE html>');
    });
  });
});