
let DialogTypes = require("DialogTypes");
let Item = require("Item");

cc.Class({
    extends: require("BaseDialog"),

    properties: {
        grabFirstCardNumLabel: cc.Label,

        keepGradeCardNumLabel: cc.Label,

        randomCardNumLabel: cc.Label,

        randomGoldNumLabel: cc.Label,

        goldNumLabel: cc.Label,
    },

    show: function () {
        this.fadeInBackground();
        this.fastShowAnim();
        this.refresh();
    },

    refresh() {
        this.goldNumLabel.string = appContext.getUxManager().gameInfo.gold;

        this.grabFirstCardNumLabel.string = appContext.getUxManager().gameInfo.grabFirstCardCount;
        this.keepGradeCardNumLabel.string = appContext.getUxManager().gameInfo.keepGradeCardCount;
        this.randomCardNumLabel.string = appContext.getUxManager().getAndRefineRandomCardUsedCount();
        this.randomGoldNumLabel.string = appContext.getUxManager().getAndRefineRandomGoldUsedCount();
    },

    onClickBtnGrabFirstCard: function () {
        if (appContext.getUxManager().useGold(Item.GrabFirstCard.price)) {
            this.giveReward([{ type: "GrabFirstCard", count: 1 }]);
            this.refresh();
        } else {
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "金币不足");
        }
    },

    onClickBtnKeepGradeCard: function () {
        if (appContext.getUxManager().useGold(Item.KeepGradeCard.price)) {
            this.giveReward([{ type: "KeepGradeCard", count: 1 }]);
            this.refresh();
        } else {
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "金币不足");
        }
    },

    onClickBtnRandomCard: function () {
        if (appContext.getUxManager().canUseRandomCard()) {
            this.watchAdReward(function () {
                if (Math.random() < 0.5) {
                    this.giveReward([{ type: "GrabFirstCard", count: 1 }], false);
                } else {
                    this.giveReward([{ type: "KeepGradeCard", count: 1 }], false);
                }
                appContext.getUxManager().useRandomCard();
                this.refresh();
            }, this);
        } else {
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "今日次数已达上限");
        }
    },

    onClickBtnRandomGold: function () {
        if (appContext.getUxManager().canUseRandomGold()) {
            this.watchAdReward(function () {
                let count = Math.floor(Math.random() * 41 + 80);
                this.giveReward([{ type: "Gold", count: count }], false);
                appContext.getUxManager().useRandomGold();
                this.refresh();
            }, this);
        } else {
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "今日次数已达上限");
        }
    },

    watchAdReward(funcSuc, caller) {
        //todo
        funcSuc.call(caller);
    },

    giveReward(reward, isBuyOrLottery = true) {
        appContext.getUxManager().rewardItems(reward);
        let text = Item.getTextByItem(reward);
        let text1 = isBuyOrLottery ? "购买" : "领取";
        appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, text1 + "成功\n获得:" + text);
    },
});