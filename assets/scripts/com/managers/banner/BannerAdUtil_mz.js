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
        this._ad = wx.createBannerAd({
            adUnitId: this.id,
            style: {
                left: 0,
                top: 0,
                width: wx.getSystemInfoSync().screenWidth,    // 设置banner需要的宽度，必须设置
                height: wx.getSystemInfoSync().screenWidth / 7    // 广告期望高度，在onResize里面可以根据广告的高度重新设置高度

            }
        });

        this._ad.onError(this.onError);
        this._ad.onResize((res) => {
            let screenHeight = wx.getSystemInfoSync().screenHeight;
            this.bannerAd.style.top = screenHeight - res.height; //确定左上角位置，为底部位置
            this.bannerAd.style.left = 0;
            this.bannerAd.style.width = res.width;
            this.bannerAd.style.height = res.height;
        });

        this.customShowOnLoad();
    },

    customShow() {
        this._ad && this._ad.show().then(function () {
            console.log('Banner show ok mz');
        });
    },

    customShowOnLoad() {
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
        console.log("mz banner Err");
        console.log(res);
    },
});