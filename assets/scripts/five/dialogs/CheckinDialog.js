
let DialogTypes = require("DialogTypes");
let Item = require("Item");

cc.Class({
    extends: require("BaseDialog"),

    properties: {
        checkinItems: [require("CheckinItem")],

        text: cc.Label,

        adIcon: cc.Node,
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

        this.adIcon.active = false;

        let res = appContext.getUxManager().todayCheckedin();
        if (res) {
            let canDoubleCheckin = appContext.getUxManager().gameInfo.checkinTodayTimes == 1;
            if (canDoubleCheckin) {
                //看广告可领第二次
                this.text.string = "观看【广告】，可再次领取签到奖励！";
                this.adIcon.active = true;
            } else {
                this.text.string = "已签到，明日可再次签到";
            }
        } else {
            this.text.string = "可领签到奖励！";
        }
    },

    onClickBtnCheck: function () {
        appContext.getSoundManager().playBtn();
        if (!appContext.getUxManager().todayCheckedin()) {
            this.checkinSuc();
        } else {
            let canDoubleCheckin = appContext.getUxManager().gameInfo.checkinTodayTimes == 1;
            if (canDoubleCheckin) {
                let canWatchAd = WechatAPI.videoAdUtil && WechatAPI.videoAdUtil.canPlay();

                if (canWatchAd) {
                    this.showVideo();
                } else {
                    appContext.getDialogManager().showDialog(DialogTypes.Toast, "签到失败，请稍后重试");
                }
            } else {
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "今天已签到过了");
            }

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

        WechatAPI.interstitialAdUtil && WechatAPI.interstitialAdUtil.reload();
    },

    giveReward() {
        let c = appContext.getUxManager().getAndRefineCheckinDayCounts();
        if (appContext.getUxManager().gameInfo.checkinTodayTimes > 0) {
            c -= 1;
        }
        let reward = this.getReward(c + 1);
        appContext.getUxManager().rewardItems(reward);


        let text = Item.getTextByItem(reward);
        appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, "签到成功\n获得: " + text);
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