document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('signInButton').addEventListener('click', function () {
        chrome.identity.getAuthToken({ interactive: true }, function (token) {
            if (chrome.runtime.lastError) {
                alert('An error occurred: ' + chrome.runtime.lastError.message);
            } else {
                alert('Logged in successfully.');
            }
        });
    });
});
