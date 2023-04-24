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

const clientId = '1859181707-cmecvlvr1rnlmt4a8i1tk0eda5nsvi8n.apps.googleusercontent.com';
const apiKey = 'not-an-api-key';
const scopes = 'https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file';

function authenticate() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, function (token) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(token);
            }
        });
    });
}

function loadClient() {
    return new Promise((resolve, reject) => {
        gapi.client.setApiKey(apiKey);
        gapi.client.load('https://content.googleapis.com/discovery/v1/apis/docs/v1/rest')
            .then(() => {
                console.log('GAPI client loaded for API');
                resolve();
            }, (error) => {
                reject(error);
            });
    });
}

function authorizeAndLoadClient() {
    authenticate().then(loadClient);
}

function signout() {
    return new Promise((resolve, reject) => {
        chrome.identity.removeCachedAuthToken({ token: access_token }, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                console.log('Logged out');
                resolve();
            }
        });
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'authorize') {
        authorizeAndLoadClient();
    } else if (request.action === 'signout') {
        signout();
    } else if (request.action === 'checkAuth') {
        chrome.identity.getAuthToken({ interactive: false }, function (token) {
            sendResponse({ isAuthorized: !!token });
        });
        return true;
    }
});

function checkAuth() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: false }, function (token) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(!!token);
            }
        });
    });
}

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
    if (info.menuItemId === "sendToGoogleDoc") {
        console.log("Sending selected text to Google Doc");

        const isAuthorized = await checkAuth();
        if (!isAuthorized) {
            chrome.browserAction.openPopup();
        } else {
            authorizeAndLoadClient().then(() => {
                createDocWithDummyData()
                    .then(() => {
                        console.log('Dummy data sent to Google Doc');
                    })
                    .catch((error) => {
                        console.error('Error sending dummy data to Google Doc:', error);
                    });
            });
        }
    }
});

function createDocWithDummyData() {
    return gapi.client.docs.documents.create({
        resource: {
            title: 'My Dummy Document'
        }
    }).then(function (response) {
        const documentId = response.result.documentId;
        const requests = [
            {
                insertText: {
                    location: {
                        index: 1
                    },
                    text: 'This is a dummy text.\n'
                }
            }
        ];
        return gapi.client.docs.documents.batchUpdate({
            documentId: documentId,
            requests: requests
        });
    });
}
