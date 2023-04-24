chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: 'sendToGoogleDocs',
        title: 'Send to Google Docs',
        contexts: ['selection'],
    });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === 'sendToGoogleDocs') {
        const selectedText = info.selectionText;
        const pageUrl = info.pageUrl;
        chrome.tabs.sendMessage(tab.id, {
            action: 'sendSelectedTextToGoogleDocs',
            selectedText: selectedText,
            pageUrl: pageUrl,
        });
    }
});
