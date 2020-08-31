cc.Class({
    extends: require("VideoAdUtil"),

    properties: {
    },

    isEnabled: function () {
        return typeof wx.placeAds == "function";
    },


    customCreate() {
       
    },

    customLoad() {
    },

    customShow() {
        debug.log("yy showRewardVideoAd");
        let self = this;
        WanGameH5sdk.placeAds({
            method: 'showRewardVideoAd', // 方法名
            params: {
                orientation: 0, // 视频方向，0竖屏，1横屏，没传默认为竖屏
            },
            success: function (data) {
                // 成功回调
                console.log(data);
                console.log("yy video ad show success");
                if (data.code == 0) {
                    debug.log("正常播放结束");
                    self.onFinish();
                } else {
                    debug.log("播放中途退出");
                    self.onCease();
                }
                self.updateCb();
            },
            fail: function (data) {
                // 失败回调
                console.log(data);
                console.log("yy video ad show fail");
                self.onError();
            }
        });
    },
});