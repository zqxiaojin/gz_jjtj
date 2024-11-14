
class Handler {

    getShortText(wfxwContent, sp) {
        let extractedContent;
        const commaIndex = wfxwContent.indexOf(sp);
        if (commaIndex !== -1) {
            // 提取逗号之前的部分
            extractedContent = wfxwContent.substring(0, commaIndex);
        } else {
            // 如果没有逗号，直接使用整个字符串
            extractedContent = wfxwContent;
        }
        return extractedContent;
    }


    processData() {

        const statisticsString = this.analyzeData(this.jjInfoList);
        console.log(statisticsString);

        console.log("结果写入到剪切板");
        chrome.runtime.sendMessage({
            action: 'requestCompleted',
            res: statisticsString
        });
    }

    analyzeData(dataArray) {


        let resultString = `总数举报数: ${dataArray.length}`;

        resultString += '\n\n通过率统计:\n';
        resultString += this.handle_default_stat(dataArray, 'result', false);

        resultString += '\n下面统计只包含审核通过';

        resultString += '\n\n提交举报最多的一天:\n';
        resultString += this.handle_upload_stat(dataArray);

        resultString += '\n\n遇到违反交规最多的一天:\n';
        resultString += this.handle_occur_stat(dataArray);

        resultString += '\n\n行为统计:\n';
        resultString += this.handle_default_stat(dataArray, 'wfxw', true);

        resultString += '\n\n地点统计:\n';
        resultString += this.handle_default_stat(dataArray, 'occuraddress', true);

        resultString += '\n\n月份统计:\n';
        resultString += this.handle_month_stat(dataArray);

        resultString += '\n\n车牌前缀统计:\n';
        resultString += this.handle_pre_id_stat(dataArray);

        resultString += '\n\n汽车类型统计:\n';
        resultString += this.handle_id_type_stat(dataArray);

        resultString += '\n\n车牌多次被举报统计:\n';
        resultString += this.handle_id_stat(dataArray);



        return resultString;

    }

    // 默认统计模板， key是 协议中的字段
    handle_default_stat(dataArray, key, only_success) {

        let counts = {}

        dataArray.forEach(item => {
            if (only_success) {
                if (item.result != '审核通过')
                    return;
            }
            let stat = item[key];
            counts[stat] = (counts[stat] || 0) + 1;
        });

        let resultString = this.createStatisticsStringOrderByCount(counts) // 排序
        return resultString
    }

    //月份统计
    handle_month_stat(dataArray) {

        let counts = {}

        dataArray.forEach(item => {
            if (item.result != '审核通过')
                return;

            let occurtime = item.occurtime;
            const stat = occurtime.substring(0, 7);

            counts[stat] = (counts[stat] || 0) + 1;
        });

        let resultString = this.createStatisticsStringOrderByKey(counts) // 排序
        return resultString
    }

    // 车牌前缀
    handle_pre_id_stat(dataArray) {

        let counts = {}

        dataArray.forEach(item => {

            if (item.result != '审核通过')
                return;

            let hphm = item.hphm;
            const stat = hphm.substring(0, 2);

            counts[stat] = (counts[stat] || 0) + 1;
        });

        let resultString = this.createStatisticsStringOrderByCount(counts) // 排序
        return resultString
    }

    getLastNotGenChar(hphm) {  
        // 获取最后一个字符  
        const lastChar = hphm.charAt(hphm.length - 1);  
        
        // 正则表达式判断最后一个字符是否为数字或英文字符  
        const isAlphanumeric = /^[a-zA-Z0-9]$/.test(lastChar);  
        
        // 如果不是数字或英文字符，返回最后一个字符  
        if (!isAlphanumeric) {  
            return lastChar;  
        }  
        
        // 如果是数字或英文字符，返回 null 或其他处理  
        return null; // 或者返回提示信息  
    } 

    // 汽车类型
    handle_id_type_stat(dataArray) {

        let counts = {}

        dataArray.forEach(item => {

            if (item.result != '审核通过')
                return;


            let hphm = item.hphm;
            let stat = (hphm.length == '8') ? '绿牌' : '蓝牌';
            //如果是港字结尾，那么是港牌车
            let lastChar = this.getLastNotGenChar(hphm)
            if (lastChar != null) {
                stat = lastChar + '牌'
            }

            counts[stat] = (counts[stat] || 0) + 1;
        });

        let resultString = this.createStatisticsStringOrderByCount(counts) // 排序
        return resultString
    }

