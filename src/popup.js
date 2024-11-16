document.getElementById('copyButton').addEventListener('click', () => {
    console.log("点击了统计按钮")
    // 发送消息给背景脚本以获取当前选项卡的 OpenID  
    chrome.runtime.sendMessage({ action: 'sendPostRequest' });
});

function setStatusText(text) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = text;
    statusDiv.style.display = 'block';
}

function setResultText(text) {
    const statusDiv = document.getElementById('result');
    statusDiv.textContent = text;
    statusDiv.style.display = 'block';
}

// 处理从背景脚本返回的状态  
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'requestCompleted') {
        navigator.clipboard.writeText(request.res);
        setStatusText('已完成，已把统计内容复制到剪切板，内容如下：');
        setResultText(request.res)
    } else if (request.action === 'requestFailed') {
        setStatusText('请求失败');
    } else if (request.action === 'sendingRequest') {
        setStatusText(request.text);
    } else if (request.action === 'getOpenidSuccess') {
        setStatusText('获取OpenID成功');
    } else if (request.action === 'getOpenidFail') {
        setStatusText('获取OpenID失败，请打开列表页');
    }
});

