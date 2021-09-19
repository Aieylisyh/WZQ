let DialogTypes = require("DialogTypes");
let Item = require("Item");

cc.Class({
    extends: cc.Component,

    properties: {
        rewardType: 1,//1 棋灵占星 2 棋圣祈福

        txt: cc.Label,
    },

    start() {
        if (this.rewardType == 1) {
            this.txt.string = "棋灵占星";
        } else if (this.rewardType == 2) {
            this.txt.string = "棋圣祈福";
        }
    },

    onClick() {
        let canWatchAd = WechatAPI.videoAdUtil && WechatAPI.videoAdUtil.canPlay();
        if (canWatchAd) {
            this.watchAdReward();
        } else {
            if(debug.freeAdReward){
                this.giveReward();
            }else{
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "请稍后重试");
            }
        }
    },

    watchAdReward() {
        let self = this;
        WechatAPI.videoAdUtil.updateCb({
            failCb: function () {
                appContext.getAnalyticManager().sendALD("ad_daily_fail");
                appContext.getAnalyticManager().sendTT('videoAd_daily', {
                    res: "f",
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "请稍候重试");
            },
            finishCb: function () {
                appContext.getAnalyticManager().sendALD("ad_daily_ok");
                appContext.getAnalyticManager().sendTT('videoAd_daily', {
                    res: "s",
                });
                self.giveReward();
            },
            ceaseCb: function () {
                appContext.getAnalyticManager().sendALD("ad_daily_cease");
                appContext.getAnalyticManager().sendTT('videoAd_daily', {
                    res: "c",
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "看完后可以占星");
            },
            caller: self,
        });

        WechatAPI.videoAdUtil.show();
    },

    giveReward() {
        appContext.getSoundManager().playUseGold();



        let reward1;
        let reward2;
        if (this.rewardType == 1) {
            let d = new Date();
            let day = d.getDay();
            let day2 = day + 1;
            if (day2 == 7) {
                day2 = 0
            }

            reward1 = this.getRewardByDay(day);
            reward2 = this.getRewardByDay(day2);
        } else if (this.rewardType == 2) {
            let count = appContext.getUxManager().getTodayGameCount();

            reward1 = this.getRewardByDailyCount(count);
            reward2 = this.getRewardByDailyCount(count + 1);
        }

        let text1 = Item.getTextByItem(reward1);
        let text2 = Item.getTextByItem(reward2);

        if (this.rewardType == 1) {
            appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, "获得了占星奖励: \n【" + text1 + "】!\n\n明日占星预测：\n【" + text2 + "】\n记得来哦~");
        } else if (this.rewardType == 2) {
            appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, "获得了祈福奖励: \n【" + text1 + "】!\n\n下次祈福预测：\n【" + text2 + "】\n记得来哦~");
        }

        appContext.getUxManager().rewardItems(reward1);
        appContext.getUxManager().setDailyRewardClaimedDay();
        this.node.active = false;
    },

    getRewardByDailyCount(count) {
        let obj = {};
        if (count == 0) {
            obj.type = "Gold";
            obj.count = 8;
        } else if (count == 1) {
            obj.type = "Gold";
            obj.count = 33;
        } else if (count == 2) {
            obj.type = "Gold";
            obj.count = 66;
        } else if (count == 3) {
            obj.type = "Gold";
            obj.count = 88;
        } else if (count == 4) {
            obj.type = "GrabFirstCard";
            obj.count = 1;
        } else {
            obj.type = "Gold";
            obj.count = Math.floor(Math.random() * 20 + 1);
        }
        return [obj];
    },

    getRewardByDay(day) {
        let obj = {};
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
});