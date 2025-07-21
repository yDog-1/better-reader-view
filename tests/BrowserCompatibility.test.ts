import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createReaderViewManager, activateReader } from '../utils/reader-utils';
import { StyleController } from '../utils/StyleController';
import { JSDOM } from 'jsdom';

// Mock browser environment
const mockBrowserEnvironment = (browser: 'chrome' | 'firefox') => {
  const userAgent =
    browser === 'chrome'
      ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0';

  vi.stubGlobal('navigator', {
    userAgent,
  });
};

// Mock CSP restrictions
const mockCSPRestrictions = () => {
  // This is a simplified mock. In a real scenario, you would need a more comprehensive
  // setup to simulate CSP, possibly by using a server with CSP headers.
  // For now, we'll just check if the code runs without errors.
};

describe('Browser Compatibility', () => {
  let styleController: StyleController;
  let doc: Document;

  beforeEach(() => {
    styleController = new StyleController();
    const dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Page</title>
        </head>
        <body>
          <article>
            <h1>Test Article</h1>
            <p>This is some test content.</p>
            <p>This is another paragraph.</p>
          </article>
        </body>
      </html>
    `);
    doc = dom.window.document;
  });

  it('should work in Chrome environment', () => {
    mockBrowserEnvironment('chrome');
    const readerViewManager = createReaderViewManager(styleController);
    const result = activateReader(readerViewManager, doc);
    expect(result).toBe(true);
  });

  it('should work in Firefox environment', () => {
    mockBrowserEnvironment('firefox');
    const readerViewManager = createReaderViewManager(styleController);
    const result = activateReader(readerViewManager, doc);
    expect(result).toBe(true);
  });

  it('should handle CSP restrictions gracefully', () => {
    mockCSPRestrictions();
    const readerViewManager = createReaderViewManager(styleController);
    const result = activateReader(readerViewManager, doc);
    // In this simplified test, we just expect it to not throw an error and activate.
    // A more advanced test would check for specific fallback behaviors.
    expect(result).toBe(true);
  });
});
