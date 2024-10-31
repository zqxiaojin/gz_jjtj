const urlParams = new URLSearchParams(window.location.search);
const openid = urlParams.get('openid');

if (openid) {
    chrome.runtime.sendMessage(
        { action: "getOpenidSuccess", openid: openid }
    );
} else {
    chrome.runtime.sendMessage(
        { action: "getOpenidFail" }
    );
}  