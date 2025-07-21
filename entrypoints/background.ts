import { ShadowDOMError, withAsyncErrorHandling } from '@/utils/errors';
import { BrowserAPIManager } from '@/utils/BrowserAPIManager';

export default defineBackground(() => {
  // Feature Detection を使ってブラウザアクションAPIを安全に取得
  const actionAPI = BrowserAPIManager.safeAPICall(
    () => browser.action ?? browser.browserAction,
    null,
    'action'
  );

  if (!actionAPI) {
    console.error(
      '[Background] ブラウザアクション API がサポートされていません'
    );
    return;
  }

  actionAPI.onClicked.addListener(async (tab) => {
    await withAsyncErrorHandling(
      async () => {
        if (tab.id && tab.url && BrowserAPIManager.isScriptingSupported()) {
          await BrowserAPIManager.safeAsyncAPICall(
            () =>
              browser.scripting.executeScript({
                target: { tabId: tab.id! }, // Non-null assertion after null check
                files: ['/content-scripts/content.js'],
              }),
            undefined,
            'scripting.executeScript'
          );
        } else if (!BrowserAPIManager.isScriptingSupported()) {
          throw new Error('スクリプト注入API がサポートされていません');
        }
        return true;
      },
      (cause) => new ShadowDOMError('コンテンツスクリプトの注入', cause)
    );
  });
});
