cc.Class({
    extends: require("VideoAdUtil"),

    properties: {
        id: "3d1287dc8e67494b9ca3e85a89a8c512",
    },

    isEnabled: function() {
        if (qg.getSystemInfoSync().platformVersionCode < 1041) {
            return false;
        }

        return true;
    },

    customCreate() {
        if (WechatAPI.isYX) {
            debug.log("block video ad customCreate by yxsdk");
            return;
        }

        let self = this;

        this._ad = qg.createRewardedVideoAd({
            posId: self.id,
        });

        this._ad.onError(WechatAPI.videoAdUtil.onError);
        this._ad.onClose(function(res) {
            debug.log("点击关闭广告");
            if (res && res.isEnded) {
                debug.log("正常播放结束");
                self.onFinish();
            } else {
                debug.log("播放中途退出");
                self.onCease();
            }

            self.updateCb();
        });
        this._ad.onLoad(function() {
            debug.log("拉取视频广告ok");
            self.onCanPlay();
            if (self.playAfterLoad) {
                self.show();
            }
        });
    },

    customLoad() {
        if (WechatAPI.isYX) {
            debug.log("block video ad customLoad by yxsdk");
            return;
        }

        this.playAfterLoad = false;
        this._loaded = false;
        this._ad.load();
    },

    customShowOnLoad() {
        if (WechatAPI.isYX) {
            WechatAPI.YXSDK.showVideo(this.getYXCallback());
            appContext.getSoundManager().stopBackgroundMusic();
            debug.log("block video ad customShowOnLoad by yxsdk");
            return;
        }

        this.customLoad();
        this.playAfterLoad = true;
    },

    customShow() {
        if (WechatAPI.isYX) {
            WechatAPI.YXSDK.showVideo(this.getYXCallback());
            appContext.getSoundManager().stopBackgroundMusic();
            debug.log("block video ad customShow by yxsdk");
            return;
        }

        let self = this;

        this._ad.show().then(() => {
            debug.log("video ad show");
            self.playAfterLoad = false;
            appContext.getSoundManager().stopBackgroundMusic();
        }).catch(err => {
            self.onError(err);
        });
    },
});