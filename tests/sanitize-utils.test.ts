import { describe, it, expect, beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing';
import { renderReaderView } from '../src/lib/sanitize-utils';

describe('sanitize-utils', () => {
  beforeEach(() => {
    fakeBrowser.reset();
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
});
