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
                // Get the access token and insert the text into the Google Doc
                chrome.identity.getAuthToken({ interactive: false }, (token) => {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError);
                    } else {
                        const textToInsert = response.text + "\n\nURL: " + info.pageUrl + "\n\n";
                        createGoogleDoc(token, (docResponse) => {
                            const documentId = docResponse.documentId;
                            insertTextToGoogleDoc(token, documentId, textToInsert, (insertResponse) => {
                                console.log("Text inserted successfully");
                            });
                        });
                    }
                });
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
        } else if (request.action === "createDoc") {
            chrome.identity.getAuthToken({ interactive: false }, (token) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                } else {
                    createGoogleDoc(token, (response) => {
                        console.log(response);
                    });
                }
            });
        }

    });
});

function createGoogleDoc(token, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://docs.googleapis.com/v1/documents");
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                callback(JSON.parse(xhr.responseText));
            } else {
                console.error(`Error: ${xhr.status}\n${xhr.responseText}`);
            }
        }
    };
    xhr.send(JSON.stringify({ title: "New Document from Extension" }));
}

function insertTextToGoogleDoc(token, documentId, text, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open(
        "POST",
        `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`
    );
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                callback(JSON.parse(xhr.responseText));
            } else {
                console.error(`Error: ${xhr.status}\n${xhr.responseText}`);
            }
        }
    };
    xhr.send(
        JSON.stringify({
            requests: [
                {
                    insertText: {
                        location: {
                            index: 1,
                        },
                        text: text,
                    },
                },
            ],
        })
    );
}

