cc.Class({
    extends: require("BannerAdUtil"),

    properties: {
        id: "108235",
    },

    isEnabled: function() {
        if (debug.extraSettings.nobanner) {
            return false;
        }
        if (qg.getSystemInfoSync().platformVersionCode < 1031) {
            return false;
        }

        return true;
    },

    customDestroy() {
        if (WechatAPI.isYX) {
            debug.log("block banner ad customDestroy by yxsdk");
            WechatAPI.YXSDK.hideBanner();
            return;
        }

        if (this._ad) {
            if (typeof this._ad.offError == "function") {
                this._ad.offError(this.onError);
            }

            if (typeof this._ad.destroy == "function") {
                console.warn("!wx banner destroy");
                this._ad.destroy();
            } else {
                //如果广告被封，可能会这样
                console.warn("!wx banner not destroy");
            }
        }
    },

    customHide() {
        if (WechatAPI.isYX) {
            debug.log("block banner ad customHide by yxsdk");
            WechatAPI.YXSDK.hideBanner();
            return;
        }

        this._ad && this._ad.hide && this._ad.hide();
    },

    customCreate(posParam, showOnLoad = false) {
        if (WechatAPI.isYX) {
            debug.log("block banner ad customCreate by yxsdk");
            return;
        }

        try {
            this._ad = qg.createBannerAd({
                posId: this.id,
            });

            this._ad.onError(this.onError);

            if (showOnLoad) {
                this._ad.show();
            }
            // this._ad.onShow(function() {
            //     debug.log("oppo banner show");
            // });

            // this._ad.onHide(function() {
            //     debug.log("oppo banner onHide");
            // });

        } catch (e) {
            debug.log(e);
        }
    },

    customShow() {
        if (WechatAPI.isYX) {
            debug.log("block banner ad customShow by yxsdk");
            WechatAPI.YXSDK.showBanner();
            return;
        }

        debug.log("!oppo show banner");
        this._ad && this._ad.show();
    },

    customShowOnLoad() {
        if (WechatAPI.isYX) {
            debug.log("block banner ad customShowOnLoad by yxsdk");
            WechatAPI.YXSDK.showBanner();
            return;
        }


        if (this._ad) {
            console.log("c ShowOnLoad");
            if (this._ad.offLoad && this._ad.onLoad) {
                this._ad.offLoad(this.customShow);
                this._ad.onLoad(this.customShow);
            } else {
                this._ad.show();
            }
        }
    },

    onError(res) {
        console.log("oppo banner Err");
        console.log(res);
        // try {
        //     WechatAPI.bannerAdUtil.destroy();
        // } catch (e) {
        //     debug.log(e);
        // }
    },
});