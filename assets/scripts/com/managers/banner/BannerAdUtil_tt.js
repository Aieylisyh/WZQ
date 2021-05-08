cc.Class({
    extends: require("BannerAdUtil"),

    properties: {
        id: "38lvc3bk3yx252gc0b",
    },

    isEnabled: function () {
        return false;
        if (debug.extraSettings.nobanner) {
            return false;
        }
        if (WechatAPI.systemInfo.appName == "Douyin") {
            return false;
        }
        
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
                debug.log("tt banner crt while has!!");
                this.customDestroy();
            }

            const { windowWidth, windowHeight } = wx.getSystemInfoSync();
            var targetBannerAdWidth = 200;

            debug.log("tt banner crt " + this.id);

            let style = {
                // width: targetBannerAdWidth,
                top: windowHeight - (targetBannerAdWidth / 16) * 9, // 根据系统约定尺寸计算出广告高度
                width: 200,
                left: windowWidth * 0.5 - 100,
                //Banner广告一般的比例为16:9，最小宽度是128（设备像素），最大宽度是208（设备像素）。
                //开发者可以在这之间自由指定广告宽度。广告组件会自动等比例缩放素材。
            };
            debug.log(style);

            this._ad = wx.createBannerAd({
                adUnitId: this.id,
                style: style,
            })
            if (this._ad == null) {
                console.log("tt banner crt fail");
                return;
            }

            this._ad.onError(this.onError);

            // if (showOnLoad) {
            //     this.customShowOnLoad();
            // }

            let self = this;
            self._ad.onResize(size => {
                console.log("banner广告onResize!!!!");
                console.log(size.width, size.height);
                self._ad.style.top = windowHeight - size.height;
                self._ad.style.left = (windowWidth - size.width) / 2;
            })

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