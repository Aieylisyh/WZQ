cc.Class({
    extends: require("InterstitialAdUtil"),

    properties: {
        id: "qbQElzIJ",
    },

    isEnabled: function() {
        if (!debug.extraSettings.hasIntAd) {
            return false;
        }

        if (wx.getSystemInfoSync().platformVersionCode < 1064) {
            return false;
        }
        return true;
    },

    customDestroy() {
        this._ad && this._ad.destroy && this._ad.destroy();
    },

    customCreate() {
        let self = this;
        this._ad = wx.createInsertAd({
            adUnitId: self.id
        })

        this._ad.onError(this.onError);
        this._ad.onLoad(this.onLoad);
        this._ad.onShow(function() {
            //  WechatAPI.interstitialAdUtil.reload();
            self._ad.load();
        });

        this._ad.onClose(()=>{
            debug.log('mz int closed!');
        });
    },

    customShow() {
        this._ad && this._ad.show();
    },

    onLoad() {
        let self = WechatAPI.interstitialAdUtil;
        debug.log('mz int loaded');
        self._loaded = true;

        if (self._ad && self._ad.offLoad) {
            self._ad.offLoad(self.onLoad);
        }
    },

    customShowOnLoad() {
        console.log("mz int showonload");
        let self = WechatAPI.interstitialAdUtil;
        if (self._ad) {
            self._ad.offLoad(self.onLoadedDefault);
            self._ad.onLoad(function() {
                debug.log('mz customShowOnLoad onloadfunc');
                self._loaded = true;
                self._ad.show();
            });
        }
    },

    onError(res) {
        debug.log("mz int onError");
        debug.log(res);
        let self = WechatAPI.interstitialAdUtil;
        if (self._ad && self._ad.offError) {
            self._ad.offError(self.onError);
            debug.log("mz int offError");
        }
        //WechatAPI.interstitialAdUtil.reload();
    },
});