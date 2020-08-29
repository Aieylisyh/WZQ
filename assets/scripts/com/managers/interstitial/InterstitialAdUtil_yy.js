cc.Class({
    extends: require("InterstitialAdUtil"),

    properties: {
    },
    
    isEnabled: function () {
        return typeof wx.placeAds == "function";
    },

    customDestroy() {
    },

    customCreate() {
        WanGameH5sdk.placeAds({
            method: 'showImageInteractionAd', // 方法名 //showVideoInteractionAd
            success: function(data) {
                // 成功回调
                console.log(data);
                console.log("yy int ad show success");
            }, 
            fail: function(data) {
                // 失败回调
                console.log(data);
                console.log("yy int ad show fail");
            }
        });
    },

    customShow() {
        this.customCreate();
    },

    customShowOnLoad() {
        this.customShow();
    },
});