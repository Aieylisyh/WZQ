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
        appContext.getAnalyticManager().sendTT('createVad');
        this._ad = wx.createRewardedVideoAd({
            adUnitId: this.id,
        });

        let self = this;

        this._ad.onError(WechatAPI.videoAdUtil.onError);
        this._ad.onClose(function (res) {
            debug.log("tt vad finish");
            appContext.getAnalyticManager().sendTT('closeVad');
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if ((res && res.isEnded) || res === undefined) {
                debug.log("tt vad can have reward");
                self.onFinish();
            } else {
                debug.log("tt vad no reward");
                self.onCease();
            }

            self.updateCb();
        });
        // this._ad.onLoad(function () {
        //     console.log("-------- tt v load ok");
        //     self.onCanPlay();
        //     if (self.playAfterLoad) {
        //         self.show();
        //     }
        // });
        //this._ad.onLoad(() => {
        //    console.log("-------- tt v load simply ok");
        //});
        //this._ad.load();
        //this.customLoad();
    },

    customLoad() {
        debug.log("tt v load");
        //this.playAfterLoad = false;
        this._ad.load();
    },

    customShowOnLoad() {
        debug.log("tt v customShowOnLoad");

        this.customShow();
        //this.playAfterLoad = true;
        //this.customShow();
    },

    customShow() {
        debug.log("tt v customShow");
        let self = this;
        appContext.getAnalyticManager().sendTT('showVad');
        this._ad.show().then(() => {
            appContext.getAnalyticManager().sendTT('showVadOk');
            console.log("tt video ad ok");
        }).catch((err) => {
            console.log("tt video ad err", err);
            // 可以手动加载一次
            appContext.getAnalyticManager().sendTT('showVadErr',  { info: err + "" });
            self._ad.load().then(() => {
                appContext.getAnalyticManager().sendTT('loadVadOk');
                console.log("tt video ad reload ok");
                // 加载成功后需要再显示广告
                self._ad.show();
            });
        });

        // let self = this;

        // self._ad.show().then(() => {
        //     console.log("-------- tt v show ok");
        //     self.playAfterLoad = false;
        //     appContext.getSoundManager().stopBackgroundMusic();
        // }).catch(err => {
        //     self.onError(err);
        // });
    },
});