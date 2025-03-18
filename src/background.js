chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension Installed");
});

var g_openid = undefined;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getOpenidSuccess') {
        g_openid = request.openid;
        console.log('当前页面的 URL:', request.openid);
        // 处理 URL，例如发送请求或其他操作  
    } else if (request.action === 'getOpenidFail') {
        g_openid = undefined;
        console.log('当前页面的 URL:', request.openid);
        // 处理 URL，例如发送请求或其他操作  
    }
});

importScripts('handler.js');


function startRequestWithOpenId(openId, pageNo, startDate, endDate) {
    if (pageNo == 1) {
        // reset一下数据
        Handler.prototype.jjInfoList = [];
    }
    // 1. 创建 URL
    const url = "https://cgsqy.gzjd.gov.cn/WechatAPIServer/Wfjb/gethistorylist";

    // 2. 创建请求
    const request = new Request(url, {
        method: 'POST',
        body: `userid=&openid=${openId}&pageNo=${pageNo}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    handlerInstance.mainThreadSetText(`请求页数：${pageNo}`);

    // 3. 发送请求
    fetch(request).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }
    ).then(data => {
        // 4. 判断数据长度
        if (JSON.stringify(data).length > 0) {
            const dataArray = data.data;

            if (dataArray.length === 0) {
                console.log("请求完成");
                //完成的时候需要告知时间范围
                handlerInstance.processData(startDate, endDate);
                return;
            }

            for (const item of dataArray) {
                const j = new JJInfo(item);

                //过滤时间范围
                if (startDate != undefined && endDate != undefined) {
                    const upDate = new Date(j.upload_time)
                    const nextDay = new Date(endDate);  //magic: 需要加一天，确保时间范围正确
                    nextDay.setDate(endDate.getDate() + 1);
                    if (upDate < startDate || upDate > nextDay) {
                        if (upDate < startDate) {//更旧的数据就不查了，浪费时间
                            console.log("请求完成");
                            //完成的时候需要告知时间范围
                            handlerInstance.processData(startDate, endDate);
                            return;
                        } else {
                            //过滤掉不符合时间范围的
                            console.log("过滤掉" + j.upload_time)
                            continue
                        }
                    }
                }

                handlerInstance.jjInfoList.push(j);
            }

            // 继续发请求，pageNo +1
            startRequestWithOpenId(openId, pageNo + 1, startDate, endDate);
        } else {
            console.log("Response body is smaller than or equal to 20 characters. Stopping requests.");
        }
    }
    ).catch(error => {
        console.error("Error:", error.message);
    }
    );
}




chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startStatAction') {

        if (g_openid == undefined) {
            handlerInstance.mainThreadSetText(`获取id异常，请刷新页面`);

            return true;
        }


        var startDate = undefined;
        if (request.startDateStr) {
            startDate = new Date(request.startDateStr);
        }
        var endDate = undefined;
        if (request.startDateStr) {
            endDate = new Date(request.endDateStr);
        }

        startRequestWithOpenId(g_openid, 1, startDate, endDate);


        chrome.runtime.sendMessage({
            action: 'sendingRequest'
            , text: '开始'
        });



        // 发送 POST 请求  
        return true; // Will respond asynchronously  
    }
}); 