document.getElementById('authorize_button').onclick = function () {
    chrome.runtime.sendMessage({ action: 'authorize' });
};

document.getElementById('signout_button').onclick = function () {
    chrome.runtime.sendMessage({ action: 'signout' });
};

chrome.runtime.sendMessage({ action: 'checkAuth' }, (response) => {
    if (response.isAuthorized) {
        document.getElementById('signout_button').style.display = 'block';
    } else {
        document.getElementById('authorize_button').style.display = 'block';
    }
});
