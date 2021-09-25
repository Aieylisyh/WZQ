cc.Class({
    extends: require("BannerAdUtil"),

    properties: {
        id: "7a292fa0ea59492ab117f5efa6e8d73a",
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
                console.warn("!vivo banner destroy");
                this._ad.destroy();
            } else {
                //如果广告被封，可能会这样
                console.warn("!vivo banner not destroy");
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

        debug.log("crt banner vivo");
        this._ad = qg.createBannerAd({
            posId: this.id,
            style: {}
            //不设置style默认在顶部显示，布局起始位置为屏幕左上角
            //style内无需设置任何字段，banner会在屏幕底部居中显示，style具体属性后续版本会开放
        });

        this._ad.onError(this.onError);

        if (showOnLoad) {
            if (this._ad.onLoad) {
                this._ad.onLoad(WechatAPI.bannerAdUtil.show);
            }
        }
        // this._ad.onLoad(function (res) {
        //     debug.log('Banner广告加载成功');
        //     debug.log(res);
        // });
    },

    customShow() {
        if (WechatAPI.isYX) {
            debug.log("block banner ad customShow by yxsdk");
            WechatAPI.YXSDK.showBanner();
            return;
        }

        this._ad && this._ad.show().then(function() {
            console.log('Banner 广告组件展示成功');
        });
    },

    customShowOnLoad() {
        if (WechatAPI.isYX) {
            debug.log("block banner ad customShowOnLoad by yxsdk");
            WechatAPI.YXSDK.showBanner();
            return;
        }

        if (this._ad) {
            console.log("c ShowOnLoad");
            if (this._ad.offLoad) {
                this._ad.offLoad(this.customShow);
            }
            if (this._ad.onLoad) {
                this._ad.onLoad(this.customShow);
            }
        }
    },

    onError(res) {
        console.log("vivo banner Err");
        console.log(res);
        // try {
        //     WechatAPI.bannerAdUtil.destroy();
        // } catch (e) {
        //     debug.log(e);
        // }
    },
});