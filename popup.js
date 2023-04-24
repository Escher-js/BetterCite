const port = chrome.runtime.connect({ name: "popup" });

document.getElementById("login").addEventListener("click", () => {
    port.postMessage({ action: "login" });
});

document.getElementById("logout").addEventListener("click", () => {
    port.postMessage({ action: "logout" });
});

port.onMessage.addListener((response) => {
    if (response.loggedIn) {
        showLoggedInState();
    } else {
        showLoggedOutState();
    }
});

function showLoggedInState() {
    document.getElementById("login").hidden = true;
    document.getElementById("logout").hidden = false;
}

function showLoggedOutState() {
    document.getElementById("login").hidden = false;
    document.getElementById("logout").hidden = true;
}


port.postMessage({ action: "checkLoginStatus" });
