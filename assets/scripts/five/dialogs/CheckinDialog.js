
let DialogTypes = require("DialogTypes");
let Item = require("Item");

cc.Class({
    extends: require("BaseDialog"),

    properties: {
        checkinItems: [require("CheckinItem")],
    },

    show: function () {
        this.fadeInBackground();
        this.fastShowAnim();
        this.refresh();
    },

    refresh() {
        let c = appContext.getUxManager().getAndRefineCheckinDayCounts();
        for (let i = 0; i < 6; i++) {
            let item = this.checkinItems[i];
            item.setFan(i < c);
        }
    },

    onClickBtnCheck: function () {
        appContext.getSoundManager().playBtn();
        if (!appContext.getUxManager().todayCheckedin()) {
            this.checkinSuc();
            // let canWatchAd = WechatAPI.videoAdUtil && WechatAPI.videoAdUtil.canPlay();

            // if (canWatchAd) {
            //     this.showVideo();
            // } else {
            //     appContext.getDialogManager().showDialog(DialogTypes.Toast, "签到失败，请稍后重试");
            // }
        } else {
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "今天已经签到了");
        }
    },

    showVideo() {
        let self = this;
        WechatAPI.videoAdUtil.updateCb({
            failCb: function () {
                appContext.getAnalyticManager().sendALD("ad_checkin_fail");
                appContext.getAnalyticManager().sendTT('videoAd_checkin', {
                    res: 1,
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "签到失败，请稍候重试");
            },
            finishCb: function () {
                appContext.getAnalyticManager().sendALD("ad_checkin_ok");
                appContext.getAnalyticManager().sendTT('videoAd_checkin', {
                    res: 0,
                });
                this.checkinSuc();
            },
            ceaseCb: function () {
                appContext.getAnalyticManager().sendALD("ad_checkin_cease");
                appContext.getAnalyticManager().sendTT('videoAd_checkin', {
                    res: 2,
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "看完后可以签到");
            },
            caller: self,
        });

        WechatAPI.videoAdUtil.show();
    },

    checkinSuc() {
        appContext.getSoundManager().playUseGold();
        this.giveReward();
        appContext.getUxManager().checkinProcess();
        this.refresh();
    },

    giveReward() {
        let c = appContext.getUxManager().getAndRefineCheckinDayCounts();
        let reward = this.getReward(c + 1);
        appContext.getUxManager().rewardItems(reward);


        let text = Item.getTextByItem(reward);
        appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, "签到成功\n获得:" + text);
    },

    getReward(day) {
        switch (day) {
            case 1:
                return [{
                    type: "Gold",
                    count: 80,
                }];

            case 2:
                return [{
                    type: "GrabFirstCard",
                    count: 1,
                }];

            case 3:
                return [{
                    type: "Gold",
                    count: 100,
                }];

            case 4:
                return [{
                    type: "KeepGradeCard",
                    count: 1,
                }];

            case 5:
                return [{
                    type: "Gold",
                    count: 120,
                }];

            case 6:
                return [{
                    type: "GrabFirstCard",
                    count: 3,
                }, {
                    type: "KeepGradeCard",
                    count: 3,
                }];
        }
    },
});