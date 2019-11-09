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
            get: function() {
                if (this._data && this._data.timeSinceFirst) {
                    return this._data.timeSinceFirst / 86400000;
                }
                return 0;
            },
        },

        playedHours: {
            get: function() {
                if (this._data && this._data.timeSinceFirst) {
                    return this._data.timeSinceFirst / 3600000;
                }
                return 0;
            },
        },

        playedTimes: {
            get: function() {
                if (this.uxData && this.uxData.counts) {
                    return this.uxData.counts;
                }

                return 1;
            },
        },

        AFKHours: {
            get: function() {
                if (this._data && this._data.timeSinceLast) {
                    return this._data.timeSinceLast / 3600000;
                }

                return 0;
            },
        },

        isFirst: {
            get: function() {
                if (this.uxData && this.uxData.counts) {
                    return this.uxData.counts <= 1;
                }

                return false;
            },
        },

        isFirstGame: {
            get: function() {
                if (this.uxData != null) {
                    return (this.getEndGameCounts() < 1);
                }

                return false;
            },
        },

        playerData: {
            get: function() {
                return this.getPlayerData();
            },
        },
    },

    ctor: function() {
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

    init: function() {
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

    setDayInfo: function() {
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

    recordEndGame: function() {
        if (!this.uxData.endGameCounts) {
            this.uxData.endGameCounts = 0;
        }
        this.uxData.endGameCounts += 1;
        this.uxData.dayInfo.combatCount++;
        this.toSaveUxData = true;
    },

    getEndGameCounts: function() {
        if (!this.uxData.endGameCounts) {
            this.uxData.endGameCounts = 0;
        }

        return this.uxData.endGameCounts;
    },

    recordGiftCode: function(code) {
        if (!this.uxData.usedGiftCode) {
            this.uxData.usedGiftCode = [];
        }
        this.uxData.usedGiftCode.push(code);
        this.toSaveUxData = true;
    },

    recordCardCode: function(code) {
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

    isGiftCodeUsed: function(code) {
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

    canShare_vita_restTime: function() {
        let day = Math.floor((Date.now() + 3600000 * 8) / 86400000);
        if (this.uxData.share_vita_daystamp && this.uxData.share_vita_daystamp >= day && this.uxData.share_vita_rest != null) {
            return this.uxData.share_vita_rest;
        }

        return shareVitaCountPerDay;
    },

    setShared_vita: function() {
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

    onLoginFinish: function() {
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

    initInviteData: function() {
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

    setUserInfo: function(userInfo) {
        debug.log("!!setUserInfo");
        if (userInfo) {
            this.userInfo = {
                // avatarUrl: res.userInfo.avatarUrl,
                // city: res.userInfo.city,
                // country: res.userInfo.country,
                // gender: res.userInfo.gender,//性别 0：未知、1：男、2：女
                //nickName:.userInfo.nickName,
                //province: res.userInfo.province,
                avatarUrl: this.userInfo.avatarUrl || userInfo.avatarUrl,
                openId: this.userInfo.openId || userInfo.openId,
                nickName: this.userInfo.nickName || userInfo.nickName,
                gender: this.userInfo.gender || userInfo.gender,
            };
            //debug.log(this.userInfo);
            WechatAPI.setStorageSync(StorageKey.UserInfo, this.userInfo);
        }
    },

    getUserInfo: function(res) {
        if (this.userInfo == null) {
            this.userInfo = WechatAPI.getStorageSync(StorageKey.UserInfo);
        }
        debug.log("getUserInfo");
        debug.log(this.userInfo);
        return this.userInfo;
    },

    initGameInfo: function() {
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
    versionCheck: function() {
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

    getAvatarData: function() {
        this.initAvatarData();
        if (this.cache.tempAvatarId) {
            return {
                crtId: this.cache.tempAvatarId,
                unlockedList: this.gameInfo.avatar.unlockedList,
            };
        }
        return this.gameInfo.avatar;
    },

    initCore: function(now) {
        this.gameInfo.version = debug.version;
        this.gameInfo.items = [];
        /*{
            type: "InnerBomb",
            count: 1,
        }*/
        this.gameInfo.removeAdPurchased = false;
        this.gameInfo.level = {
            gm: {
                done: true,
                star: 0,
                score: 0,
            },
            miniProg: {
                done: true,
                star: 0,
                score: 0,
            },
        };

        this.initAvatarData();
    },

    unlockAvatar: function(id) {
        //need to check valid?
        if (this.gameInfo.avatar.unlockedList.indexOf(id) == -1) {
            this.gameInfo.avatar.unlockedList.push(id);
        } else {
            debug.log("解锁了已有的avatar");
        }
    },

    getPlayerData: function() {
        let data = {};
        data.userInfo = this.userInfo;
        data.uxData = this.uxData;
        data.gameInfo = this.gameInfo;
        return data;
    },

    saveGameInfo: function() {
        this.toSaveGameInfo = true;
    },

    registerWin: function(levelPassed) {
        let winData = {};
        winData.time = levelPassed.time;
        winData.score = levelPassed.score;
        winData.loot = [];

        for (let t in levelPassed.loot) {
            winData.loot[t] = levelPassed.loot[t]
        }

        let exp = this.getTotalStars();

        if (!this.gameInfo.level[levelPassed.index]) {
            this.createEmptyLevelGameData(levelPassed.index);
        }

        let crtLevel = this.gameInfo.level[levelPassed.index];
        let firstPass = false;
        if (!crtLevel.done) {
            crtLevel.done = true;
            crtLevel.firstTime = Date.now();
            firstPass = true;
        }
        if (crtLevel.score == 0 || levelPassed.score > crtLevel.score) {
            crtLevel.score = levelPassed.score;
        }

        if (levelPassed.star > crtLevel.star) {
            crtLevel.star = levelPassed.star;
        }

        let newExp = this.getTotalStars();

        winData.exp = exp;
        winData.gainedExp = newExp - exp;
        winData.stars = 5;
        winData.gainedStars = levelPassed.star;


        this.saveGameInfo();
        debug.log("!registerWin, winData");
        debug.log(winData);
        return winData;
    },

    registerLoose: function(levelPassed) {
        let looseData = {};
        looseData.kill = levelPassed.kill;
        looseData.time = levelPassed.time;
        looseData.score = levelPassed.score;
        for (let t in levelPassed.loot) {
            looseData.loot[t] = levelPassed.loot[t]
        }

        return looseData;
    },

    getQualifiedItems: function(ignoreZero = true) {
        let qualifiedItems = []
        for (let i in this.gameInfo.items) {
            let pItem = this.gameInfo.items[i];
            if (pItem) {
                let item = {};

                //这里已经把过期物品处理掉了
                if (pItem.param && pItem.param.expireMS && pItem.param.date) {
                    let delta = Date.now() - pItem.param.date;
                    if (pItem.param.expireMS <= delta) {
                        this.gameInfo.items[i] = null;
                        continue;
                    }
                }

                if (ignoreZero && pItem.count <= 0) {
                    continue;
                }

                item.count = pItem.count;
                item.type = pItem.type;
                item.param = pItem.param

                qualifiedItems.push(item);
            }
        }

        return qualifiedItems;
    },

    //可以用于资源类，非资源类物品，比如带有有效期的物品，唯一的物品，可堆叠的都可以
    //如果堆叠带有有效期的物品，会延长有效期
    addItem: function(item) {
        if (item.count <= 0) {
            debug.log("addItem count <=0!");
            return;
        }

        let t = item.type;
        let prototype = Item[t];
        if (!prototype) {
            return;
        }
        //debug.log("addItem " + t);

        let done = false;

        for (let i in this.gameInfo.items) {
            let pItem = this.gameInfo.items[i];
            if (pItem && pItem.type === t) {
                if (prototype.expireMS && pItem.param && pItem.param.expireMS) {
                    let expireMS = prototype.expireMS;
                    if (item.count > 1) {
                        expireMS *= item.count;
                    }

                    pItem.param.expireMS += expireMS;
                    debug.log("combine expireMS: " + expireMS);
                } else {
                    pItem.count += item.count;
                }
                this.gameInfo.items[i] = pItem;
                done = true;
            }
        }

        if (!done) {
            let newItem = {
                type: item.type,
                count: item.count,
                param: item.param || {},
            };

            if (prototype.expireMS) {
                debug.log("add expireMS for item");
                newItem.param.date = Date.now();
                newItem.param.expireMS = prototype.expireMS;
            }

            this.gameInfo.items.push(newItem);
        }
    },

    //请不要用于非资源类物品，比如带有有效期的物品，唯一的物品
    startTransaction: function(currencyItemId, price, makeDeal = false) {
        if (price == 0) {
            return true;
        }

        let possessingAmount = this.getItemCount(currencyItemId);

        let enough = possessingAmount >= price;
        if (enough && makeDeal) {
            for (let i in this.gameInfo.items) {
                let pItem = this.gameInfo.items[i];
                if (pItem && pItem.type === currencyItemId) {
                    pItem.count -= price;
                    this.gameInfo.items[i] = pItem;
                }
            }
        }

        return enough;
    },

    getItemCount: function(itemId) {
        for (let i in this.gameInfo.items) {
            let pItem = this.gameInfo.items[i];
            if (pItem && pItem.type === itemId) {
                return pItem.count;
            }
        }

        return 0;
    },

    //TODO to grade
    // //PlayerLevel可以通过这个类获取详细信息
    // getTotalStars: function() {
    //     let stars = 0;
    //     for (let i in this.gameInfo.level) {
    //         if (this.gameInfo.level[i]) {
    //             stars += this.gameInfo.level[i].star;
    //         }
    //     }

    //     return stars;
    // },

    // getPlayerLevelInfo(exp) {
    //     if (exp == null) {
    //         exp = this.getTotalStars();
    //     }

    //     return PlayerLevel.getLevelInfo(exp);
    // },

    createEmptyLevelGameData: function(index, unlocked = false) {
        this.gameInfo.level[index] = {
            done: false,
            star: 0,
            score: 0,
        };
        if (unlocked) {
            this.gameInfo.level[index].unlocked = true;
        }
    },

    getMyMiniProgPrize: function() {
        if (this.gameInfo.level.miniProg == null) {
            this.gameInfo.level.miniProg = {
                done: true,
                star: 0,
                score: 0,
            };
        }
        this.gameInfo.level.miniProg.star = 3;
        this.saveGameInfo();

        let s = "";
        if (WechatAPI.isWx) {
            s = "通过我的小程序进入游戏\n获得了额外的星星！";
        } else {
            s = "创建桌面图标\n获得了额外的星星！";
        }
        appContext.getDialogManager().showDialog(DialogTypes.Item, {
            items: [{
                type: "VirtualStar",
                count: 3
            }],
            desc: s,
        });
    },

    matchWLLow() {
        //场景值列表
        //https://developers.weixin.qq.com/minigame/dev/reference/scene-list.html
        //场景值二级白名单WhiteList： 最近使用 分享卡片 我的小程序 小程序返回
        //1001 1007 1008 1036 1038 1089
        let id = this.cache.enterAppSceneId;
        return id == 1001 || id == 1007 || id == 1008 || id == 1036 || id == 1038 || id == 1089;
    },

    matchWLHigh() {
        //场景值一级白名单： 其他小程序 小程序广告组件 公众号文章
        //1058 1037 1067 1074 1082 1084 1091 1095
        let id = this.cache.enterAppSceneId;
        // id == null || 一般是开发者工具
        return id == 1058 || id == 1037 || id == 1067 ||
            id == 1074 || id == 1082 || id == 1084 || id == 1091 || id == 1095;
    },
});