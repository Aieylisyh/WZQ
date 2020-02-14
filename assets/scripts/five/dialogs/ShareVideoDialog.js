cc.Class({
    extends: require("BaseDialog"),

    properties: {
        numLabel: cc.Label,
    },

    show: function () {
        this.fadeInBackground();
        this.fastShowAnim();

        this.goldNum = Math.floor(Math.random() * 40 + 120);
        this.numLabel.string = "金币 " + this.goldNum;
    },

    onClickClose: function () {
        //WechatAPI.cache.gameRecordHideShare = true;

        this.hide();
    },

    onClickBtnConfirm: function () {
        let reward = [{
            type: "Gold",
            count: this.goldNum,
        }];

        WechatAPI.shareUtil.setShareVideoCB(reward);
        WechatAPI.cache.gameRecordHideShare = false;
        WechatAPI.recordGameEnd();

        appContext.scheduleOnce(function () {
            WechatAPI.assignRecordListeners();
        }, 3);

        this.hide();
    },
});