       // 举报最多的一天
    handle_upload_stat(dataArray) {

        let counts = {}

        dataArray.forEach(item => {
            if (item.result != '审核通过')
                return;

            let upload_time = item.upload_time;
            const stat = upload_time.substring(0, 10);

            counts[stat] = (counts[stat] || 0) + 1;
        });

        let resultString = this.createStatisticsStringOrderByKey(counts) // 排序
        //只获取第一行
        return resultString.split('\n')[0]
    }

    // 违法最多的一天
    handle_occur_stat(dataArray) {

        let counts = {}

        dataArray.forEach(item => {
            if (item.result != '审核通过')
                return;

            let occurtime = item.occurtime;
            const stat = occurtime.substring(0, 10);

            counts[stat] = (counts[stat] || 0) + 1;
        });

        let resultString = this.createStatisticsStringOrderByKey(counts) // 排序
        //只获取第一行
        return resultString.split('\n')[0]
    }



    // 车牌
    handle_id_stat(dataArray) {

        let counts = {}

        dataArray.forEach(item => {
            if (item.result != '审核通过')
                return;

            const stat = item.hphm;
            counts[stat] = (counts[stat] || 0) + 1;
        });

        let lt2_counts = {}


        // 遍历字典的每个键值对  
        Object.entries(counts).forEach(([key, value]) => {
            // 判断值的数量是否大于等于 2  
            if (value >= 2) {
                // 如果大于等于 2，将其添加到过滤后的对象中  
                lt2_counts[key] = value;
            }
        });

        let resultString = this.createStatisticsStringOrderByCount(lt2_counts) // 排序
        if (resultString.length == 0) {
            resultString = "没有多次被举报的车"
        }
        return resultString
    }


    createStatisticsStringOrderByCount(counts) {   // 排序数量并输出
        const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
        let arr = Object.entries(counts).map(([key, count]) => ({
            key,
            count,
            percentage: (count / total) * 100
        })).sort((a, b) => b.count - a.count); // 按数量降序排序  

        let resultString = ''
        for (const entry of arr) {
            resultString += `${entry.key}: ${entry.count} (${entry.percentage.toFixed(2)}%)\n`;
        }
        return resultString;
    }

    createStatisticsStringOrderByKey(counts) {   // 排序key并输出
        const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
        let arr = Object.entries(counts).map(([key, count]) => ({
            key,
            count,
            percentage: (count / total) * 100
        })).sort((a, b) => b.key > a.key); // 按数量降序排序  

        let resultString = ''
        for (const entry of arr) {
            resultString += `${entry.key}: ${entry.count} (${entry.percentage.toFixed(2)}%)\n`;
        }
        return resultString;
    }


    mainThreadSetText(text) {
        // 假设这是更新 UI 的方法
        // console.log(text);

        chrome.runtime.sendMessage({
            action: 'sendingRequest',
            text: text
        });
    }
}

// 假设 JJInfo 是另一个类
class JJInfo {
    constructor(data) {
        this.caseno = data.caseno || "";
        this.hphm = data.hphm || "";
        this.occuraddress = data.occuraddress.replace(/,/g, "，") || "";
        this.occurtime = data.occurtime || "";
        this.upload_time = data.uptime || "";
        this.status = data.status || "";
        this.result = this.getResult(this.status);
        this.uptime = data.uptime || "";
        this.tbyy = data.tbyy || "";
        this.wfxw = data.wfxw.replace(/,/g, "，") || "";
    }

    // 根据 status 返回对应的 result  
    getResult(status) {
        switch (status) {
            case "0":
                return "退办";
            case "1":
                return "待审核";
            case "2":
                return "审核通过";
            case "3":
                return "待审核";
            default:
                console.error("数据异常");
                return "";
        }
    }

    // 转换为字典形式  
    toDictionary() {
        return {
            // "编号": this.caseno || "",  
            "车牌": this.hphm,
            "地点": this.occuraddress,
            "时间": this.occurtime,
            "审核结果": this.result,
            "提交时间": this.uptime,
            // "上报时间": this.uptime || "",  
            "结果": this.tbyy,
            "行为": this.wfxw
        };
    }
}

// 假设这里是你的数据列表
Handler.prototype.jjInfoList = [];

// 使用示例
const handlerInstance = new Handler();