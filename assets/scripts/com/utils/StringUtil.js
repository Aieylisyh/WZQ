let StringUtil = {
    areEqual: function (a, b) {
        if (a == null || b == null) {
            return false;
        }
        return a === b;
    },

    isNotEmpty: function (s) {
        return !this.isEmpty(s);
    },

    isEmpty: function (s) {
        return (typeof s !== "string" || s == null || s === "");
    },

    isMeaningfulString: function (s) {
        return (this.isNotEmpty(s) && s !== "undefined" && s !== "null");
    },

    removeText: function (s, toRemove) {
        if (this.isEmpty(s)) {
            return;
        }

        s = s.replace(toRemove, "");
        return s;
    },

    getLocationLabel: function () {
        var location = null;

        if (WechatAPI.loginInfo && WechatAPI.loginInfo.userInfo) {
            var city = WechatAPI.loginInfo.userInfo.city;
            if (StringUtil.isNotEmpty(city)) {
                location = StringUtil.getLocationByCity(city);
            }

            if (StringUtil.isEmpty(location)) {
                var province = WechatAPI.loginInfo.userInfo.province;
                if (StringUtil.isNotEmpty(province)) {
                    location = StringUtil.getRandomLocationByProvince(province);
                }
            }

        }

        location = location || StringUtil.getRandomLocationByProvince(StringUtil.getRandomProvince());

        return location;
    },

    getRandomProvince: function () {
        let rnd = Math.random();
        if (rnd < 0.3) {
            return "Anhui";
        }

        if (rnd < 0.5) {
            return "Shanghai";
        }

        return "Jiangsu";
    },

    getRandomLocationByProvince: function (province) {
        let rnd = Math.random();
        switch (province) {
            case "Anhui":
                if (rnd < 0.8) {
                    return "安徽";
                } else if (rnd < 0.95) {
                    return "合肥";
                } else {
                    return "马鞍山";
                }

            case "Jiangsu":
                if (rnd < 0.2) {
                    return "江苏";
                } else if (rnd < 0.35) {
                    return "苏南";
                } else if (rnd < 0.5) {
                    return "苏北";
                } else if (rnd < 0.7) {
                    return "南京";
                } else if (rnd < 0.77) {
                    return "徐州";
                } else if (rnd < 0.85) {
                    return "宿迁";
                } else if (rnd < 0.93) {
                    return "苏州";
                } else {
                    return "淮安";
                }

            case "Shanghai":
                if (rnd < 0.6) {
                    return "上海";
                } else if (rnd < 0.8) {
                    return "浦西";
                } else {
                    return "浦东";
                }

            case "Zhejiang":
                if (rnd < 0.7) {
                    return "浙江";
                } else {
                    return "杭州";
                }

            case "Guangdong":
                return "广东";

            case "Beijing":
                return "北京";

            case "Shandong":
                return "山东";

            case "Sichuan":
                return "四川";
        }

        return "本市";
    },

    getLocationByCity: function (city) {
        switch (city) {
            case "Nanjing":
                return "南京";

            case "Suzhou":
                return "苏州";

            case "Xuzhou":
                return "徐州";

            case "Hefei":
                return "合肥";

            case "Suqian":
                return "宿迁";

            case "Huaian":
                return "淮安";

            case "Nantong":
                return "南通";

            case "Yancheng":
                return "盐城";

            case "Yangzhou":
                return "扬州";

            case "Lianyungang":
                return "连云港";

            case "Shanghai":
                return "上海";

            case "Guangzhou":
                return "广州";

            case "Beijing":
                return "北京";

            case "Chengdu":
                return "成都";
        }

        return;
    },

    //去掉开头的空位
    trimStartingSpace: function (string) {
        if (this.isEmpty(string)) {
            return string;
        }

        let len = string.length;
        let lenToSubstr = 0;
        for (let i = 0; i <= len - 1; i++) {
            if (string[i] === " ") {
                lenToSubstr++;
            } else {
                string = string.substr(lenToSubstr, len);
                break;
            }
        }

        return string;
    },

    //去掉结尾的空位
    trimEndingSpace: function (string) {
        if (this.isEmpty(string)) {
            return string;
        }

        let len = string.length;
        let lenToSubstr = 0;
        for (let i = 1; i <= len; i++) {
            if (string[len - i] === " ") {
                lenToSubstr++;
            } else {
                string = string.substr(0, len - lenToSubstr);
                break;
            }
        }

        return string;
    },

    //截断过长的文字，用...代替过长的部分，注意这里判断是基于文字的渲染长度
    trimString: function (string, renderLengthMax, trimSpace = true) {
        if (trimSpace) {
            string = this.trimEndingSpace(string);
            string = this.trimStartingSpace(string);
        }

        let len = string.length;
        let renderLen = this.renderLengthOf(string);
        let currentRenderLen = 0;

        if (renderLen > renderLengthMax) {
            let lenToSubstr = 0;
            for (let i = 0; i < len; i++) {
                if (this.isChinese(string[i])) {
                    currentRenderLen += 2;
                } else {
                    currentRenderLen += 1;
                }
                lenToSubstr++;

                if (currentRenderLen >= renderLengthMax) {
                    string = string.substr(0, lenToSubstr);
                    string = string + "...";
                    break;
                }
            }
        }

        return string;
    },

    fullfillString: function (string, renderLengthMin) {
        let len = string.length;
        let renderLen = this.renderLengthOf(string);

        if (renderLen < renderLengthMin) {
            for (let i = renderLen; i < renderLengthMin; i++) {
                string = string + " ";
            }
        }

        return string;
    },

    isChinese: function (char) {  //判断是不是中文  
        let reCh = /[u00-uff]/;
        return !reCh.test(char);
    },

    //文字的渲染长度，中文是英文的2倍
    renderLengthOf: function (str) {
        let len = 0; //初始定义长度为0  
        for (let i = 0; i < str.length; i++) {
            if (this.isChinese(str.charAt(i))) {
                len += 2;//中文为2个字符  
            } else {
                len += 1;//英文一个字符  
            }
        }

        return len;
    },

    getRichTextImgAtlas: function (s) {
        return "<img src='" + s + "'/>";
    }
}

String.prototype.splice = function (start, newStr) {
    return this.slice(0, start) + newStr + this.slice(start);
};

module.exports = StringUtil; 