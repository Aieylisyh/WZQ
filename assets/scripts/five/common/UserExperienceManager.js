let StorageKey = require("StorageKey");
// let VitaSystem = require("VitaSystem");
// let DialogTypes = require("DialogTypes");
let Grade = require('Grade');
// let Item = require('Item');


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
    },

    ctor: function () {
        this.cache = {};
        this.loginFinished = false;
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

        if (this.toSaveUserInfo) {
            this.toSaveUserInfo = false;
            if (this.userInfo) {
                WechatAPI.setStorageSync(StorageKey.UserInfo, this.userInfo);
            }
        }
    },

    init: function () {
        this.cache = this.cache || {};
        this.userScoreDic = {};
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
                // this.uxData.safeEntry = this.matchWLHigh();
                // console.log("首 whlist " + this.uxData.safeEntry);
            }

        } else {
            this.uxData.counts += 1;
            debug.log(this.uxData.counts + "次");
            if (WechatAPI.isWx) {
                // if (this.uxData.safeEntry) {
                //     this.uxData.safeEntry = this.matchWLHigh() || this.matchWLLow();
                // }
                // console.log("whlist " + this.uxData.safeEntry);
            }
        }

        this.setDayInfo();
        this._data = {};
        this._data.timeSinceFirst = Date.now() - this.uxData.firstDate;
        this._data.timeSinceLast = Date.now() - this.uxData.lastestDate;
        this.uxData.lastestDate = Date.now();

        this.toSaveUxData = true;

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

    onLoginFinish: function () {
        debug.log("登陆完成");
        this.init();
        WechatAPI.setTTAppLaunchOptions();
        this.loginFinished = true;

        let cwn = appContext.getWindowManager().getCurrentWindowNode();
        if (cwn) {
            debug.log("cwn");
            let mw = cwn.getComponent("MainWindow");
            if (mw) {
                debug.log("onLoginFinish");
                mw.onLoginFinish();
            }
        }

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

    saveUserInfo: function (userInfo) {
        debug.log("!!saveUserInfo");
        debug.log(userInfo);
        this.userInfo = userInfo;
        this.toSaveUserInfo = true;
    },

    createRawUserInfo() {
        return {
            basic: {
                nickname: "我",
                sex: 1,//0 female, 1 male
                headIconUrl: null,
                headIconPath: null,//prior
                maxKeepWin: 0,
                crtKeepWin: 0,
                totalHands: 0,
                winCount: 0,
                roundCount: 0,
                lastWin: false,
                currentScore: 0,//1090
                //这是总分，总分不会小于0。 显示出来的得分是计算段位之后的总分
                //  let scoreInfo = appContext.getUxManager().getScoreInfo(currentScore);
                // todaySafeScore // from SC2. the score to prevent rank loose, not sure to use it or not
            },
        };
    },

    getUserInfo: function () {
        let userInfo = WechatAPI.getStorageSync(StorageKey.UserInfo);
        debug.log("!!getUserInfo");
        debug.log(userInfo);
        if (userInfo == null || userInfo == "") {
            userInfo = this.createRawUserInfo();
            this.saveUserInfo(userInfo);
        }

        return userInfo;
    },

    pushUserToPool(dummyId, score) {
        debug.log("放入用户池" + dummyId + " score " + score);
        let has = false;
        for (let i in this.userPool) {
            if (this.userPool[i] == dummyId) {
                has = true;
                break;
            }
        }

        if (has) {
            debug.log("重复放入用户池" + dummyId);
            return;
        }

        this.userPool.push(dummyId);
        this.userScoreDic[dummyId] = score;
    },

    getUserPool() {
        if (!this.userPool) {
            this.userPool = [];
        }

        return this.userPool;//简简单单就是一个数组 保存本地游戏生命周期出现过的玩家id
    },

    resetGameInfo() {
        WechatAPI.setStorageSync(StorageKey.UserInfo, null);
        WechatAPI.setStorageSync(StorageKey.uxData, null);
        WechatAPI.setStorageSync(StorageKey.GameInfo, null);

        this.init();
        this.getUserInfo();
        this.userPool = [];
        this.userScoreDic = {};
        this.initGameInfo();

        this.toSaveUserInfo = false;
        this.toSaveUxData = false;
        this.toSaveGameInfo = false;
    },

    initGameInfo: function () {
        let info = WechatAPI.getStorageSync(StorageKey.GameInfo, true);

        this.vitaSystem = VitaSystem;
        let now = Date.now();

        if (info == null || info == "" || typeof info != "object") {
            this.gameInfo = {};
            this.gameInfo.gold = 0;
            this.gameInfo.grabFirstCardCount = 2;
            this.gameInfo.keepGradeCardCount = 0;
            this.gameInfo.bonusScoreDay = 0;
            this.gameInfo.randomGoldDay = 0;
            this.gameInfo.randomCardDay = 0;
            this.gameInfo.randomGoldCount = 0;
            this.gameInfo.randomCardCount = 0;
            this.gameInfo.checkinLastDay = 0;
            this.gameInfo.checkinValidDayCount = 0;
            this.gameInfo.checkinTodayTimes = 0;
            this.vitaSystem.init();
        } else {
            debug.log("load existing game info");
            //debug.log(info);
            this.gameInfo = info;
            this.vitaSystem.load(this.gameInfo.vitaSystem);
        }

        this.gameInfo.vitaSystem = this.vitaSystem.getSaveData();
    },

    useGrabFirstCard() {
        if (this.gameInfo.grabFirstCardCount >= 1) {
            this.gameInfo.grabFirstCardCount = this.gameInfo.grabFirstCardCount - 1;
            this.saveGameInfo();
            return true;
        }

        return false;
    },

    useGold(count) {
        if (this.gameInfo.gold >= count) {
            this.gameInfo.gold = this.gameInfo.gold - count;
            this.saveGameInfo();
            return true;
        }

        return false;
    },

    useKeepGradeCard() {
        if (this.gameInfo.keepGradeCardCount >= 1) {
            this.gameInfo.keepGradeCardCount = this.gameInfo.keepGradeCardCount - 1;
            this.saveGameInfo();
            return true;
        }

        return false;
    },

    tryUseBonusScore() {
        if (this.gameInfo.bonusScoreDay < this.uxData.dayInfo.day) {
            this.gameInfo.bonusScoreDay = this.uxData.dayInfo.day;
            this.saveGameInfo();
            return true;
        }

        return false;
    },

    getAndRefineRandomCardUsedCount() {
        if (this.gameInfo.randomCardDay < this.uxData.dayInfo.day) {
            this.gameInfo.randomCardDay = this.uxData.dayInfo.day;
            this.gameInfo.randomCardCount = 0;
            this.saveGameInfo();
        }

        return this.gameInfo.randomCardCount;
    },

    canUseRandomCard() {
        let count = this.getAndRefineRandomCardUsedCount();
        return count < 1;
    },

    useRandomCard() {
        if (this.canUseRandomCard()) {
            this.gameInfo.randomCardCount++;
            this.saveGameInfo();
        }
    },

    getAndRefineRandomGoldUsedCount() {
        if (this.gameInfo.randomGoldDay < this.uxData.dayInfo.day) {
            this.gameInfo.randomGoldDay = this.uxData.dayInfo.day;
            this.gameInfo.randomGoldCount = 0;
            this.saveGameInfo();
        }

        return this.gameInfo.randomGoldCount;
    },

    canUseRandomGold() {
        let count = this.getAndRefineRandomGoldUsedCount();
        return count < 4;
    },

    useRandomGold() {
        if (this.canUseRandomGold()) {
            this.gameInfo.randomGoldCount++;
            this.saveGameInfo();
        }
    },

    getAndRefineCheckinDayCounts() {
        if (!this.todayCheckedin()) {
            if (this.lastDayCheckedin()) {
                if (this.gameInfo.checkinValidDayCount >= 6) {
                    this.gameInfo.checkinValidDayCount = 0;
                    this.gameInfo.checkinTodayTimes = 0;
                } else {
                    this.gameInfo.checkinTodayTimes = 0;
                }
            } else {
                this.gameInfo.checkinValidDayCount = 0;
                this.gameInfo.checkinTodayTimes = 0;
            }
            this.saveGameInfo();
        }

        return this.gameInfo.checkinValidDayCount;
    },

    checkinProcess() {
        let c = this.getAndRefineCheckinDayCounts();
        this.gameInfo.checkinLastDay = this.uxData.dayInfo.day;

        if (this.gameInfo.checkinTodayTimes == 0) {
            this.gameInfo.checkinValidDayCount = c + 1;
        }

        this.gameInfo.checkinTodayTimes++;

        this.saveGameInfo();
    },

    todayCheckedin() {
        return this.gameInfo.checkinLastDay == this.uxData.dayInfo.day;
    },

    lastDayCheckedin() {
        return this.gameInfo.checkinLastDay == this.uxData.dayInfo.day - 1;
    },

    rewardItems(list, showDialog = true) {
        for (let i in list) {
            let itemInfo = list[i];
            if (itemInfo.type == "Gold") {
                this.gameInfo.gold += itemInfo.count;
            } else if (itemInfo.type == "GrabFirstCard") {
                this.gameInfo.grabFirstCardCount += itemInfo.count;
            } else if (itemInfo.type == "KeepGradeCard") {
                this.gameInfo.keepGradeCardCount += itemInfo.count;
            }
        }

        // if (showDialog) {
        //     //todo
        // }
        this.saveGameInfo();
    },

    saveGameInfo: function () {
        this.toSaveGameInfo = true;
    },

    registerGameEnd: function (info) {
        debug.log("游戏结束！！！");
        // debug.log(info.selfPlayer.basic.currentScore);
        // debug.log(info.opponentPlayer.basic.currentScore);
        // debug.log(info.win);
        // debug.log(info.isLooserOffline);
        let grade1 = Grade.getGradeAndFillInfoByScore(info.selfPlayer.basic.currentScore).grade;
        let grade2 = Grade.getGradeAndFillInfoByScore(info.opponentPlayer.basic.currentScore).grade;

        info.gradeScoreAdd = Grade.getScoreByGradeDelta(grade1, grade2, info.win);
        if (info.win) {
            if (this.tryUseBonusScore()) {
                info.gradeScoreAdd += 120;
                info.usedBonusScore = true;
            }
        } else {
            if (info.isDrawGame) {
                info.gradeScoreAdd = 0;
            }
        }

        let userInfo = this.getUserInfo();
        debug.log(userInfo.basic.currentScore);
        info.fromScore = userInfo.basic.currentScore;
        userInfo.basic.roundCount += 1;
        userInfo.basic.currentScore += info.gradeScoreAdd;

        if (userInfo.basic.currentScore < 0) {
            userInfo.basic.currentScore = 0;
            info.gradeScoreAdd = - info.fromScore;
        }
        info.toScore = userInfo.basic.currentScore;

        if (info.win) {
            userInfo.basic.crtKeepWin += 1;
            userInfo.basic.lastWin = true;
            userInfo.basic.winCount += 1;
            if (userInfo.basic.crtKeepWin > userInfo.basic.maxKeepWin) {
                userInfo.basic.maxKeepWin = userInfo.basic.crtKeepWin;
            }
        } else {
            userInfo.basic.crtKeepWin = 0;
            userInfo.basic.lastWin = false;
        }

        userInfo.basic.totalHands += info.totalHands;

        info.gold = this.getGoldByGameEnd(info.win, grade1);
        this.rewardItems([{ type: "Gold", count: info.gold }]);

        this.addFatigue();
        this.saveUserInfo(userInfo);

        return info;
    },

    getGoldByGameEnd(win, grade) {
        let res = 10 + grade + Math.random() * 12;

        if (win) {
            res += 10;
        } else {
            res -= 10
        }

        if (res <= 0) {
            res = 1;
        }

        if (grade > 8) {
            res *= 1.4;
        } else if (grade > 6) {
            res *= 1.3;
        } else if (grade > 4) {
            res *= 1.2;
        } else if (grade > 2) {
            res *= 1.1;
        } else {

        }

        return Math.floor(res);
    },

    addFatigue() {
        if (this.gameInfo.fatigueCount == null) {
            this.gameInfo.fatigueCount = 0;
        }
        this.gameInfo.fatigueCount += 1;
        this.saveGameInfo();
    },

    startFatigue() {
        this.gameInfo.fatigueCount = 0;
        this.gameInfo.fatigueTimestamp = Date.now();
    },

    tryTriggerFatigue() {
        //尝试一次是否触发疲劳机制  如果触发则清空计数 累计局数越多，触发几率越大 这个function应该在mainwindow调用
        let f = this.gameInfo.fatigueCount + Math.random() * 7.1;
        if (f > 10) {
            this.startFatigue();
        }
    },
});