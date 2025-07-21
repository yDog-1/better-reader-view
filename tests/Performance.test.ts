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
      const readerViewManager = createReaderViewManager(styleController);
      const doc = createLargeDocument(100);

      const runLifecycle = () => {
        activateReader(readerViewManager, doc);
        deactivateReader(readerViewManager, doc);
      };

      // Warm-up run to stabilize memory baseline
      runLifecycle();

      // Force garbage collection if available in Node.js environment
      if (global.gc) {
        global.gc();
      }

      const initialMemory = globalThis.process.memoryUsage();

      // Run multiple lifecycle iterations
      for (let i = 0; i < 100; i++) {
        runLifecycle();
      }

      // Force garbage collection again to clear temporary objects
      if (global.gc) {
        global.gc();
      }

      const finalMemory = globalThis.process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // Memory increase should be minimal (less than 200MB) after GC in test environment
      // This is a heuristic threshold for detecting potential memory leaks
      // Note: Test environments can have higher memory usage due to test framework overhead
      expect(memoryIncrease).toBeLessThan(200 * 1024 * 1024); // 200MB threshold for test environment
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
