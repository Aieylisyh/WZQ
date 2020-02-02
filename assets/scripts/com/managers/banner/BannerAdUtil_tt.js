cc.Class({
    extends: require("BannerAdUtil"),

    properties: {
        id: "38lvc3bk3yx252gc0b",
    },

    isEnabled: function() {
        if (debug.extraSettings.nobanner) {
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

    getBottomMiddle: function(offsetTop = 0) {
        let ratio = WechatAPI.deviceManager.getPixelRatio(); //0.33

        let expectedWidth = 192; //https://developer.toutiao.com/dev/minigame/ugjM3EjL4IzNx4COycTM
        let expectedHeight = 108;
        let gameSize = WechatAPI.deviceManager.getCanvasSize(); //w640 h 1386

        //let leftMin = 0;
        let leftMax = gameSize.width * ratio - expectedWidth;

        //let topMin = 0;
        let topMax = gameSize.height * ratio - expectedHeight;

        return {
            left: leftMax * 0.5,
            top: topMax + offsetTop
        };
    },

    getCenterOffset: function(x = 0, y = 0) {
        let ratio = WechatAPI.deviceManager.getPixelRatio(); //0.33

        let expectedWidth = 192; //https://developer.toutiao.com/dev/minigame/ugjM3EjL4IzNx4COycTM
        let expectedHeight = 108;
        let gameSize = WechatAPI.deviceManager.getCanvasSize(); //w640 h 1386

        //let leftMin = 0;
        let leftMax = gameSize.width * ratio - expectedWidth;

        //let topMin = 0;
        let topMax = gameSize.height * ratio - expectedHeight;

        let offsetX = x * ratio;
        let offsetY = y * ratio;

        return {
            left: leftMax * 0.5 + offsetX,
            top: topMax * 0.5 + offsetY
        };
    },

    customCreate(posParam, showOnLoad = false) {
        try {
            if (this._ad != null) {
                debug.log("tt banner crt while has!!");
                this.customDestroy();
            }

            if (posParam == null) {
                posParam = this.getBottomMiddle();
                debug.log(posParam);
            }

            debug.log("tt banner crt " + this.id);
            this._ad = wx.createBannerAd({
                adUnitId: this.id,
                style: {
                    left: posParam.left,
                    top: posParam.top,
                    width: 192,
                    //Banner广告一般的比例为16:9，最小宽度是128（设备像素），最大宽度是208（设备像素）。
                    //开发者可以在这之间自由指定广告宽度。广告组件会自动等比例缩放素材。
                },
                //adIntervals: 31, // 自动刷新频率不能小于30秒
            })
            if (this._ad == null) {
                console.log("tt banner crt fail");
                return;
            }

            this._ad.onError(this.onError);

            if (showOnLoad) {
               this.customShowOnLoad();
            }
            // this._ad.onLoad(function() {
            //     debug.log('wx Banner广告加载成功');
            // })

            let gameSize = WechatAPI.deviceManager.getCanvasSize(); //w640 h 1386
            let ratio = WechatAPI.deviceManager.getPixelRatio(); //0.33
            let self = this;
            this._ad.onResize(res => {
                self._ad.style.top = gameSize.height * ratio - res.height
                self._ad.style.left = (gameSize.width * ratio - res.width) / 2 // 水平居中
            })

            // this._ad.onResize(function(res) {
            //     debug.log("ad.onResize");
            //     debug.log(res);
            // });
        } catch (e) {
            debug.log(e);
        }
    },

    customShow() {
        debug.log("c Show");
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