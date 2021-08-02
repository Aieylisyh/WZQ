
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

    showNotEnoughGold() {
        let canLure = false;
        if (appContext.getUxManager().canUseRandomGold()) {
            let canWatchAd = WechatAPI.videoAdUtil && WechatAPI.videoAdUtil.canPlay();
            if (canWatchAd) {
                if (!debug.extraSettings.global) {
                    canLure = true;
                }
            }
        }

        if (canLure) {
            let info = {
                content: "金币不足\n看个广告即可获得大量金币",
                adIcon: true,
                //  content: "金币不足\n有未使用的免费金币次数\n看个广告即可获得大量金币",
                btn1: {
                    name: "好 的",
                    clickFunction: function () {
                        this.startwatchAdReward();
                    },
                    clickFunctionCaller: this,
                },
            };

            appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, info);
            return;
        }

        appContext.getDialogManager().showDialog(DialogTypes.Toast, "金币不足");
    },

    onClickBtnGrabFirstCard: function () {
        if (appContext.getUxManager().useGold(Item.GrabFirstCard.price)) {
            appContext.getSoundManager().playUseGold();
            this.giveReward([{ type: "GrabFirstCard", count: 1 }]);
            this.refresh();
        } else {
            appContext.getSoundManager().playBtn();
            this.showNotEnoughGold();
        }
    },

    onClickBtnKeepGradeCard: function () {
        if (appContext.getUxManager().useGold(Item.KeepGradeCard.price)) {
            appContext.getSoundManager().playUseGold();
            this.giveReward([{ type: "KeepGradeCard", count: 1 }]);
            this.refresh();
        } else {
            appContext.getSoundManager().playBtn();
            this.showNotEnoughGold();
        }
    },

    onClickBtnRandomCard: function () {
        if (appContext.getUxManager().canUseRandomCard()) {
            let canWatchAd = WechatAPI.videoAdUtil && WechatAPI.videoAdUtil.canPlay();
            if (canWatchAd) {
                this.watchAdReward(function () {
                    appContext.getSoundManager().playUseGold();
                    if (Math.random() < 0.5) {
                        this.giveReward([{ type: "GrabFirstCard", count: 1 }], false);
                    } else {
                        this.giveReward([{ type: "KeepGradeCard", count: 1 }], false);
                    }
                    appContext.getUxManager().useRandomCard();
                    this.refresh();
                }, this);
            } else {
                if (debug.freeAdReward) {
                    appContext.getSoundManager().playUseGold();
                    if (Math.random() < 0.5) {
                        this.giveReward([{ type: "GrabFirstCard", count: 1 }], false);
                    } else {
                        this.giveReward([{ type: "KeepGradeCard", count: 1 }], false);
                    }
                    appContext.getUxManager().useRandomCard();
                    this.refresh();
                } else {
                    appContext.getDialogManager().showDialog(DialogTypes.Toast, "抽取失败，请稍后重试");
                }
            }
        } else {
            appContext.getSoundManager().playBtn();
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "今日次数已达上限");
        }
    },

    onClickBtnRandomGold: function () {
        if (appContext.getUxManager().canUseRandomGold()) {
            let canWatchAd = WechatAPI.videoAdUtil && WechatAPI.videoAdUtil.canPlay();
            if (canWatchAd) {
                this.startwatchAdReward();
            } else {
                if (debug.freeAdReward) {
                    this.startwatchAdReward();
                } else {
                    appContext.getDialogManager().showDialog(DialogTypes.Toast, "抽取失败，请稍后重试");
                }
            }

        } else {
            appContext.getSoundManager().playBtn();
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "今日次数已达上限");
        }
    },

    startwatchAdReward() {
        if (debug.freeAdReward) {
            appContext.getSoundManager().playUseGold();
            let count = Math.floor(Math.random() * 41 + 80);
            this.giveReward([{ type: "Gold", count: count }], false);
            appContext.getUxManager().useRandomGold();
            this.refresh();
            return;
        }
        this.watchAdReward(function () {
            appContext.getSoundManager().playUseGold();
            let count = Math.floor(Math.random() * 41 + 80);
            this.giveReward([{ type: "Gold", count: count }], false);
            appContext.getUxManager().useRandomGold();
            this.refresh();
        }, this);
    },

    watchAdReward(funcSuc, caller) {
        let self = this;
        WechatAPI.videoAdUtil.updateCb({
            failCb: function () {
                appContext.getAnalyticManager().sendALD("ad_shop_fail");
                appContext.getAnalyticManager().sendTT('videoAd_shop', {
                    res: 1,
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "抽取失败，请稍候重试");
            },
            finishCb: function () {
                appContext.getAnalyticManager().sendALD("ad_shop_ok");
                appContext.getAnalyticManager().sendTT('videoAd_shop', {
                    res: 0,
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "成功获得奖励");
                funcSuc.call(caller);
            },
            ceaseCb: function () {
                appContext.getAnalyticManager().sendALD("ad_shop_cease");
                appContext.getAnalyticManager().sendTT('videoAd_shop', {
                    res: 2,
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "看完后可以抽取");
            },
            caller: self,
        });

        WechatAPI.videoAdUtil.show();
    },

    giveReward(reward, isBuyOrLottery = true) {
        appContext.getUxManager().rewardItems(reward);
        let text = Item.getTextByItem(reward);
        let text1 = isBuyOrLottery ? "购买" : "获取";
        appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, text1 + "成功\n获得: " + text);
    },
});