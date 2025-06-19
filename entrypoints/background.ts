export default defineBackground(() => {
  browser.action.onClicked.addListener(async (tab) => {
    console.log("Better Reader View extension clicked");
    if (tab.id && tab.url) {
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["/content-scripts/content.js"],
      });
    }
  });
});
