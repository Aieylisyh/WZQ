let StorageKey = require("StorageKey");
// let VitaSystem = require("VitaSystem");
// let DialogTypes = require("DialogTypes");
let Grade = require('Grade');
const WechatAPI = require("../../com/managers/WechatAPI");
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
            //this.gameInfo.vitaSystem = this.vitaSystem.getSaveData();
            WechatAPI.setStorageSync(StorageKey.uniqueKey.GameInfo, JSON.stringify(this.gameInfo));

            appContext.getDialogManager().updateDataBasedDialogs();
        }

        if (this.toSaveUxData) {
            this.toSaveUxData = false;
            WechatAPI.setStorageSync(StorageKey.uniqueKey.uxData, JSON.stringify(this.uxData));
        }

        if (this.toSaveUserInfo) {
            this.toSaveUserInfo = false;
            if (this.userInfo) {
                WechatAPI.setStorageSync(StorageKey.uniqueKey.UserInfo, JSON.stringify(this.userInfo));
            }
        }
    },

    init: function () {
        this.cache = this.cache || {};
        this.userScoreDic = {};
        //this.saveByMinorChangeCounter = this.saveByMinorChangeCount;
        debug.log("UserExperienceManager 进入游戏");

        this.initUxData();
        this.setDayInfo();
        this._data = {};
        this._data.timeSinceFirst = Date.now() - this.uxData.firstDate;
        this._data.timeSinceLast = Date.now() - this.uxData.lastestDate;
        this.uxData.lastestDate = Date.now();

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
        this.toSaveUxData = true;
        this.toSaveUserInfo = true;
        this.toSaveGameInfo = true;
        appContext.getAnalyticManager().accelerateUpload(0);
    },

    initUxData() {
        this.uxData = WechatAPI.getStorageSync(StorageKey.uniqueKey.uxData, true);
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
    },

    onLoginFinish: function (id = null) {
        debug.log("登陆完成");
        let userId = id != null ? id : WechatAPI.getStorageSync(StorageKey.UserKey);
        StorageKey.SetUserId(userId, false);

        if (WechatAPI.isYY) {
            let userBasic = appContext.getUxManager().getUserInfo().basic;
            WanGameH5sdk.log({
                action: 'access',
                gser: '1',
                servername: 'WZQ1',
                roleid: userId,
                rolename: userBasic.nickname,
                rolelevel: '1',
                power: '0'
            });
        }

        this.init();
        WechatAPI.setTTAppLaunchOptions();
        this.loginFinished = true;

        //call mainwindow to react login result
        appContext.scheduleOnce(function () {
            let cwn = appContext.getWindowManager().getCurrentWindowNode();
            if (cwn) {
                let mw = cwn.getComponent("MainWindow");
                if (mw) {
                    mw.onLoginFinish();
                }
            }
        }, 0.1);
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

        let codeList = WechatAPI.getStorageSync(StorageKey.uniqueKey.WxShareCardEntryInfo, true);

        if (codeList == null || typeof codeList !== "object") {
            codeList = [];
        }

        codeList.push(code);
        WechatAPI.setStorage(StorageKey.uniqueKey.WxShareCardEntryInfo, codeList);
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
        //debug.log(userInfo);
        this.userInfo = userInfo;
        this.toSaveUserInfo = true;
    },

    createRawUserInfo() {
        return {
            basic: {
                nickname: this.getRawNickname(),
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

    getRawNickname() {
        let aPool = ["勇敢", "过去", "暖暖", "机智", "智慧", "非凡", "五彩", "Ace", "酷酷", "风", "水", "炎", "林", "魔法", "神奇", "沉默", "暗影", "无敌"];
        let bPool = ["智者", "隐士", "法师", "伯爵", "妹子", "女森", "僧", "棋手", "棋圣", "守望", "王者", "精英", "侠客", "王", "诗人", "眼", "心", "游侠", "行者", "舞者"];
        let cPool = ["的", "之", "-", "·", "", "&"];
        let a = aPool[Math.floor(Math.random() * aPool.length)];
        let b = bPool[Math.floor(Math.random() * bPool.length)];
        let c = cPool[Math.floor(Math.random() * cPool.length)];
        return a + c + b;
    },

    getUserInfo: function () {
        let userInfo = WechatAPI.getStorageSync(StorageKey.uniqueKey.UserInfo);

        if (userInfo == null || userInfo == "" || userInfo == {}) {
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
        WechatAPI.setStorageSync(StorageKey.uniqueKey.UserInfo, null);
        WechatAPI.setStorageSync(StorageKey.uniqueKey.uxData, null);
        WechatAPI.setStorageSync(StorageKey.uniqueKey.GameInfo, null);

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
        let info = WechatAPI.getStorageSync(StorageKey.uniqueKey.GameInfo, true);

        if (info == null || info == "" || typeof info != "object") {
            this.gameInfo = {};
            this.gameInfo.gold = 500;
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
            this.gameInfo.usedCode = [];
            this.toSaveGameInfo = true;
        } else {
            debug.log("load existing game info");
            //debug.log(info);
            this.gameInfo = info;
        }

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

    isTodaySuperShareVideoShown() {
        return this.gameInfo.superShareVideoDay == this.uxData.dayInfo.day;
    },

    setTodaySuperShareVideo() {
        this.gameInfo.superShareVideoDay = this.uxData.dayInfo.day;
        this.saveGameInfo();
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

    registerRankInfo(oppoGrade, win) {
        if (this.gameInfo.rankInfo == null) {
            this.gameInfo.rankInfo = {};
        }

        let label1 = "winCount_" + oppoGrade;
        let label2 = "combatCount_" + oppoGrade;
        if (this.gameInfo.rankInfo[label1] == null) {
            this.gameInfo.rankInfo[label1] = 0;
        }
        if (this.gameInfo.rankInfo[label2] == null) {
            this.gameInfo.rankInfo[label2] = 0;
        }
        this.gameInfo.rankInfo[label2] += 1;
        if (win) {
            this.gameInfo.rankInfo[label1] += 1;
        }
    },

    registerGameEnd: function (info) {
        debug.log("游戏结束！！！");
        this.setTodayGameCount();
        // debug.log(info.selfPlayer.basic.currentScore);
        // debug.log(info.opponentPlayer.basic.currentScore);
        // debug.log(info.win);
        // debug.log(info.isLooserOffline);
        let grade1 = Grade.getGradeAndFillInfoByScore(info.selfPlayer.basic.currentScore).grade;
        let grade2 = Grade.getGradeAndFillInfoByScore(info.opponentPlayer.basic.currentScore).grade;

        info.gradeScoreAdd = Grade.getScoreByGradeDelta(grade1, grade2, info.win);
        this.registerRankInfo(grade2, info.win);

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
        //debug.log(userInfo.basic.currentScore);
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

        if (WechatAPI.isYY) {
            let userBasic = appContext.getUxManager().getUserInfo().basic;
            let userId = WechatAPI.getStorageSync(StorageKey.UserKey);
            WanGameH5sdk.log({
                action: 'score',
                actionvalue: (info.toScore + ""), // 游戏为关卡模式：每通过一关上报关卡（或用户A通过第一关传 10，通过第二关 20……以此类推）；游戏为分数模式，则直接传分数即可
                gser: '1',
                servername: 'WZQ1',
                roleid: userId,
                rolename: userBasic.nickname,
            });
        }
        return info;
    },

    getGoldByGameEnd(win, grade) {
        let res = 10 + grade + Math.random() * 13;

        if (win) {
            res += 10;
        } else {
            res -= 10
        }

        if (res <= 0) {
            res = 1;
        }

        if (grade > 8) {
            res *= 1.25;
        } else if (grade > 6) {
            res *= 1.22;
        } else if (grade > 4) {
            res *= 1.2;
        } else if (grade > 2) {
            res *= 1.1;
        } else {
            res *= 1;
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

    isValidDailyRewardClaimedDay() {
        let date = new Date();
        let day = date.getDay();

        let d = this.gameInfo.lastDailyRewardClaimedDay;
        if (d == null) {
            return true;
        }

        if (d < day) {
            return true;
        }

        return false;
    },

    setDailyRewardClaimedDay() {
        let d = new Date();
        this.gameInfo.lastDailyRewardClaimedDay = d.getDay();
        this.saveGameInfo();
    },

    setTodayGameCount() {
        this.initTodayGameCount();

        this.gameInfo.todayGameCount++;
        this.saveGameInfo();
    },

    getTodayGameCount() {
        this.initTodayGameCount();

        return this.gameInfo.todayGameCount = 0;
    },

    initTodayGameCount() {
        let day = Math.floor((Date.now() + 3600000 * 8) / 86400000);

        if (this.gameInfo.todayGameCount == null) {
            this.gameInfo.todayGameCount = 0;
            this.gameInfo.todayGameDayStamp = day;
            this.saveGameInfo();
        } else if (this.gameInfo.todayGameDayStamp < day) {
            this.gameInfo.todayGameCount = 0;
            this.gameInfo.todayGameDayStamp = day;
            this.saveGameInfo();
        } else if (this.gameInfo.todayGameDayStamp >= day) {
            this.gameInfo.todayGameDayStamp = day;
        }
    },
});