cc.Class({
    extends: require("InterstitialAdUtil"),

    properties: {
        id: "adunit-29dd38c41995382f",
    },

    isEnabled: function() {
        if (!debug.extraSettings.hasIntAd) {
            return false;
        }

        return typeof wx.createInterstitialAd == "function";
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
        self._loaded = true;

        if (self._ad && self._ad.offLoad) {
            self._ad.offLoad(self.onLoad);
        }
    },

    customShow() {
        let self = WechatAPI.interstitialAdUtil;
        if (self._ad) {
            if (self._loaded) {
                self._ad.show().catch((err) => {
                    console.error(err)
                });
            } else {
                if (self._ad.load) {
                    self._ad.load();
                }
            }
        }
    },
    customShowOnLoad() {
        this.customShow();
    },
});