import { ShadowDOMError, withAsyncErrorHandling } from '@/utils/errors';

export default defineBackground(() => {
  (browser.action ?? browser.browserAction).onClicked.addListener(
    async (tab) => {
      await withAsyncErrorHandling(
        async () => {
          if (tab.id && tab.url) {
            await browser.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['/content-scripts/content.js'],
            });
          }
          return true;
        },
        (cause) => new ShadowDOMError('コンテンツスクリプトの注入', cause)
      );
    }
  );
});
