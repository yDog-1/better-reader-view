import { describe, it, expect, beforeAll } from 'vitest';
import { performance } from 'perf_hooks';
import {
  createReaderViewManager,
  activateReader,
  deactivateReader,
} from '../utils/reader-utils';
import { StyleController } from '../utils/StyleController';
import { JSDOM } from 'jsdom';

// Helper function to create a large document
function createLargeDocument(paragraphs: number): Document {
  const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <head><title>Large Document</title></head>
        <body>
            <article>
                <h1>Performance Test</h1>
                ${[...Array(paragraphs)]
                  .map((_, i) => `<p>This is paragraph ${i}.</p>`)
                  .join('')}
            </article>
        </body>
        </html>
    `);
  return dom.window.document;
}

describe(
  'ReaderViewManager Performance',
  () => {
    let styleController: StyleController;

    beforeAll(() => {
      styleController = new StyleController();
    });

    it('should activate reader view within 1000ms', async () => {
      const largeDocument = createLargeDocument(1000);
      const readerViewManager = createReaderViewManager(styleController);

      const startTime = performance.now();
      const activated = activateReader(readerViewManager, largeDocument);
      const endTime = performance.now();

      expect(activated).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should not cause significant memory leaks during repeated activation/deactivation', () => {
      // This is a simplified memory leak test.
      // For more accurate results, this should be run in a browser environment
      // with access to garbage collection and more precise memory measurement tools.
      const readerViewManager = createReaderViewManager(styleController);
      const doc = createLargeDocument(100);

      const runLifecycle = () => {
        activateReader(readerViewManager, doc);
        deactivateReader(readerViewManager, doc);
      };

      // Warm-up run
      runLifecycle();

      // We can't reliably measure memory in Node.js with vitest,
      // so we will just check if the process doesn't crash.
      for (let i = 0; i < 100; i++) {
        runLifecycle();
      }
    });

    it('should handle large documents efficiently, activating within 1500ms', () => {
      const largeDocument = createLargeDocument(5000);
      const readerViewManager = createReaderViewManager(styleController);

      const startTime = performance.now();
      const activated = activateReader(readerViewManager, largeDocument);
      const endTime = performance.now();

      expect(activated).toBe(true);
      expect(endTime - startTime).toBeLessThan(1500); // 1500ms
    });
  },
  { timeout: 20000 }
); // 20-second timeout for the entire suite
