import ReactDOM from "react-dom/client";
import "./style.css";
import PopupMessage from "@/components/popupMsg";
import UI from "@/components/ui"; // createUiで使われているので残す
import { Readability } from "@mozilla/readability";
import type { ContentScriptContext } from "#imports"; // createUiで使われているので残す

const articleErrorMessage = "記事が見つかりませんでした。";

const READER_VIEW_ACTIVE_KEY = "readerViewActive";
const ORIGINAL_PAGE_HTML_KEY = "originalPageHTML";
const ORIGINAL_PAGE_TITLE_KEY = "originalPageTitle"; // タイトルも保存・復元

export default defineContentScript({
	registration: "runtime",
	matches: [],
	cssInjectionMode: "ui",

	async main(ctx) { // ctx は createUi で使うので引数として残す
		const isActive = sessionStorage.getItem(READER_VIEW_ACTIVE_KEY) === "true";

		if (isActive) {
			deactivateReaderView();
		} else {
			activateReaderViewAndStoreOriginal();
		}
		// const ui = await createUi(ctx); // 元のコードにあったが、今回のリクエストとは直接関係ない
		// ui.mount();

		return;
	},
});

// HTMLエスケープ用のヘルパー関数
function escapeHtml(unsafe: string): string {
    if (typeof unsafe !== 'string') {
        return '';
    }
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function activateReaderViewAndStoreOriginal() {
	const originalHTML = document.documentElement.innerHTML;
	const originalTitle = document.title;

	// Readabilityには現在のdocumentのクローンを渡す
	const documentClone = document.cloneNode(true) as Document;
	const article = new Readability(documentClone).parse();

	if (isVaildArticle(article)) {
		sessionStorage.setItem(ORIGINAL_PAGE_HTML_KEY, originalHTML);
		sessionStorage.setItem(ORIGINAL_PAGE_TITLE_KEY, originalTitle);

		// リーダー表示用の新しいHTMLコンテンツを作成
		const readerHTML = `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="UTF-8">
				<title>${escapeHtml(article.title)}</title>
				<style>
					body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif; line-height: 1.7; max-width: 70ch; margin: 2rem auto; padding: 2rem; background-color: #fff; color: #1a1a1a; }
					h1 { font-size: 2.2em; margin-bottom: 1em; color: #000; font-weight: 600;}
					p, li, blockquote { font-size: 1.1em; margin-bottom: 1em; }
					a { color: #007bff; }
					img, video, figure { max-width: 100%; height: auto; margin: 1.5em 0; }
					pre { background-color: #f0f0f0; padding: 1em; overflow-x: auto; border-radius: 4px; }
					code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace; }
				</style>
			</head>
			<body>
				<h1>${escapeHtml(article.title)}</h1>
				<div>${article.content}</div>
			</body>
			</html>
		`;
		
		document.documentElement.innerHTML = readerHTML;

		sessionStorage.setItem(READER_VIEW_ACTIVE_KEY, "true");
	} else {
		showPopupMessage(articleErrorMessage);
		// 失敗した場合は保存した可能性のある情報をクリア
		sessionStorage.removeItem(ORIGINAL_PAGE_HTML_KEY);
		sessionStorage.removeItem(ORIGINAL_PAGE_TITLE_KEY);
	}
}

function deactivateReaderView() {
	const originalHTML = sessionStorage.getItem(ORIGINAL_PAGE_HTML_KEY);
	
	if (originalHTML) {
		document.documentElement.innerHTML = originalHTML;
		// タイトルも復元
		const originalTitle = sessionStorage.getItem(ORIGINAL_PAGE_TITLE_KEY);
		if (originalTitle) {
			document.title = originalTitle;
		}

		sessionStorage.removeItem(READER_VIEW_ACTIVE_KEY);
		sessionStorage.removeItem(ORIGINAL_PAGE_HTML_KEY);
		sessionStorage.removeItem(ORIGINAL_PAGE_TITLE_KEY);
	} else {
		showPopupMessage("元のページ情報を復元できませんでした。ページをリロードしてください。");
		// 念のためクリア
		sessionStorage.removeItem(READER_VIEW_ACTIVE_KEY);
		sessionStorage.removeItem(ORIGINAL_PAGE_HTML_KEY);
		sessionStorage.removeItem(ORIGINAL_PAGE_TITLE_KEY);
	}
}

// removeAllStyleSheets は直接使われなくなるが、他の場所で使われている可能性を考慮して残す
function removeAllStyleSheets() {
	const styleSheets = document.styleSheets;
	for (let i = styleSheets.length - 1; i >= 0; i--) {
		const styleSheet = styleSheets[i];
		if (styleSheet.ownerNode && styleSheet.ownerNode.parentNode) {
			styleSheet.ownerNode.parentNode.removeChild(styleSheet.ownerNode);
		}
	}
}

function showPopupMessage(message: string) {
	const containerId = "reader-view-popup-container";
	let container = document.getElementById(containerId);
	if (!container) {
		container = document.createElement("div");
		container.id = containerId;
		// body が存在する場合のみ body に追加する
		if (document.body) {
		    document.body.appendChild(container);
		} else if (document.documentElement) {
            // body がまだ利用できない場合 (例: DOMContentLoaded 前)、documentElement に追加
            document.documentElement.appendChild(container);
        } else {
            // 通常ここには来ないはずだが、フォールバック
            console.error("Cannot show popup: no body or documentElement found to append the container.");
            return;
        }
	}
	const root = ReactDOM.createRoot(container);

	const handleClose = () => {
		root.unmount();
		if (container && container.parentNode) { // container が null でないことを確認
			container.parentNode.removeChild(container);
		}
	};

	root.render(<PopupMessage message={message} onClose={handleClose} />);
}

// Readability.prototype.parse の戻り値の型 (ParseResult)
type BaseArticle = typeof Readability.prototype.parse extends () => infer R
	? R
	: never;

// title と content が string であることを保証する Article 型
type Article = BaseArticle & {
	title: string;
	content: string;
};

// 型ガード関数: article が Article 型であるかをチェック
function isVaildArticle(article: BaseArticle | null): article is Article {
	if (article === null) {
		return false;
	}
	return (
		typeof article.title === "string" && typeof article.content === "string"
	);
}

function createUi(ctx: ContentScriptContext) {
	return createShadowRootUi(ctx, {
		name: "active-tab-ui",
		position: "inline",
		append: "before",
		onMount(container) {
			const wrapper = document.createElement("div");
			container.append(wrapper);

			const root = ReactDOM.createRoot(wrapper);
			root.render(<UI />);
		},
	});
}
