let PlayerInfo = require("PlayerInfo");
let DialogTypes = require("DialogTypes");
let Item = require("Item");

cc.Class({
    extends: require("BaseDialog"),

    properties: {
        selfPlayerInfo: PlayerInfo,

        oppoPlayerInfo: PlayerInfo,

        btnShowOff: cc.Node,

        btnDoubleGold: cc.Node,

        looserTag: cc.Node,

        winnerTag: cc.Node,

        looserTagLabel: cc.Label,

        resLabel: cc.Label,

        mainNode: cc.Node,

        buttons: cc.Node,

        goldPart: cc.Node,

        goldLabel: cc.Label,

        buttonDaily: cc.Node,
    },

    show: function (info) {
        if (info == null) {
            this.hide();
            return;
        }

        debug.log(info);
        this.hasShareReward = true;
        appContext.getSoundManager().playStartRound();
        WechatAPI.shareUtil && WechatAPI.shareUtil.setShareVideoCB();
        this.fadeInBackground();
        this.info = info;
        this.step = 1;
        WechatAPI.ttRecorder.willShare = false;

        this.processStep();
    },

    processStep: function () {
        this.step += 1;
        switch (this.step) {
            case 1:
                this.processStep();
                break;

            case 2:
                this.showMainBoard();
                break;

            case 3:
                this.showWinner();
                break;

            case 4:
                this.showGold();
                break;

            case 5:
                this.showButtons();
                break;
        }
    },

    showMainBoard: function () {
        this.mainNode.active = true;

        this.mainNode.scale = 0.1;
        let action = cc.scaleTo(0.2, 1).easing(cc.easeBackOut());
        this.mainNode.runAction(action);

        this.selfPlayerInfo.setup(this.info.selfPlayer);
        this.oppoPlayerInfo.setup(this.info.opponentPlayer);

        this.scheduleOnce(function () {
            this.processStep();
        }, 0.5);
    },

    showWinner: function () {
        if (this.info.isDrawGame) {
            this.looserTag.active = true;
            this.winnerTag.active = false;
            this.looserTagLabel.string = "平  局";
            this.resLabel.string = "平分秋色";
        } else {
            if (this.info.win) {
                this.winnerTag.active = true;
                this.looserTag.active = false;
                this.resLabel.string = "胜  利";
            } else {
                this.winnerTag.active = false;
                this.looserTag.active = true;
                if (this.info.isSurrender) {
                    this.looserTagLabel.string = "主动认输";
                } else {
                    this.looserTagLabel.string = "输 了";
                }
                this.resLabel.string = "失  败";
            }

            if (this.winnerTag.active) {
                this.winnerTag.scale = 0.1;
                this.winnerTag.runAction(cc.scaleTo(0.5, 1).easing(cc.easeBackOut()));
            }

            if (this.looserTag.active) {
                this.looserTag.scale = 0.1;
                this.looserTag.runAction(cc.scaleTo(0.5, 1).easing(cc.easeBackOut()));
            }
        }

        this.scheduleOnce(function () {
            this.processStep();
        }, 0.5);
    },

    showGold: function () {
        if (appContext.getGameManager().soloPlay) {
            this.goldPart.active = false;
            this.scheduleOnce(function () {
                this.processStep();
            }, 0.1);
            return;
        }

        this.goldPart.scale = 0;
        this.goldPart.active = true;
        this.goldLabel.string = this.info.gold;
        let action1 = cc.scaleTo(0.5, 1).easing(cc.easeBackOut());
        this.goldPart.runAction(action1);
        appContext.getSoundManager().playUseGold();

        this.scheduleOnce(function () {
            this.processStep();
        }, 0.5);
    },

    showButtons: function () {
        this.setBtns();
        this.buttons.active = true;
        this.buttons.y = -500;
        let action = cc.moveTo(0.5, 0, -40).easing(cc.easeCubicActionOut());
        this.buttons.runAction(action);
        this.buttonDaily.active = false;

        this.scheduleOnce(function () {
            this.processStep();
        }, 0);
    },

    setBtns() {
        this.btnShowOff.active = false;
        this.btnDoubleGold.active = false;

        if (appContext.getGameManager().soloPlay) {
            return;
        }

        if (this.info.gold > 20 && WechatAPI.enableShare && this.getHasVideoToShare()) {
            this.btnDoubleGold.active = true;

            if (!WechatAPI.cache.lifetimeSuperShareVideoCount) {
                WechatAPI.cache.lifetimeSuperShareVideoCount = 1;
            } else {
                WechatAPI.cache.lifetimeSuperShareVideoCount++;
            }

            let useSuperSVD = false;
            if (debug.extraSettings.controlSVD) {
                if (debug.extraSettings.chanceSVD > Math.random() * 100) {
                    useSuperSVD = true;
                }
            }

            if (!useSuperSVD) {
                if (this.info.win) {
                    if (!appContext.getUxManager().isTodaySuperShareVideoShown()) {
                        if (this.getHasVideoToShare() && WechatAPI.cache.lifetimeSuperShareVideoCount + Math.random() * 4 > 4) {
                            appContext.getUxManager().setTodaySuperShareVideo();
                            useSuperSVD = true;
                        }
                    }
                }
            }
        }

        if (!this.btnDoubleGold.active && WechatAPI.enableShare) {
            this.btnShowOff.active = true;
        }
    },

    // 点击"再来一局"按钮
    onClickBtnContinue: function () {
        appContext.getSoundManager().playBtn();
        this.hide();

        if (appContext.getGameManager().soloPlay) {
            appContext.getAppController().clearGameData();
            appContext.getAppController().backToMain();
        } else {
            appContext.getDialogManager().showDialog(DialogTypes.RoundEndRank, this.info);
        }
        //
        //appContext.getDialogManager().showDialog(DialogTypes.Match);
        //this.showIntAd();
    },

    getHasVideoToShare() {
        if (!WechatAPI.ttRecorder) {
            return false;
        }

        if (WechatAPI.ttRecorder.state != "started") {
            return false;
        }

        if (!WechatAPI.shareUtil.isRecordTimeEnough()) {
            return false;
        }

        return true;
    },

    // 点击"DoubleGold"按钮
    onClickBtnDoubleGold: function () {
        this.btnDoubleGold.active = false;
        //这个隐藏了就好 反正用户取消了录屏，这个视频就没了 不可能再次调起
        appContext.getSoundManager().playBtn();
        let reward = [{
            type: "Gold",
        }];
        reward[0].count = this.info.gold;

        if (this.getHasVideoToShare()) {
            //has Video
            if (this.hasShareReward) {
                WechatAPI.shareUtil.setShareVideoCB(reward);
            } else {
                WechatAPI.shareUtil.setShareVideoCB();
            }

            WechatAPI.ttRecorder.willShare = true;
            WechatAPI.ttRecorder.stop();
            this.hasShareReward = false;
        } else {
            WechatAPI.shareUtil.setShareVideoCB();
            WechatAPI.shareUtil.share({
                cb: {
                    sucCb: function () {
                        if (reward) {
                            if (this.node && this.hasShareReward) {
                                this.hasShareReward = false;

                                appContext.getUxManager().rewardItems(reward);
                                let text = Item.getTextByItem(reward);
                                appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, "分享成功\n获得: " + text);
                                this.shareRewardTxt.string = "已分享成功!";
                                appContext.getUxManager().saveGameInfo();
                            }
                        }
                    },
                    caller: this,
                }
            });
        }
    },

    // 点击"炫耀"按钮
    onClickBtnShowoff: function () {
        this.btnShowOff.active = false;
        WechatAPI.shareUtil.setShareVideoCB();
        WechatAPI.shareUtil.share({
            cb: {
                sucCb: function () {
                    appContext.getDialogManager().showDialog(DialogTypes.Toast, "分享成功");
                    this.btnShowOff.active = false;
                },
                caller: this,
            }
        });
    },
});
