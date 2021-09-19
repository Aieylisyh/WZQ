let DialogTypes = require("DialogTypes");
let PlayerInfo = require("PlayerInfo");
let Grade = require("Grade");

cc.Class({
    extends: require("BaseDialog"),

    properties: {
        matchRank1WinCount: cc.Label,
        matchRank1LooseCount: cc.Label,

        matchRank2WinCount: cc.Label,
        matchRank2LooseCount: cc.Label,

        matchRank3WinCount: cc.Label,
        matchRank3LooseCount: cc.Label,

        forbiden2: cc.Node,
        forbiden3: cc.Node,

    },

    show: function () {
        this.fadeInBackground();
        this.fastShowAnim();

        this.setup();
    },

    setup() {
        let user = appContext.getUxManager().getUserInfo();
        let gradeAndFillInfo = Grade.getGradeAndFillInfoByScore(user.basic.currentScore);
        if (4 > gradeAndFillInfo.grade) {
            this.forbiden2.active = true;
        }
        if (8 > gradeAndFillInfo.grade) {
            this.forbiden3.active = true;
        }

        let rankInfo = appContext.getUxManager().gameInfo.rankInfo;
        if (rankInfo == null) {
            return;
        }

        let winCount = 0;
        let combatCount = 0;
        for (let i = 1; i <= 3; i++) {
            let tpWinCount = rankInfo["winCount_" + i];
            let tpCombatCount = rankInfo["combatCount_" + i];
            if (!tpWinCount) { tpWinCount = 0; }
            if (!tpCombatCount) { tpCombatCount = 0; }
            winCount += tpWinCount;
            combatCount += tpCombatCount;
        }

        this.matchRank1WinCount.string = winCount;
        this.matchRank1LooseCount.string = combatCount - winCount;

        winCount = 0;
        combatCount = 0;
        for (let i = 4; i <= 7; i++) {
            let tpWinCount = rankInfo["winCount_" + i];
            let tpCombatCount = rankInfo["combatCount_" + i];
            if (!tpWinCount) { tpWinCount = 0; }
            if (!tpCombatCount) { tpCombatCount = 0; }
            winCount += tpWinCount;
            combatCount += tpCombatCount;
        }

        this.matchRank2WinCount.string = winCount;
        this.matchRank2LooseCount.string = combatCount - winCount;

        winCount = 0;
        combatCount = 0;
        for (let i = 8; i <= 10; i++) {
            let tpWinCount = rankInfo["winCount_" + i];
            let tpCombatCount = rankInfo["combatCount_" + i];
            if (!tpWinCount) { tpWinCount = 0; }
            if (!tpCombatCount) { tpCombatCount = 0; }
            winCount += tpWinCount;
            combatCount += tpCombatCount;
        }

        this.matchRank3WinCount.string = winCount;
        this.matchRank3LooseCount.string = combatCount - winCount;
    },

    onClickMatch_1() {
        this.checkMatchQualification(20, 1, 1);
    },

    onClickMatch_2() {
        this.checkMatchQualification(50, 4, 2);
    },

    onClickMatch_3() {
        this.checkMatchQualification(150, 8, 3);
    },

    startMatch() {
        appContext.getGameManager().soloPlay = false;
        appContext.getSoundManager().playBtn();
        appContext.getDialogManager().showDialog(DialogTypes.Match);
        this.hide();
    },

    checkMatchQualification(price, minRank, matchRank) {
        appContext.getSoundManager().playBtn();

        let user = appContext.getUxManager().getUserInfo();
        let gradeAndFillInfo = Grade.getGradeAndFillInfoByScore(user.basic.currentScore);
        //let gradeInfo = Grade.getGradeInfo(gradeAndFillInfo.grade);

        if (minRank > gradeAndFillInfo.grade) {
            console.log("match rank minRank not meet req!");
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "您的段位未达到入场需求");
            return;
        }

        appContext.getGameManager().matchRank = matchRank;
        if (appContext.getUxManager().useGold(price)) {
            //appContext.getSoundManager().playUseGold();
            this.startMatch();
        } else {
            this.showNotEnoughGold();
        }
    },

    showNotEnoughGold() {
        let canLure = false;
        if (appContext.getUxManager().canUseRandomGold()) {
            let canWatchAd = WechatAPI.videoAdUtil && WechatAPI.videoAdUtil.canPlay();
            if (canWatchAd || debug.freeAdReward) {
                canLure = true;
            }
        }

        if (canLure) {
            let info = {
                content: "金币不足\n看个广告，可直接加入比赛",
                adIcon: true,
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

        appContext.getDialogManager().showDialog(DialogTypes.Toast, "参赛金币不足");
    },

    startwatchAdReward() {
        if (debug.freeAdReward) {
            this.startMatch();
            return;
        }

        this.watchAdReward(function () {
            this.startMatch();
        }, this);
    },

    watchAdReward(funcSuc, caller) {
        let self = this;
        WechatAPI.videoAdUtil.updateCb({
            failCb: function () {
                appContext.getAnalyticManager().sendALD("ad_daily_fail");
                appContext.getAnalyticManager().sendTT('videoAd_daily', {
                    res: "f",
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "广告失败，请稍候重试");
            },
            finishCb: function () {
                appContext.getAnalyticManager().sendALD("ad_daily_ok");
                appContext.getAnalyticManager().sendTT('videoAd_daily', {
                    res: "s",
                });
                funcSuc.call(caller);
            },
            ceaseCb: function () {
                appContext.getAnalyticManager().sendALD("ad_daily_cease");
                appContext.getAnalyticManager().sendTT('videoAd_daily', {
                    res: "c",
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "看完后才可以参赛");
            },
            caller: self,
        });

        WechatAPI.videoAdUtil.show();
    },
});
