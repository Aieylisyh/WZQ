
cc.Class({
    extends: require("BannerAdUtil"),

    properties: {
        id: "QBs3laDK",
    },

    isEnabled: function () {
        if (debug.extraSettings.nobanner) {
            return false;
        }

        if (wx.getSystemInfoSync().platformVersionCode < 1064) {
            return false;
        }

        return true;
    },

    customDestroy() {
        if (this._ad) {
            if (typeof this._ad.offError == "function") {
                this._ad.offError(this.onError);
            }

            if (typeof this._ad.destroy == "function") {
                console.warn("!mz banner destroy");
                this._ad.destroy();
            } else {
                console.warn("!mz banner not destroy");
            }
        }
    },

    customHide() {
        this._ad && this._ad.hide && this._ad.hide();
    },

    customCreate() {
        debug.log("crt banner mz");
        let h = WechatAPI.systemInfo.windowWidth / 7;
        this._ad = wx.createBannerAd({
            adUnitId: this.id,
            style: {
                left: 0,
                top: WechatAPI.systemInfo.windowHeight - h,
                width: WechatAPI.systemInfo.windowWidth,    // 设置banner需要的宽度，必须设置
                height: h   // 广告期望高度，在onResize里面可以根据广告的高度重新设置高度

            }
        });

        this._ad.onError(this.onError);
        this._ad.onResize((res) => {
            // debug.log("onResize banner mz");
            // debug.log(res);
            this._ad.style.top = WechatAPI.systemInfo.windowHeight - res.height; //确定左上角位置，为底部位置
            this._ad.style.left = 0;
            this._ad.style.width = res.width;
            this._ad.style.height = res.height;
            this.customShowOnLoad();
        });
    },

    customShow() {
        this._ad && this._ad.show()
    },

    customShowOnLoad() {
        this.customShow()
    },

    onError(res) {
        console.log("mz banner Err");
        console.log(res);
    },
});