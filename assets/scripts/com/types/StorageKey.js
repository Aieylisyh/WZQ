let StorageKey = {
    Username: "Username",

    Token: "Token",

    CardCodeList: "CardCodeList",

    ShareGroupInfoList: "ShareGroupInfoList",

    TipAddMiniProgTimeStamp: "TipAddMiniProgTimeStamp",

    DeviceCompability: "DeviceCompability",

    LastEnterGameInfo: "LastEnterGameInfo",

    FirstEnterGameInfo: "FirstEnterGameInfo",

    ReleaseNotice: "ReleaseNotice", // 公告：存储格式{content: "公告1", timestamp: 15356454}

    UserInfo: "UserInfo",

    GameInfo: "GameInfo",

    uxData: "uxData",

    WxShareCardEntryInfo: "WxShareCardEntryInfo",

    hasEnterFromMiniProg: "hasEnterFromMiniProg",


    ///本地存储通过游戏名-用户名-数据id读取
    ///例如zqt-default-gameinfo
    uniqueKey:{},
    
    GameId: "WZQ",

    UserKey: "User",

    UserId: "default1",//需要在初始化之后赋值一个唯一id 

    GetUniqueKey(key) {
        return this.GameId + "_" + this.UserId + "_" + key;
    },

    SetUserId(s) {
        if (s && s != "") {
            this.UserId = s;
        }

        this.uniqueKey = {};
        for (let i in this) {
            if (i && typeof i == "string" && (i != this.GameId && i != this.UserKey && i != this.UserId)) {
                this.uniqueKey[i] = this.GetUniqueKey(this[i]);
            }
        }
    },
}

module.exports = StorageKey;