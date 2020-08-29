cc.Class({
    extends: require("BannerAdUtil"),

    properties: {

    },

    isEnabled: function () {
        return typeof wx.createBannerAd == "function";
    },

    customDestroy() {
        if (this._ad) {
            if (typeof this._ad.offError == "function") {
                this._ad.offError(this.onError);
            }
            if (this._ad.offLoad) {
                this._ad.offLoad(this.customShow);
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
        this._ad && this._ad.hide();
    },

    customCreate() {
        try {
            debug.log("banner 广告customCreate");
            if (this._ad != null) {
                debug.log("uc banner crt while has!!");
                this.customDestroy();
            }

            let windowWidth = WechatAPI.systemInfo.windowWidth;
            let windowHeight = WechatAPI.systemInfo.windowHeight;
            let style = {
                gravity: 7,
                left: 0,
                top: 0,
                bottom: 0,
                right: 0,
                width: windowWidth * 0.5,
                height: windowWidth * 0.3,
            };

            this._ad = wx.createBannerAd({
                style: style,
            })
            if (this._ad == null) {
                console.log("uc banner crt fail");
                return;
            }

            this._ad.show();
        } catch (e) {
            debug.log(e);
        }
    },

    customShow() {
        debug.log("注意这里应该是显示bannerad  c Show");
        if (this._ad) {
            debug.log("c has");
            this._ad.show();
        }
    },

    customShowOnLoad() {
        if (this._ad) {
            debug.log("c ShowOnLoad");
            if (this._ad.offLoad) {
                this._ad.offLoad(this.customShow);
            }
            if (this._ad.onLoad) {
                this._ad.onLoad(this.customShow);
            }
        }
    },

    onError(res) {
        console.log("tt banner Err");
        console.log(res);
        // try {
        //     WechatAPI.bannerAdUtil.destroy();
        // } catch (e) {
        //     debug.log(e);
        // }
    },
});