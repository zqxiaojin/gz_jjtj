

flatpickr.localize({
    zh: {
        rangeSeparator: " 至 ", // 修改范围分隔符  
    },
});

// 初始化 Flatpickr  
const picker = flatpickr("#dateRangePicker", {
    mode: "range", // 启用范围选择模式  
    dateFormat: "Y年m月d日", // 日期格式
    allowInput: true, // 允许手动输入  
    mobile: {

    },
    locale: {
        rangeSeparator: ' 至 '
    },
    onChange: function (selectedDates, dateStr, instance) {
        // selectedDates 是用户选择的日期数组  
        console.log("选择的日期范围：", selectedDates);
        console.log("格式化后的日期范围：", dateStr);
    },
});

// 获取当前日期  
const currentDate = new Date();
const currentYear = currentDate.getFullYear();




// 计算上一年的年份  
const lastYear = currentYear - 1;
document.getElementById("lastYearBtn").textContent = "选择" + lastYear + "年"

// 选择上一年的范围（1月1日至12月31日）  
document.getElementById("lastYearBtn").addEventListener("click", function () {
    const lastYearStart = new Date(currentYear - 1, 0, 1); // 上一年的1月1日  
    const lastYearEnd = new Date(currentYear - 1, 11, 31); // 上一年的12月31日  
    picker.setDate([lastYearStart, lastYearEnd]); // 设置日期范围  
});

// 选择最近365天的范围  
document.getElementById("last365DaysBtn").addEventListener("click", function () {
    const last365DaysStart = new Date(currentDate);
    last365DaysStart.setDate(currentDate.getDate() - 365); // 365天前的日期  
    picker.setDate([last365DaysStart, currentDate]); // 设置日期范围  
});

document.getElementById('dateRangeBtn').addEventListener('click', () => {
    console.log("点击了统计按钮")
    var param = { action: 'startStatAction' };

    console.log("选择的日期范围：", picker.selectedDates);  

    if (picker.selectedDates.length > 0) {
        param.startDateStr = picker.selectedDates[0]
        param.endDateStr = picker.selectedDates[1]
    }

    // 发送消息给背景脚本以获取当前选项卡的 OpenID  
    chrome.runtime.sendMessage(param);
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

