cc.Class({
    extends: require("VideoAdUtil"),

    properties: {
        id: "5824e7h0e6ef55rm57",
    },

    isEnabled: function () {
        return typeof wx.createRewardedVideoAd == "function";
    },

    customCreate() {
        debug.log("Create视频广告");
        this._ad = wx.createRewardedVideoAd({
            adUnitId: this.id,
        });

        let self = this;

        this._ad.onError(WechatAPI.videoAdUtil.onError);
        this._ad.onClose(function (res) {
            debug.log("点击关闭广告");
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if ((res && res.isEnded) || res === undefined) {
                debug.log("正常播放结束");
                self.onFinish();
            } else {
                debug.log("播放中途退出");
                self.onCease();
            }

            self.updateCb();

        });
        this._ad.onLoad(function () {
            console.log("-------- tt v load ok");
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
        debug.log("ttv customShowOnLoad");

        this.customLoad();
        this.playAfterLoad = true;

        //this.customShow();
    },

    customShow() {
        debug.log("tt v customShow");

        let self = this;

        self._ad.show().then(() => {
            console.log("-------- tt v show ok");
            self.playAfterLoad = false;
            appContext.getSoundManager().stopBackgroundMusic();
        }).catch(err => {
            self.onError(err);
        });
    },
});