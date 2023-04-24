const API_KEY = "YOUR_API_KEY"; // Replace with your API Key
const DISCOVERY_DOCS = ["https://docs.googleapis.com/$discovery/rest?version=v1"];
const SCOPES = "https://www.googleapis.com/auth/documents";

function loadGoogleDocsApi() {
    return new Promise((resolve, reject) => {
        gapi.load("client", {
            callback: resolve,
            onerror: reject,
            timeout: 1000,
            ontimeout: reject,
        });
    });
}

async function initGoogleDocsApi() {
    try {
        await loadGoogleDocsApi();
        gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: DISCOVERY_DOCS,
            clientId: YOUR_CLIENT_ID, // Replace with your Client ID
            scope: SCOPES,
        });
    } catch (e) {
        console.error("Error initializing Google Docs API", e);
    }
}

initGoogleDocsApi();


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
