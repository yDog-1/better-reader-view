export default defineBackground(() => {
	(browser.action ?? browser.browserAction).onClicked.addListener(() => {
		console.log("Action button clicked");
	});
});
