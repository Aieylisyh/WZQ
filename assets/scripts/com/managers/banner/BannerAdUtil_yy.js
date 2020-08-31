cc.Class({
    extends: require("BannerAdUtil"),

    properties: {
        _hasAd : false,
    },
    
    isEnabled: function () {
        return typeof wx.placeAds == "function";
    },

    customDestroy() {
        if(!this._hasAd){
            return;
        }

        let self = this;
        WanGameH5sdk.placeAds({
            method: 'hideBannerAd', // 方法名
            success: function(data) {
                // 成功回调
                console.log(data);
                console.log("yy banner ad hide success");
                self._hasAd = false;
            }, 
            fail: function(data) {
                // 失败回调
                console.log(data);
                console.log("yy banner ad hide fail");
            }
        });
    },

    customHide() {
        this.customDestroy();
    },

    customCreate() {
        if(this._hasAd){
            return;
        }
        
        debug.log("yy showBannerAd");
        let self = this;
        WanGameH5sdk.placeAds({
            method: 'showBannerAd', // 方法名
            success: function(data) {
                // 成功回调
                console.log(data);
                console.log("yy banner ad show success");
                self._hasAd = true;
            }, 
            fail: function(data) {
                // 失败回调
                console.log(data);
                console.log("yy banner ad show fail");
            }
        });
    },

    customShow() {
        this.customCreate();
    },
});