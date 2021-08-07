cc.Class({
    extends: require("InterstitialAdUtil"),

    properties: {
        id: "adunit-29dd38c41995382f",
    },

    isEnabled: function() {
        return false;
    },

    customDestroy() {
        this._ad && this._ad.destroy && this._ad.destroy();
    },

    customCreate() {
        let self = this;

        this._ad = wx.createInterstitialAd({
            adUnitId: this.id
        })

        this._ad.onError(function(res) {
            debug.log("ad.onError");
            debug.log(res);
            //WechatAPI.interstitialAdUtil.reload();
        });

        this._ad.onLoad(this.onLoad);

        this._ad.onClose(function() {
            //WechatAPI.interstitialAdUtil.reload();
            if (self._ad.load) {
                self._ad.load();
            }
        });
    },

    onLoad() {
        let self = WechatAPI.interstitialAdUtil;
        debug.log('wx int loaded');

        if (self._ad && self._ad.offLoad) {
            self._ad.offLoad(self.onLoad);
        }
    },

    customShow() {
        let self = WechatAPI.interstitialAdUtil;
        if (self._ad) {
            self._ad.show().catch((err) => {
                console.error(err)
            });
        }
    },

    customShowOnLoad() {
        this.customShow();
    },
});