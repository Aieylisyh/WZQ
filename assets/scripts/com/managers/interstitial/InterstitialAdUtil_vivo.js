cc.Class({
    extends: require("InterstitialAdUtil"),

    properties: {
        id: "3b81de2f676c4be59a3171bb9df1425c",
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
        debug.log("crt int vivo");
        this._ad = qg.createInterstitialAd({
            posId: this.id
        });

        this._ad.onError(function(res) {
            debug.log("vivo int ad Err");
            debug.log(res);
            //WechatAPI.interstitialAdUtil.reload();
        });

        this._ad.onLoad(this.onLoad);

        this._ad.onClose(function() {
            //WechatAPI.interstitialAdUtil.reload();
            self._ad.load();
        });
    },

    onLoad() {
        if (WechatAPI.isYX) {
            debug.log("block int ad onLoad by yxsdk");
            return;
        }

        let self = WechatAPI.interstitialAdUtil;
        debug.log('vivo int loaded');
        self._loaded = true;

        if (self._ad && self._ad.offLoad) {
            self._ad.offLoad(self.onLoad);
        }
    },

    customShow() {
        if (WechatAPI.isYX) {
            debug.log("block int ad customShow by yxsdk");
            WechatAPI.YXSDK.showInters();
            return;
        }

        this._ad && this._ad.show().catch((err) => {
            console.error(err)
        });

        let self = WechatAPI.interstitialAdUtil;
        if (self._ad) {
            if (self._loaded) {
                self._ad.show().catch((err) => {
                    console.error(err)
                });
            } else {
                self._ad.load();
            }
        }
    },

    customShowOnLoad() {
        this.customShow();
    },
});