let AppState = require("AppState");
let DataKey = require("DataKey");
let DialogTypes = require("DialogTypes");
//let StringUtil = require("StringUtil");
let StorageKey = require("StorageKey");
let DataContainerUpdater = require("DataContainerUpdater");
let Encoder = require("Encoder");

cc.Class({
    extends: cc.Component,

    properties: {
        _currentAppState: AppState.Null,

        _shareCardPasswords: [],

        _userStayRecordTimer: 0,

        _userStay3Minutes: 0,
    },

    start: function () {
        this.bindDataContainer();
        this._userStayRecordTimer = 0;
    },

    bindDataContainer: function () {
        let kv = {};
        kv[DataKey.AppState] = "onAppStateUpdate";
        DataContainerUpdater.bind.call(this, kv);
    },

    update: function (dt) {
        DataContainerUpdater.update.call(this);

        let state = this.getAppState();
        switch (state) {
            case AppState.Null:
            case AppState.NoWxPLogin:
            case AppState.WxPLoginOk:
                //如果没有登录 暂停读取等待登录完成
                this.wxOnShowTimestamp = null;
                break;
        }

        if (this.wxOnShowTimestamp != null && cc.tempData && cc.tempData.timestamp) {
            //在startListenWxOnShowParam之后，才执行
            if (cc.tempData.timestamp > this.wxOnShowTimestamp) {
                this.wxOnShowTimestamp = cc.tempData.timestamp;

                debug.tempBlockOnHideExit = false;

                this.scheduleOnce(function () {
                    this.onWxOnShowUpdate();
                }, 0.15);
            }
        }

        if (this.wxOnShowEarlyTimestamp != null && cc.tempData && cc.tempData.timestamp) {
            //startListenWxOnShowEarlyParam
            if (cc.tempData.timestamp > this.wxOnShowEarlyTimestamp) {
                this.wxOnShowEarlyTimestamp = cc.tempData.timestamp;
                this.onWxOnShowEarlyUpdate();
            }
        }
    },

    startListenWxOnShowParam: function () {
        if (typeof this.wxOnShowTimestamp !== "number") {
            this.wxOnShowTimestamp = 0;
        }
    },

    startListenWxOnShowEarlyParam: function () {
        if (typeof this.wxOnShowEarlyTimestamp !== "number") {
            this.wxOnShowEarlyTimestamp = 0;
        }
    },

    getAppState: function () {
        return this._currentAppState;
    },

    onWxOnShowUpdate: function () {
        if (this.node == null) {
            return;
        }

        let state = this.getAppState();
        let sharerCardCode = null;
        let itemsString = null;
        let sharerOpenId = null;
        let sharerNickName = null;

        if (cc.tempData != null) {
            debug.log("读取启动参数");
            debug.log(cc.tempData);
            for (let i in cc.tempData) {
                debug.log(i + " : " + cc.tempData[i]);
                if (i === "items") {
                    itemsString = cc.tempData[i];
                    delete cc.tempData[i];
                } else if (i === "cardCode") {
                    sharerCardCode = cc.tempData[i];
                    delete cc.tempData[i];
                } else if (i === "sharerOpenId") {
                    sharerOpenId = cc.tempData[i];
                    delete cc.tempData[i];
                } else if (i === "sharerNickName") {
                    //暂时不知道有啥用
                    sharerNickName = cc.tempData[i];
                    delete cc.tempData[i];
                }
            }
        }

        let codeValid = this.isCardCodeValid(sharerCardCode); //里面应该有自己发出的，和自己点过的
        if (itemsString != null) {
            if (codeValid) {
                this.getGiftByItemsString(itemsString);
                appContext.getUxManager().recordCardCode(sharerCardCode);
            } else {
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "这份分享礼物已经获得过了");
            }
        }

        if (sharerOpenId != null) {
            debug.log("收到分享者的openid");
            WechatAPI.cache.sharerOpenId = sharerOpenId;
        }
    },

    getGiftByItemsString: function (inCode) {
        try {
            let giftList = Encoder.getGiftListByCode(inCode);
            //debug.logObj(giftList);

            if (giftList.length === 0) {
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "分享礼物已过期");
                return;
            }

            for (let i in giftList) {
                let item = giftList[i];
                if (item) {
                    appContext.getUxManager().addItem(item);
                }
            }

            giftList.desc = "获得好友分享礼物！";
            appContext.getDialogManager().showDialog(DialogTypes.Item, giftList);
            appContext.getUxManager().saveGameInfo();
        } catch (e) {
            debug.warn(e);
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "分享礼物失效了");
        }
    },

    onWxOnShowEarlyUpdate: function () {
        if (this.node == null) {
            return;
        }

        debug.info("!onWxOnShowEarlyUpdate");
        let shareTitle = null;
        let shareImgUrl = null;
        let promoteChannel = null;

        if (cc.enterAppSceneId != null) {
            console.log("场景值" + cc.enterAppSceneId); //https://developers.weixin.qq.com/miniprogram/dev/framework/app-service/scene.html
            //1023	安卓系统桌面图标
            //1103	发现栏小程序主入口，“我的小程序”列表
            //1104	下拉，“我的小程序”列表
            //1089	普通下拉
            appContext.getAnalyticManager().addEvent("enterAppSceneId__" + cc.enterAppSceneId);
            /*if (cc.enterAppSceneId == 1103 || cc.enterAppSceneId == 1104) {
                //如果从我的小程序进入
                let b = WechatAPI.getStorageSync(StorageKey.uniqueKey.hasEnterFromMiniProg);
                if (b == "" || b == null || b == false) {
                    WechatAPI.setStorage(StorageKey.uniqueKey.hasEnterFromMiniProg, "done"); 
                      appContext.getUxManager().getMyMiniProgPrize();
                }
            }*/

            appContext.getUxManager().cache.enterAppSceneId = cc.enterAppSceneId;
            cc.enterAppSceneId = null;
        }

        if (cc.tempData != null) {
            for (let i in cc.tempData) {
                if (i === "shareTitle") {
                    shareTitle = cc.tempData[i];
                    appContext.getUxManager().cache.shareTitle = shareTitle;
                    delete cc.tempData[i];
                } else if (i === "shareImgUrl") {
                    shareImgUrl = cc.tempData[i]
                    appContext.getUxManager().cache.shareImgUrl = shareImgUrl;
                    delete cc.tempData[i];
                } else if (i === "referrerInfo") {
                    if (promoteChannel == null) { //不会覆盖下一种情况的
                        let referrerInfo = cc.tempData[i];
                        if (referrerInfo != null) {
                            promoteChannel = referrerInfo.appId;

                            if (referrerInfo.extraData && referrerInfo.extraData.promoteChannel != null) {
                                promoteChannel = referrerInfo.extraData.promoteChannel;
                            }
                        }
                    }

                    delete cc.tempData[i];
                } else if (i === "promoteChannel") {
                    promoteChannel = cc.tempData[i]; //会覆盖上一种情况的
                    delete cc.tempData[i];
                }
            }
        }

        if (promoteChannel) {
            //来自于其他的推广渠道
            debug.info("来自推广渠道 " + promoteChannel);
            appContext.getUxManager().cache.promoteChannel = promoteChannel;
        } else {
            debug.info("无推广渠道");
        }
    },

    isCardCodeValid: function (code) {
        debug.log("CardCode " + code);
        if (code == null || code === "") {
            debug.log("!!isCardCodeValid no code!");
            return false;
        }

        let codeList = WechatAPI.getStorageSync(StorageKey.uniqueKey.WxShareCardEntryInfo, true);

        if (codeList == null || typeof codeList !== "object") {
            codeList = [];
            codeList.push(code);
            WechatAPI.setStorage(StorageKey.uniqueKey.WxShareCardEntryInfo, codeList);
            return true;
        }

        for (let key in codeList) {
            let value = codeList[key]
            if (value === code) {
                return false;
            }
        }

        codeList.push(code);
        debug.log("new codeList is ");
        debug.log(codeList);
        WechatAPI.setStorage(StorageKey.uniqueKey.WxShareCardEntryInfo, codeList);
        return true;
    },

    onAppStateUpdate: function (curState) {
        //debug.log("!!!!!!onAppStateUpdate " + curState);
        if (curState === this._currentAppState) {
            return;
        }

        this._currentAppState = curState;
        debug.info("切换状态app state change to: " + curState);

        // 根据当前游戏的状态，切换界面状态。
        let windowManager = appContext.getWindowManager();
        switch (curState) {
            case AppState.Null:
                windowManager.switchToLoadingWindow();
                break;

            case AppState.Playing:
            case AppState.BetweenRound:
                windowManager.switchToGameWindow();
                // this.startListenWxOnShowParam(); // 如果是断线重连进入游戏，有可能会跳过读取启动参数的流程
                break;

            default://AppState.Main:
                windowManager.switchToMainWindow();
                break;
        }
    },

    clearGameData: function () {
        this.clearLoginData();
        this.clearCurrentGameData();
    },

    clearCurrentGameData: function () {
        //debug.log("clearCurrentGameData");
    },

    clearLoginData: function () {
        //debug.log("clearLoginData");
    },

    backToMain: function () {
        appContext.getDataRepository().getContainer(DataKey.AppState).write(AppState.Main, cc.director.getTotalFrames());
    },

    toPlaying: function () {
        appContext.getDataRepository().getContainer(DataKey.AppState).write(AppState.Playing, cc.director.getTotalFrames());
    },

    toLoading: function () {
        appContext.getDataRepository().getContainer(DataKey.AppState).write(AppState.Null, cc.director.getTotalFrames());
    },
});