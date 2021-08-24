cc.Class({
    extends: require("VideoAdUtil"),

    properties: {
        id: "2300001541_01",
    },

    isEnabled: function () {
        return typeof ks.createRewardedVideoAd == "function";
        //?kwaigame
    },

    customCreate() {
        debug.log("ks createRewardedVideoAd");
        this._ad = ks.createRewardedVideoAd({
            adUnitId: this.id,
        });

        let self = this;
        this._ad.onClose(function (res) {
            debug.log("ks v ad end");
            debug.log(res);
            if (res && res.isEnded) {
                debug.log("can have reward");
                self.onFinish();
            }
            else {
                debug.log("no reward");
                self.onCease();
            }

            self.updateCb();

        });
        this._ad.onError(function (res) {
            debug.log("ks ad onError");
            debug.log(res);

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