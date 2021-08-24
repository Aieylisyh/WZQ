cc.Class({
    extends: require("VideoAdUtil"),

    properties: {
        id: "5824e7h0e6ef55rm57",
    },

    isEnabled: function () {
        return typeof kwaigame.createRewardedVideoAd == "function";
    },

    customCreate() {
        debug.log("ks createRewardedVideoAd");
        this._ad = kwaigame.createRewardedVideoAd({
            adUnitId: this.id,
        });

        let self = this;
        this._ad.onClose(function (res) {
            debug.log("播放中途退出");
            self.onCease();
            self.updateCb();

        });
        this._ad.onReward(function (res) {
            debug.log("正常播放结束");
            self.onFinish();
            self.updateCb();

        });
    },

    customLoad() {
    },

    customShowOnLoad() {
    },

    customShow() {
        debug.log("ks v customShow");
        let self = this;
        this._ad.show({
            success: () => {
                console.log("ks video ad ok");
            },
            fail: (result) => {
                console.log("ks video ad fail " + JSON.stringify(result));
            }
        })
    },
});