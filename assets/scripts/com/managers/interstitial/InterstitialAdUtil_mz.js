cc.Class({
    extends: require("InterstitialAdUtil"),

    properties: {
        id: "qbQElzIJ",
    },

    isEnabled: function () {
        if (typeof wx.createInsertAd != "function") {
            return false;
        }

        if (WechatAPI.systemInfo.platformVersionCode < 1064) {
            return false;
        }

        return true;
    },

    customDestroy() {
        this._ad && this._ad.destroy && this._ad.destroy();
    },

    customReload() {
        if (this._ad) {
            debug.log('mz int reload!');
            this._ad.load();
            this._ad.show();
        }else{
            debug.log('mz int new!');
            this.customCreate();
        }
    },

    customCreate() {
        let self = this;
        this._ad = wx.createInsertAd({
            adUnitId: self.id
        })

        this._ad.onError(this.onError);
        this._ad.onLoad(this.onLoad);
        // this._ad.onShow(function() {
        //     WechatAPI.interstitialAdUtil.reload();
        //     self._ad.load();
        // });

        this._ad.onClose(() => {
            debug.log('mz int closed!');
        });
        this._ad.show();
    },

    customShow() {
        this._ad && this._ad.show();
    },

    onLoad() {
        debug.log('mz int onloaded');
        // if (self._ad && self._ad.offLoad) {
        //     self._ad.offLoad(self.onLoad);
        // }
        //this._ad && this._ad.show();
    },

    customShowOnLoad() {
        console.log("mz int showonload");
        let self = WechatAPI.interstitialAdUtil;
        if (self._ad) {
            self._ad.offLoad(self.onLoadedDefault);
            self._ad.onLoad(function () {
                debug.log('mz customShowOnLoad onloadfunc');
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