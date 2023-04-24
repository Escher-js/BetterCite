chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: "sendToGoogleDoc",
        title: "Send to Google Doc",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "sendToGoogleDoc") {
        console.log("Sending selected text to Google Doc");

        // Request the selected text from the content script
        chrome.tabs.sendMessage(tab.id, { action: "getSelectedText" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
            } else {
                // Display the selected text in an alert dialog
                alert("Selected text: " + response.text);
            }
        });
    }
});

let loggedIn = false;

chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((request) => {
        if (request.action === "login") {
            chrome.identity.getAuthToken({ interactive: true }, (token) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                } else {
                    loggedIn = true;
                    port.postMessage({ loggedIn: true });
                }
            });
        } else if (request.action === "logout") {
            chrome.identity.getAuthToken({ interactive: false }, (token) => {
                if (token) {
                    chrome.identity.removeCachedAuthToken({ token: token });
                }
            });
            loggedIn = false;
            port.postMessage({ loggedIn: false });
        } else if (request.action === "checkLoginStatus") {
            port.postMessage({ loggedIn: loggedIn });
        }
    });
});
