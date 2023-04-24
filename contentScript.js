chrome.runtime.onMessage.addListener(async function (
    request,
    sender,
    sendResponse
) {
    if (request.action === 'sendSelectedTextToGoogleDocs') {
        const selectedText = request.selectedText;
        const pageUrl = request.pageUrl;
        await sendSelectedTextToGoogleDocs(selectedText, pageUrl);
    }
});

async function sendSelectedTextToGoogleDocs(selectedText, pageUrl) {
    // ここで getAccessToken, createGoogleDoc, appendSelectedText 関数を定義します。
}
