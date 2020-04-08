let DialogTypes = require("DialogTypes");
let Item = require("Item");

cc.Class({
    extends: cc.Component,

    properties: {
    },

    onClick() {
        let canWatchAd = WechatAPI.videoAdUtil && WechatAPI.videoAdUtil.canPlay();
        if (canWatchAd) {
            this.watchAdReward();
        } else {
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "请稍后重试");
        }
    },

    watchAdReward() {
        let self = this;
        WechatAPI.videoAdUtil.updateCb({
            failCb: function () {
                appContext.getAnalyticManager().sendALD("ad_daily_fail");
                appContext.getAnalyticManager().sendTT('videoAd_daily', {
                    res: 1,
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "请稍候重试");
            },
            finishCb: function () {
                appContext.getAnalyticManager().sendALD("ad_daily_ok");
                appContext.getAnalyticManager().sendTT('videoAd_daily', {
                    res: 0,
                });
                self.giveReward();
            },
            ceaseCb: function () {
                appContext.getAnalyticManager().sendALD("ad_daily_cease");
                appContext.getAnalyticManager().sendTT('videoAd_daily', {
                    res: 2,
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "看完后可以占星");
            },
            caller: self,
        });

        WechatAPI.videoAdUtil.show();
    },

    giveReward() {
        appContext.getSoundManager().playUseGold();

        let d = new Date();
        let day = d.getDay();

        let reward1 = getRewardByDay(day);

        let day2 = day + 1;
        if (day2 == 7) {
            day2 = 0
        }
        let reward2 = getRewardByDay(day2);

        appContext.getUxManager().rewardItems(reward1);
        let text1 = Item.getTextByItem(reward1);
        let text2 = Item.getTextByItem(reward2);
        appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, "获得占星奖励: " + text1 + "\n明日占星结果预测：" + text2);

        appContext.getUxManager().setDailyRewardClaimedDay();
        this.node.active = false;
    },

    getRewardByDay(day) {
        let obj = { type: "GrabFirstCard", count: 1 };
        if (day == 0) {
            obj.type = "Gold";
            obj.count = 50;
        } else if (day == 1) {
            obj.type = "Gold";
            obj.count = 150;
        } else if (day == 2) {
            obj.type = "KeepGradeCard";
            obj.count = 1;
        } else if (day == 3) {
            obj.type = "Gold";
            obj.count = 50;
        } else if (day == 4) {
            obj.type = "GrabFirstCard";
            obj.count = 1;
        } else if (day == 5) {
            obj.type = "Gold";
            obj.count = 150;
        } else if (day == 6) {
            obj.type = "GrabFirstCard";
            obj.count = 1;
        }

        return [obj];
    },

    //100 200 bao 100 xian 100 xian
});