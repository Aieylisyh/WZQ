
let DialogTypes = require("DialogTypes");

cc.Class({
    extends: require("BaseDialog"),

    properties: {
        numLabel: cc.Label,

        artNumLabel: cc.Label,
    },

    show: function () {
        //如果有0张也显示这个，这个对话框10秒后消失
        this.fadeInBackground();

        let num = appContext.getUxManager().gameInfo.grabFirstCardCount;
        this.numLabel.string = "有先手卡" + num + "张";
        this.artNumLabel.string = num;

        this.timer = 8;
    },

    update(dt) {
        if (this.timer) {
            this.timer -= dt;
            if (this.timer < 0) {
                appContext.getGameManager().game.selfPlayer.grabFirst(false);
                this.hide();
            }
        }
    },

    onClickBtnUse: function () {
        appContext.getSoundManager().playBtn();
        if (appContext.getUxManager().useGrabFirstCard()) {
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "您使用了先手卡");
            appContext.getGameManager().game.selfPlayer.grabFirst(true);
        } else {
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "先手卡不足\n可以从【商店】中购买");
            appContext.getGameManager().game.selfPlayer.grabFirst(false);
        }

        this.hide();
    },


    onClickBtnCancel: function () {
        appContext.getSoundManager().playBtn();
        appContext.getGameManager().game.selfPlayer.grabFirst(false);
        this.hide();
    },
});