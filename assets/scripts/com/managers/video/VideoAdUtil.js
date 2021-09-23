
let DialogTypes = require("DialogTypes");

cc.Class({
    properties: {
        _ad: null,

        _cb: null,
    },

    isEnabled: function () {
        return false;
    },

    init() {
        debug.log('video 初始化');
        if (!this.isEnabled()) {
            return;
        }

        this.playAfterLoad = false;
        this.create();
        //this.customLoad();

        this._cb = {};
    },

    show() {
        console.log("show video ad");
        if (!this.isEnabled()) {
            //this.onFail();
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "不能播放视频广告");
            return;
        }

        this.customShow();
    },

    create: function () {
        if (!this.isEnabled()) {
            return;
        }
        
        if (this._ad) {
            console.log("already has video ad! abort create!");
            return;
        }

        this.customCreate();

        if (this._ad == null) {
            console.warn("!!video ad create null");
            return;
        }
    },

    updateCb: function (cb) {
        debug.log("updateCb");
        debug.log(cb);
        if (cb != null) {
            this.cb = cb;
        } else {
            this.cb = {};
        }
    },

    has: function () {
        return this._ad != null;
    },

    customLoad() { },
    customCreate() { },
    customShow() { },
    customShowOnLoad() { },

    onFail: function () {
        debug.log("onFail");
        this.cb && this.cb.failCb && this.cb.failCb.call(this.cb.caller);
    },

    onCanPlay: function () {
        debug.log("!!!!!onCanPlay!!");
        this.cb && this.cb.canPlayCb && this.cb.canPlayCb.call(this.cb.caller);
    },

    onCease: function () {
        this.cb && this.cb.ceaseCb && this.cb.ceaseCb.call(this.cb.caller);
        // appContext.getSoundManager,
        // this.customLoad();
        this.onBackFromVideoAd();
        //debug.log("onCease!!");
    },

    onFinish: function () {
        this.cb && this.cb.finishCb && this.cb.finishCb.call(this.cb.caller);
        this.customLoad();

        this.onBackFromVideoAd();
    },

    onError: function (err) {
        console.warn("!video ad onError", err);
        appContext.getAnalyticManager().sendTT('showVadErr',  { info: err + "" });

        WechatAPI.videoAdUtil.onFail();
        WechatAPI.videoAdUtil.updateCb();
    },

    getYXCallback() {
        let self = WechatAPI.videoAdUtil;
        return function (isEnd) {
            self.onBackFromVideoAd();
            if (isEnd) {
                console.log('video success');
                self.cb && self.cb.finishCb && self.cb.finishCb.call(self.cb.caller);
            } else {
                console.log('video failed');
                //self.cb && self.cb.failCb && self.cb.failCb.call(self.cb.caller);
                self.cb && self.cb.ceaseCb && self.cb.ceaseCb.call(self.cb.caller); //??
            }
        };
    },

    canPlay() {
        let self = WechatAPI.videoAdUtil;

        if (!self.isEnabled()) {
            return false;
        }

        if (WechatAPI.isYX) {
            debug.log("block video ad canPlay by yxsdk");
            return WechatAPI.YXSDK.getVideoFlag();
        }

        return true;
    },

    onBackFromVideoAd() {
        if (!appContext.getWindowManager().isInGameWindow()) {
            appContext.getSoundManager().startBackgroundMusic();
        }
    },

});