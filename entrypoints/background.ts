export default defineBackground(() => {
	(browser.action ?? browser.browserAction).onClicked.addListener(
		async (tab) => {
			if (tab.id && tab.url) {
				await browser.scripting.executeScript({
					target: { tabId: tab.id },
					files: ["/content-scripts/content.js"],
				});
			}
		},
	);
});
