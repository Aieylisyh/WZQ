cc.Class({
    extends: require("BaseDialog"),

    properties: {
        numLabel: cc.Label,
    },

    show: function () {
        this.fadeInBackground();
        this.fastShowAnim();

        this.goldNum = Math.floor(Math.random() * 40 + 100);//60~180(120)
        this.numLabel.string = "金币 " + this.goldNum;
    },

    onClickClose: function () {
        this.hide();
    },

    onClickBtnConfirm: function () {
        let reward = [{
            type: "Gold",
            count: this.goldNum,
        }];

        WechatAPI.shareUtil.setShareVideoCB(reward);
        WechatAPI.ttRecorder.willShare = true;
        WechatAPI.ttRecorder.stop();
        this.hide();
    },
});