import { describe, it, expect } from 'vitest';
import { renderReaderView } from '../src/lib/reader-utils';

describe('Reader Utils', () => {
  describe('renderReaderView', () => {
    it('should generate valid HTML with proper structure', () => {
      const content = {
        title: 'Test Article',
        content: '<p>Test content</p>',
      };

      const html = renderReaderView(content);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html>');
      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
      expect(html).toContain('<h1>Test Article</h1>');
      expect(html).toContain('<p>Test content</p>');
    });

    it('should include CSS styles for reader view', () => {
      const content = {
        title: 'Test Article',
        content: '<p>Test content</p>',
      };

      const html = renderReaderView(content);

      expect(html).toContain('<style>');
      expect(html).toContain('font-family:');
      expect(html).toContain('line-height:');
      expect(html).toContain('max-width:');
    });

    it('should handle empty content gracefully', () => {
      const content = {
        title: '',
        content: '',
      };

      const html = renderReaderView(content);

      expect(html).toContain('<h1></h1>');
      expect(html).toContain('<div></div>');
    });
  });
});
