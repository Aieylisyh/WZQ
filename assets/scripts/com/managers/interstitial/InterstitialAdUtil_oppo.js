cc.Class({
    extends: require("InterstitialAdUtil"),

    properties: {
        id: "108236",
    },

    isEnabled: function() {
        if (!debug.extraSettings.hasIntAd) {
            return false;
        }

        if (qg.getSystemInfoSync().platformVersionCode < 1031) {
            return false;
        }
        return true;
    },

    customDestroy() {
        if (WechatAPI.isYX) {
            debug.log("block int ad customDestroy by yxsdk");
            return;
        }

        this._ad && this._ad.destroy && this._ad.destroy();
    },

    customCreate() {
        if (WechatAPI.isYX) {
            debug.log("block int ad customCreate by yxsdk");
            return;
        }

        let self = this;

        this._ad = wx.createInsertAd({
            posId: self.id
        })

        this._ad.onError(this.onError);
        this._ad.onLoad(this.onLoad);
        this._ad.onShow(function() {
            //  WechatAPI.interstitialAdUtil.reload();
            self._ad.load();
        });
    },

    customShow() {
        if (WechatAPI.isYX) {
            debug.log("block int ad customShow by yxsdk");
            WechatAPI.YXSDK.showInters();
            return;
        }

        this._ad && this._ad.show();
    },

    onLoad() {
        if (WechatAPI.isYX) {
            debug.log("block int ad onLoad by yxsdk");
            return;
        }

        let self = WechatAPI.interstitialAdUtil;
        debug.log('oppo int loaded');
        self._loaded = true;

        if (self._ad && self._ad.offLoad) {
            self._ad.offLoad(self.onLoad);
        }
    },

    customShowOnLoad() {
        if (WechatAPI.isYX) {
            debug.log("block int ad customShowOnLoad by yxsdk");
            WechatAPI.YXSDK.showInters();
            return;
        }

        console.log("oppo int showonload");
        let self = WechatAPI.interstitialAdUtil;
        if (self._ad) {
            self._ad.offLoad(self.onLoadedDefault);
            self._ad.onLoad(function() {
                debug.log('oppo customShowOnLoad onloadfunc');
                self._loaded = true;
                self._ad.show();
            });
        }
    },

    onError(res) {
        debug.log("oppo int onError");
        debug.log(res);
        let self = WechatAPI.interstitialAdUtil;
        if (self._ad && self._ad.offError) {
            self._ad.offError(self.onError);
            debug.log("oppo int offError");
        }
        //WechatAPI.interstitialAdUtil.reload();
    },
});