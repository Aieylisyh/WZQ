cc.Class({
    extends: require("VideoAdUtil"),

    properties: {
        id: "GDrz6HDQ",
    },

    isEnabled: function () {
        if (wx.getSystemInfoSync().platformVersionCode < 1064) {
            return false;
        }

        return true;
    },

    onBackFromVideoAd() {
        if (this._ad) {
            this._ad.offRewarded();
        }
    },

    customCreate() {
        let self = this;

        this._ad = wx.createRewardedVideoAd({
            adUnitId: self.id,
        });

        this._ad.onError(WechatAPI.videoAdUtil.onError);
        this._ad.onClose(function (res) {
            // debug.log("魅族貌似没有可能播放中途退出");
            debug.log("mz 点击关闭广告");
            self.onFinish();
            self.updateCb();
        });
        this._ad.onRewarded(function (res) {
            debug.log("mz onRewarded");
            self.onFinish();
            self.updateCb();
        });
        this._ad.onLoad(function () {
            debug.log("mz拉取视频广告ok");
            self.onCanPlay();
            if (self.playAfterLoad) {
                self.show();
            }
        });

        this.playAfterLoad = false;
        this._ad.load();
    },

    customLoad() {
        this.playAfterLoad = false;
        this._loaded = false;
        this._ad.load();
    },

    customShowOnLoad() {
        this.customLoad();
        this.playAfterLoad = true;
    },

    customShow() {
        let self = this;
        //Cannot read property 'then' of undefined
        self._ad.show();
        self.playAfterLoad = false;
        appContext.getSoundManager().stopBackgroundMusic();
    },
});