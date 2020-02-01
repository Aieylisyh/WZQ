
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
        if (!appContext.getUxManager().todayCheckedin()) {
            this.checkinSuc();
        } else {
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "今天已经签到了");
        }
    },

    checkinSuc() {
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