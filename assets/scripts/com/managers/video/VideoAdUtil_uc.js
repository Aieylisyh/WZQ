cc.Class({
    extends: require("VideoAdUtil"),

    properties: {

    },

    isEnabled: function () {
        if (!WechatAPI.isEnabled()) {
            return false;
        }

        return typeof wx.createRewardVideoAd == "function";
    },

    customCreate() {
        debug.log("Create视频广告");
        this._ad = wx.createRewardVideoAd();

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
            debug.log("拉取视频广告ok");
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
        this._ad.load();
    },

    customShowOnLoad() {
        this.customLoad();
        this.playAfterLoad = true;
    },

    customShow() {
        let self = this;

        self._ad.show().then(() => {
            debug.log("video ad show");
            self.playAfterLoad = false;
            appContext.getSoundManager().stopBackgroundMusic();
        }).catch(err => {
            self.onError(err);
        });
    },
});