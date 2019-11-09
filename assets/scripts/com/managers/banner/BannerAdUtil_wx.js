cc.Class({
    extends: require("BannerAdUtil"),

    properties: {
        id: "adunit-b1bdc7dde4628f7f",
    },

    init: function() {
        debug.log('wx banner初始化');
    },

    isEnabled: function() {
        if (debug.extraSettings.nobanner) {
            return false;
        }
        return typeof wx.createBannerAd == "function";
    },

    customDestroy() {
        let self = WechatAPI.bannerAdUtil;
        if (self._ad) {
            try {
                if (typeof self._ad.offError == "function") {
                    self._ad.offError(self.onError);
                }
            } catch (e) {
                console.warn(e);
            }
            try {
                if (typeof self._ad.offLoad == "function") {
                    self._ad.offLoad(self.customShow);
                }
            } catch (e) {
                console.warn(e);
            }
            if (typeof self._ad.destroy == "function") {
                self._ad.destroy();
                console.warn("!wx banner destroy成功");
            } else {
                //如果广告被封，可能会这样
                console.warn("!wx banner not destroyed");
            }
        }
    },

    customHide() {
        this._ad && this._ad.hide();
    },

    /*
        //根据各式各样的对其需求
        //计算出理想的top和left的值
        //参数param：
        //必选参数 posH 水平相对位置比例 0为最左边 1为最右边
        //必选参数 posV 垂直相对位置比例 0为最上边 1为最下边
        //可选参数 paddingH 当posH为0或1时，距离比较近的边界的水平边距 默认2, 单位是游戏内像素不是实际像素宽度
        //可选参数 paddingV 当posV为0或1时，距离比较近的边界的垂直边距 默认2, 单位是游戏内像素不是实际像素宽度
        //可选参数 includeScreenFringeH 是否考虑横屏刘海屏 默认是
        //可选参数 includeScreenFringeV 是否考虑竖屏刘海屏 默认否
        //返回 包含left top的对象
        getTopLeft: function(param) {
            //TODO!!!!!
            let res = {
                left: 0,
                top: 0
            };

            let posH = param.posH;
            let posV = param.posV;

            posH = Math.min(Math.max(0, posH), 1);
            posV = Math.min(Math.max(0, posV), 1);

            let paddingH = 1; //默认
            let paddingV = 1; //默认
            if (param.paddingH != null) {
                paddingH = param.paddingH;
            }
            if (param.paddingV != null) {
                paddingV = param.paddingV;
            }

            let includeScreenFringeH = true; //默认
            let includeScreenFringeV = false; //默认

            if (param.includeScreenFringeH != null) {
                includeScreenFringeH = param.includeScreenFringeH;
            }
            if (param.includeScreenFringeV != null) {
                includeScreenFringeV = param.includeScreenFringeV;
            }

            let ratio = WechatAPI.deviceManager.getPixelRatio(); //0.33

            if (WechatAPI.deviceManager.hasScreenFringe()) {
                let lenScreenFringe = 35; //默认刘海屏的实际像素宽度，可以修改
                if (includeScreenFringeH) {
                    paddingH += lenScreenFringe;
                }

                if (includeScreenFringeV) {
                    paddingV += lenScreenFringe;
                }
            }

            let expectedWidth = 300; //预期的实际像素宽度  //banner 广告的宽度永远为300像素（最小）
            let expectedHeight = 100; //预期的实际像素高度 86.1像素（最小）
            let gameSize = WechatAPI.deviceManager.getCanvasSize(); //w640 h 1386

            //let leftMin = 0;
            let leftMax = gameSize.width * ratio - expectedWidth;

            //let topMin = 0;
            let topMax = gameSize.height * ratio - expectedHeight;

            res.left = leftMax * posH;
            res.top = topMax * posV;

            if (posH == 1) {
                res.left -= paddingH;
            } else if (posH == 0) {
                res.left += paddingH;
            }
            if (posV == 1) {
                res.top += paddingV;
            } else if (posV == 0) {
                res.top -= paddingV;
            }

            return res;
        },
    */

    getBottomMiddle: function(offsetTop = 0) {
        let ratio = WechatAPI.deviceManager.getPixelRatio(); //0.33

        let expectedWidth = 300; //预期的实际像素宽度  //banner 广告的宽度永远为300像素（最小）
        let expectedHeight = 100; //预期的实际像素高度 86.1像素（最小）  104.3
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

        let expectedWidth = 300; //预期的实际像素宽度  //banner 广告的宽度永远为300像素（最小）
        let expectedHeight = 90; //预期的实际像素高度 86.1像素（最小）
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
        let self = WechatAPI.bannerAdUtil;

        if (self._ad != null) {
            console.log("wx banner crt while has!!");
            self.customDestroy();
            return;
        }

        if (posParam == null) {
            posParam = self.getBottomMiddle();
            debug.log(posParam);
        }

        //console.warn("开始wx banner crt scheduleOnce");
        appContext.scheduleOnce(function() {
            //console.warn("开始执行scheduleOnce");
            if (!self.has()) {
                //console.warn("wx banner crt创建");
                self._ad = wx.createBannerAd({
                    adUnitId: self.id,
                    style: {
                        left: posParam.left,
                        top: posParam.top,
                        width: 300, //banner 广告的宽度永远为300像素（最小）
                    },
                    adIntervals: 40, // 自动刷新频率不能小于30秒
                })
                //console.log(self._ad);
                if (self._ad == null) {
                    console.log("wx banner crt fail");
                    return;
                } else {
                    console.log("wx banner crt ok");
                }

                self._ad.onError(self.onError);

                if (showOnLoad) {
                    //debug.log("crt showOnLoad");
                    self.customSetOnLoad();
                }
                // this._ad.onLoad(function() {
                //     debug.log('wx Banner广告加载成功');
                // })
                // this._ad.onResize(function(res) {
                //     debug.log("ad.onResize");
                //     debug.log(res);
                // });
            }
        }, 0);

    },

    customSetOnLoad() {
        let self = WechatAPI.bannerAdUtil;
        if (self._ad) {
            //console.log("c customSetOnLoad");
            try {
                if (typeof self._ad.offLoad == "function") {
                    self._ad.offLoad(self.customShow);
                }
            } catch (e) {
                console.warn(e);
            }
            if (self._ad.onLoad) {
                self._ad.onLoad(self.customShow);
            }
        }
    },

    customShow() {
        // console.log("c Show");
        let self = WechatAPI.bannerAdUtil;

        debug.log(self._ad);

        if (self._ad) {
            //console.log("!!show");
            self._ad.show();
        }
    },

    customShowOnLoad() {
        //console.log("c ShowOnLoad");
        this.customSetOnLoad();
    },

    onError(res) {
        //debug.log("wx banner Err");
        let self = WechatAPI.bannerAdUtil;

        debug.log(res);
        // try {
        //     WechatAPI.bannerAdUtil.destroy();
        // } catch (e) {
        //     debug.log(e);
        // }
    },
});