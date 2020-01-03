let StorageKey = require("StorageKey");
let VitaSystem = require("VitaSystem");
let Item = require("Item");
let DialogTypes = require('DialogTypes');

let shareVitaCountPerDay = 3;

//has 3 all storage files
cc.Class({
    properties: {
        _data: null, //数据

        playedDays: {
            get: function () {
                if (this._data && this._data.timeSinceFirst) {
                    return this._data.timeSinceFirst / 86400000;
                }
                return 0;
            },
        },

        playedHours: {
            get: function () {
                if (this._data && this._data.timeSinceFirst) {
                    return this._data.timeSinceFirst / 3600000;
                }
                return 0;
            },
        },

        playedTimes: {
            get: function () {
                if (this.uxData && this.uxData.counts) {
                    return this.uxData.counts;
                }

                return 1;
            },
        },

        AFKHours: {
            get: function () {
                if (this._data && this._data.timeSinceLast) {
                    return this._data.timeSinceLast / 3600000;
                }

                return 0;
            },
        },

        isFirst: {
            get: function () {
                if (this.uxData && this.uxData.counts) {
                    return this.uxData.counts <= 1;
                }

                return false;
            },
        },

        isFirstGame: {
            get: function () {
                if (this.uxData != null) {
                    return (this.getEndGameCounts() < 1);
                }

                return false;
            },
        },

        playerData: {
            get: function () {
                return this.getPlayerData();
            },
        },
    },

    ctor: function () {
        this.cache = {};
    },

    onUpdate(dt) {
        if (this.toSaveGameInfo) {
            this.toSaveGameInfo = false;
            this.gameInfo.vitaSystem = this.vitaSystem.getSaveData();
            WechatAPI.setStorageSync(StorageKey.GameInfo, JSON.stringify(this.gameInfo));

            appContext.getDialogManager().updateDataBasedDialogs();
        }

        if (this.toSaveUxData) {
            this.toSaveUxData = false;
            WechatAPI.setStorageSync(StorageKey.uxData, JSON.stringify(this.uxData));
        }
    },

    init: function () {
        this.cache = this.cache || {};
        //this.saveByMinorChangeCounter = this.saveByMinorChangeCount;
        debug.log("UserExperienceManager 进入游戏");
        this.uxData = WechatAPI.getStorageSync(StorageKey.uxData, true);

        if (this.uxData == null || typeof this.uxData !== "object" ||
            typeof this.uxData.firstDate !== "number" || typeof this.uxData.lastestDate !== "number" ||
            typeof this.uxData.counts !== "number") {
            debug.log("首次进入游戏");
            this.uxData = {};
            this.uxData.firstDate = Date.now();
            this.uxData.counts = 1;
            this.uxData.lastestDate = Date.now();
            this.uxData.gameCounts = 0;
            this.uxData.endGameCounts = 0;
            this.uxData.usedGiftCode = [];

            if (WechatAPI.isWx) {
                this.uxData.safeEntry = this.matchWLHigh();
                console.log("首 whlist " + this.uxData.safeEntry);
            }

        } else {
            this.uxData.counts += 1;
            debug.log(this.uxData.counts + "次");
            if (WechatAPI.isWx) {
                if (this.uxData.safeEntry) {
                    this.uxData.safeEntry = this.matchWLHigh() || this.matchWLLow();
                }
                console.log("whlist " + this.uxData.safeEntry);
            }
        }

        this.setDayInfo();
        this._data = {};
        this._data.timeSinceFirst = Date.now() - this.uxData.firstDate;
        this._data.timeSinceLast = Date.now() - this.uxData.lastestDate;
        this.uxData.lastestDate = Date.now();

        this.toSaveUxData = true;
    },

    setDayInfo: function () {
        let day = Math.floor((Date.now() + 3600000 * 8) / 86400000);
        if (this.uxData.dayInfo == null || this.uxData.dayInfo.day == null || this.uxData.dayInfo.day != day) {
            this.uxData.dayInfo = {};
            this.uxData.dayInfo.day = day;
            this.uxData.dayInfo.combatCount = 0;
            this.uxData.dayInfo.enterCount = 0;
        } else {
            this.uxData.dayInfo.enterCount++;
        }
        debug.log("当天信息");
        debug.log(this.uxData.dayInfo);
    },

    recordEndGame: function () {
        if (!this.uxData.endGameCounts) {
            this.uxData.endGameCounts = 0;
        }
        this.uxData.endGameCounts += 1;
        this.uxData.dayInfo.combatCount++;
        this.toSaveUxData = true;
    },

    getEndGameCounts: function () {
        if (!this.uxData.endGameCounts) {
            this.uxData.endGameCounts = 0;
        }

        return this.uxData.endGameCounts;
    },

    recordGiftCode: function (code) {
        if (!this.uxData.usedGiftCode) {
            this.uxData.usedGiftCode = [];
        }
        this.uxData.usedGiftCode.push(code);
        this.toSaveUxData = true;
    },

    recordCardCode: function (code) {
        debug.log("recordCardCode " + code);
        if (code == null || code === "") {
            return;
        }

        let codeList = WechatAPI.getStorageSync(StorageKey.WxShareCardEntryInfo, true);

        if (codeList == null || typeof codeList !== "object") {
            codeList = [];
        }

        codeList.push(code);
        WechatAPI.setStorage(StorageKey.WxShareCardEntryInfo, codeList);
    },

    isGiftCodeUsed: function (code) {
        if (!this.uxData.usedGiftCode) {
            return false;
        }

        for (let i in this.uxData.usedGiftCode) {
            let pCode = this.uxData.usedGiftCode[i];
            if (pCode === code) {
                return true;
            }
        }

        return false;
    },

    canShare_vita_restTime: function () {
        let day = Math.floor((Date.now() + 3600000 * 8) / 86400000);
        if (this.uxData.share_vita_daystamp && this.uxData.share_vita_daystamp >= day && this.uxData.share_vita_rest != null) {
            return this.uxData.share_vita_rest;
        }

        return shareVitaCountPerDay;
    },

    setShared_vita: function () {
        let day = Math.floor((Date.now() + 3600000 * 8) / 86400000);
        if (this.uxData.share_vita_daystamp == null || this.uxData.share_vita_daystamp < day) {
            this.uxData.share_vita_rest = shareVitaCountPerDay;
            this.uxData.share_vita_daystamp = day;
        }

        if (this.uxData.share_vita_rest == null) {
            this.uxData.share_vita_rest = shareVitaCountPerDay;
        }

        this.uxData.share_vita_rest -= 1;
        this.toSaveUxData = true;
    },

    onLoginFinish: function () {
        if (this.isFirst) {
            if (WechatAPI.isWx) {
                let sceneId = cc.enterAppSceneId || appContext.getUxManager().cache.enterAppSceneId || 0;
                let promoteChannel = appContext.getUxManager().cache.promoteChannel;
                appContext.getAnalyticManager().addEvent("newUser_scene__" + sceneId);
                if (promoteChannel) {
                    appContext.getAnalyticManager().addEvent("newUser_promote__" + promoteChannel);
                    appContext.getAnalyticManager().sendALD("newUser_promote__" + promoteChannel);
                } else {
                    promoteChannel = "default";
                }

                debug.log("首次进入游戏promoteChannel " + promoteChannel);
            }
        }

        this.initGameInfo();
        this.saveGameInfo();
        appContext.getAnalyticManager().accelerateUpload(0);
    },

    initInviteData: function () {
        let data = this.gameInfo.inviteData;
        if (data == null || data.finished == null) {
            data = {};
            data.finished = false;
            data.crueList = [];
            data.hostOpenId = null;
            data.rewardClaimedCount = 0;
            this.gameInfo.inviteData = data;
            this.saveGameInfo();
        }
    },

    saveUserInfo: function (userInfo) {
        debug.log("!!saveUserInfo");
        if (userInfo) {
            WechatAPI.setStorageSync(StorageKey.UserInfo, userInfo);
        }
    },

    createRawUserInfo() {
        return {
            basic: {
                nickname: "我",
                sex: 1,//0 female, 1 male
                headIconUrl: null,
                headIconPath: null,//prior
                maxKeepWin: 0,
                winCount: 0,
                roundCount: 0,
                grade: 1,
                currentScore: 0,//这是总分，总分不会小于0。 显示出来的得分是计算段位之后的总分
                //  let scoreInfo = appContext.getUxManager().getScoreInfo(currentScore);
                // todaySafeScore // from SC2. the score to prevent rank loose, not sure to use it or not
            },
        };
    },
    getUserInfo: function (res) {
        let userInfo = WechatAPI.getStorageSync(StorageKey.UserInfo);
        debug.log("userInfo:");
        debug.log(userInfo);
        if (userInfo == null || userInfo == "") {
            userInfo = this.createRawUserInfo();
            this.saveUserInfo(userInfo);
        }

        return userInfo;
    },

    initGameInfo: function () {
        let info = WechatAPI.getStorageSync(StorageKey.GameInfo, true);

        this.vitaSystem = VitaSystem;
        let now = Date.now();

        if (info == null || info == "" || typeof info != "object") {
            this.gameInfo = {};
            this.vitaSystem.init();
            this.initCore(now);
            this.initInviteData();
        } else {
            debug.log("load existing game info");
            //debug.log(info);
            this.gameInfo = info;
            this.versionCheck();
            this.vitaSystem.load(this.gameInfo.vitaSystem);
        }

        this.gameInfo.vitaSystem = this.vitaSystem.getSaveData();
    },

    //检测已有的存档，进行版本修复
    versionCheck: function () {
        this.initAvatarData();

        let version = debug.version;
        if (this.gameInfo.version == null) {
            this.gameInfo.version = debug.version;
            this.gameInfo.vitaSystem.vita = this.vitaSystem.vitaMax;

        } else if (this.gameInfo.version != debug.version) {
            debug.log("Update from " + this.gameInfo.version);
            this.gameInfo.version = debug.version;
        }
    },

    getPlayerData: function () {
        let data = {};
        data.uxData = this.uxData;
        data.gameInfo = this.gameInfo;
        return data;
    },

    saveGameInfo: function () {
        this.toSaveGameInfo = true;
    },

    registerWin: function (levelPassed) {
        let data = {};

        return data;
    },

    registerLoose: function (levelPassed) {
        let data = {};

        return data;
    },

});