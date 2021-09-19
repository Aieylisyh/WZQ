let DialogTypes = require("DialogTypes");
let Grade = require("Grade");

cc.Class({
    extends: require("BaseDialog"),

    properties: {
        gradeScoreLabel: cc.Label,

        btnFirstHand: cc.Node,

        btnFullfill: cc.Node,

        btnKeepGrade: cc.Node,

        mainNode: cc.Node,

        buttons: cc.Node,

        expPart: cc.Node,

        expAddPart: cc.Node,

        expProgressBar: cc.ProgressBar,

        expProgressBarLabel: cc.Label,

        expLowLabel: cc.Label,

        expArtNum: cc.Label,

        expArtNumPref: cc.Label,

        crtGradeIcon: cc.Sprite,

        nextGradeIcon: cc.Sprite,
    },

    show: function (info) {
        if (info == null) {
            this.hide();
            return;
        }

        debug.log(info);
        appContext.getSoundManager().playStartRound();
        this.fadeInBackground();
        this.info = info;
        this.step = 1;
        this.processStep();
    },

    update(dt) {
        if (this.expPart.active && this.isExpAddInfo) {
            this.isExpAddInfo.timer += dt;
            //debug.log("    this.isExpAddInfo.timer" + this.isExpAddInfo.timer);
            if (this.isExpAddInfo.timer >= this.isExpAddInfo.time) {
                this.isExpAddInfo.timer = this.isExpAddInfo.time;
                this.updatePBGrade();
                this.isExpAddInfo = null;
            } else {
                this.updatePBGrade();
            }
        }
    },

    updatePBGrade() {
        let tempScore = Math.floor(this.isExpAddInfo.from + (this.isExpAddInfo.to - this.isExpAddInfo.from) * (this.isExpAddInfo.timer / this.isExpAddInfo.time));
        let gradeAndFillInfo = Grade.getGradeAndFillInfoByScore(tempScore);

        let total = gradeAndFillInfo.fillTop - gradeAndFillInfo.fillBottom;
        this.setPBProgress(gradeAndFillInfo.fillAmount, total);
        if (gradeAndFillInfo.grade != this.isExpAddInfo.crtGrade) {
            this.isExpAddInfo.crtGrade = gradeAndFillInfo.grade;
            if (this.isExpAddInfo.crtGrade >= 10) {
                this.setPBIcon(this.isExpAddInfo.crtGrade);
            } else {
                this.setPBIcon(this.isExpAddInfo.crtGrade, this.isExpAddInfo.crtGrade + 1);
            }
        }
    },

    setPBProgress(amount, total) {
        this.expProgressBar.progress = amount / total;
        this.expProgressBarLabel.string = amount + "/" + total;
    },

    setPBIcon(crtGrade, nextGrade) {
        let gradeInfo1 = Grade.getGradeInfo(crtGrade);
        appContext.getFileManager().applySpriteSafe(gradeInfo1.imgPath, this.crtGradeIcon);

        if (nextGrade != null) {
            let gradeInfo2 = Grade.getGradeInfo(nextGrade);
            appContext.getFileManager().applySpriteSafe(gradeInfo2.imgPath, this.nextGradeIcon);
        } else {
            this.nextGradeIcon.spriteFrame = null;
        }
    },

    processStep: function () {
        switch (++this.step) {
            case 1:
                this.processStep();
                break;

            case 2:
                this.showMainBoard();
                break;

            case 3:
                this.showGradeExp();
                break;

            case 4:
                this.showGradeDelta();
                break;

            case 5:
                this.showNewGrade();
                break;

            case 6:
                this.showButtons();
                break;

        }
    },

    showMainBoard: function () {
        // this.chestsNode.active = false;
        this.mainNode.active = true;

        this.mainNode.scale = 0.1;
        let action = cc.scaleTo(0.2, 1).easing(cc.easeBackOut());
        this.mainNode.runAction(action);

        this.scheduleOnce(function () {
            this.processStep();
        }, 0.1);
    },

    showGradeExp: function () {
        appContext.getSoundManager().playChess();

        this.gradeAndFillInfoFrom = Grade.getGradeAndFillInfoByScore(this.info.fromScore);
        this.gradeAndFillInfoTo = Grade.getGradeAndFillInfoByScore(this.info.toScore);
        let gradeFrom = this.gradeAndFillInfoFrom.grade;
        let gradeTo = this.gradeAndFillInfoTo.grade;
        this.gradeInfoFrom = Grade.getGradeInfo(gradeFrom);
        this.gradeInfoTo = Grade.getGradeInfo(gradeTo);

        let total = this.gradeAndFillInfoFrom.fillTop - this.gradeAndFillInfoFrom.fillBottom;
        this.setPBProgress(this.gradeAndFillInfoFrom.fillAmount, total);

        if (gradeFrom >= 10) {
            this.setPBIcon(gradeFrom);
        } else {
            this.setPBIcon(gradeFrom, gradeFrom + 1);
        }

        this.scheduleOnce(function () {
            this.processStep();
        }, 0.5);
    },

    showScoreDeltaText() {
        this.expArtNumPref.string = this.info.win ? "积分+" : "积分-";
        var deltaScore = Math.abs(this.info.gradeScoreAdd);
        this.expArtNum.string = deltaScore;
        this.gradeScoreLabel.string = "本局积分：" + deltaScore;


        this.expAddPart.scale = 0.1;
        let shakeAction = cc.scaleTo(0.5, 1).easing(cc.easeBackOut());
        this.expAddPart.runAction(cc.sequence(cc.delayTime(0), shakeAction));

        this.expPart.active = true;
        this.expPart.scale = 0.1;
        this.expPart.runAction(cc.scaleTo(0.5, 1).easing(cc.easeBackOut()));
    },

    showGradeDelta: function () {
        this.showScoreDeltaText();

        this.isExpAddInfo = {
            from: this.info.fromScore,
            to: this.info.toScore,
            time: 2.5,
            timer: 0,
            crtGrade: this.gradeAndFillInfoFrom.grade,
        };

        this.scheduleOnce(function () {
            this.expLowLabel.string = this.getExpLowLabel();
            this.processStep();
        }, 0.8);
    },

    getExpLowLabel() {
        if (this.info.usedBonusScore) {
            return "每日首胜，获得100额外积分！";
        }

        let total = this.gradeAndFillInfoTo.fillTop - this.gradeAndFillInfoTo.fillBottom;
        let rest = total - this.gradeAndFillInfoTo.fillAmount;
        if (rest < 1 || !this.info.win) {
            let rnd = Math.random();
            if (rnd > 0.6) {
                return "输给高段位的对手，损失的积分也较少";
            } else if (rnd > 0.2) {
                return "击败高段位的对手，可以获得更多积分";
            } else {
                return "每日首场胜利，可以获得100额外积分";
            }
        }

        return "距提升到下一段位，还需" + rest + "积分";
    },

    showNewGrade: function () {
        this.processStep();
    },

    showButtons: function () {
        this.setBtns();
        this.buttons.active = true;
        this.buttons.y = -500;
        let action = cc.moveTo(0.5, 0, -40).easing(cc.easeCubicActionOut());
        this.buttons.runAction(action);

        this.scheduleOnce(function () {
            this.processStep();
        }, 0);
    },

    setBtns() {
        this.btnKeepGrade.active = false;
        this.btnFullfill.active = false;
        this.btnFirstHand.active = false;

        if (!this.info.win) {
            let toRestore = Math.abs(this.info.gradeScoreAdd);
            if (toRestore > 80) {
                this.btnKeepGrade.active = true;
            }
        }


        let delta = 300;
        //如果胜利，且当前段位大于1小于10，
        //且差 delta 积分以内可以升段，就出现这个包含广告图标的“加满段位”按钮
        //点击效果是看广告，获得刚好的经验上一个段位
        if (!this.btnKeepGrade.active && this.info.win) {
            let gradeTo = this.gradeAndFillInfoTo.grade;
            if (gradeTo > 1 && gradeTo < 10) {
                let deltaExp = this.gradeAndFillInfoTo.fillTop - this.info.toScore;
                if (deltaExp <= delta) {
                    let canWatchAd = WechatAPI.videoAdUtil && WechatAPI.videoAdUtil.canPlay();
                    if (canWatchAd) {
                        this.btnFullfill.active = true;
                    }
                }
            }
        }

        let canWatchAd = WechatAPI.videoAdUtil && WechatAPI.videoAdUtil.canPlay();
        if (!this.btnKeepGrade.active && !this.btnFullfill.active && canWatchAd) {
            this.btnFirstHand.active = true;
        }
    },

    onClickBtnFullfill: function () {
        appContext.getSoundManager().playBtn();
        this.btnFullfill.active = false;
        if (debug.freeAdReward) {
            this.fullfillGrade();
        } else {
            this.showVideo_fullfillGrade();
        }
    },

    showVideo_fullfillGrade() {
        let self = this;
        WechatAPI.videoAdUtil.updateCb({
            failCb: function () {
                appContext.getAnalyticManager().sendALD("ad_fullfill_fail");
                appContext.getAnalyticManager().sendTT('videoAd_fullfill', {
                    res: "f",
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "加满未成功");
            },
            finishCb: function () {
                appContext.getAnalyticManager().sendALD("ad_fullfill_ok");
                appContext.getAnalyticManager().sendTT('videoAd_fullfill', {
                    res: "s",
                });
                this.fullfillGrade();
            },
            ceaseCb: function () {
                appContext.getAnalyticManager().sendALD("ad_fullfill_cease");
                appContext.getAnalyticManager().sendTT('videoAd_fullfill', {
                    res: "c",
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "看完后加满");
            },
            caller: self,
        });

        WechatAPI.videoAdUtil.show();
    },

    fullfillGrade() {
        let userInfo = appContext.getUxManager().getUserInfo();

        let currentScore = userInfo.basic.currentScore;
        let gradeAndFillInfo = Grade.getGradeAndFillInfoByScore(currentScore);
        let scoreTarget = gradeAndFillInfo.fillTop;


        let score = scoreTarget - currentScore;
        appContext.getDialogManager().showDialog(DialogTypes.Toast, "加满段位成功！\n直接获得积分" + score);

        userInfo.basic.currentScore = scoreTarget;
        appContext.getUxManager().saveUserInfo(userInfo);

        this.expArtNumPref.string = "段位提升！";
        this.expArtNum.string = "";
        let shakeAction1 = cc.scaleTo(0.5, 0.5).easing(cc.easeBackOut());
        let shakeAction2 = cc.scaleTo(0.5, 1).easing(cc.easeBackOut());
        this.expAddPart.runAction(cc.sequence(shakeAction1, shakeAction2));

        let gradeAndFillInfo_new = Grade.getGradeAndFillInfoByScore(scoreTarget);
        let grade_new = gradeAndFillInfo_new.grade;

        let total = gradeAndFillInfo_new.fillTop - gradeAndFillInfo_new.fillBottom;
        this.setPBProgress(0, total);

        if (grade_new >= 10) {
            this.setPBIcon(grade_new);
        } else {
            this.setPBIcon(grade_new, grade_new + 1);
        }

        this.expLowLabel.string = "加满段位成功";
    },

    // 点击"返回首页"按钮
    onClickBtnBack: function () {
        appContext.getSoundManager().playBtn();
        appContext.getAppController().clearGameData();
        appContext.getAppController().backToMain();
        this.hide();
    },

    onClickBtnFirstHand: function () {
        appContext.getSoundManager().playBtn();
        this.btnFirstHand.active = false;
        let canWatchAd = WechatAPI.videoAdUtil && WechatAPI.videoAdUtil.canPlay();
        if (canWatchAd) {
            this.showVideoFirstHand();
        } else {
            this.onClickBtnBack();
        }
    },

    setFirstHand() {
        appContext.getAppController().clearGameData();
        appContext.getAppController().backToMain();
        appContext.nextFirstHand = true;
        appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, "下局将由您先落子\n并且不消耗任何道具");
        this.showIntAd();
        this.hide();
    },

    // 点击"段位保护"按钮
    onClickBtnProtectGrade: function () {
        appContext.getSoundManager().playBtn();
        this.btnKeepGrade.active = false;
        let self = this;
        let count = appContext.getUxManager().gameInfo.keepGradeCardCount;

        if (count >= 1) {
            let info = {};
            info.content = "当前有保段卡" + count + "张\n是否使用1张回复失去的积分？";
            info.btn1 = {
                clickFunction: function () {
                    appContext.getUxManager().useKeepGradeCard();
                    self.resetScore();
                },
            };
            info.btn2 = {};
            info.hideCloseBtn = true;
            appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, info);

        } else {
            let canWatchAd = WechatAPI.videoAdUtil && WechatAPI.videoAdUtil.canPlay();
            if (canWatchAd) {
                this.showVideo_keepGrade();
            } else {
                if (debug.freeAdReward) {
                    this.resetScore();
                } else {
                    appContext.getDialogManager().showDialog(DialogTypes.Toast, "暂时无法保段");
                }
            }
        }
    },

    showVideo_keepGrade() {
        let self = this;
        WechatAPI.videoAdUtil.updateCb({
            failCb: function () {
                appContext.getAnalyticManager().sendALD("ad_keepgrade_fail");
                appContext.getAnalyticManager().sendTT('videoAd_keepgrade', {
                    res: "f",
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "保段未成功");
            },
            finishCb: function () {
                appContext.getAnalyticManager().sendALD("ad_keepgrade_ok");
                appContext.getAnalyticManager().sendTT('videoAd_keepgrade', {
                    res: "s",
                });
                this.resetScore();
            },
            ceaseCb: function () {
                appContext.getAnalyticManager().sendALD("ad_keepgrade_cease");
                appContext.getAnalyticManager().sendTT('videoAd_keepgrade', {
                    res: "c",
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "看完后保段");
            },
            caller: self,
        });

        WechatAPI.videoAdUtil.show();
    },

    showVideoFirstHand() {
        let self = this;
        WechatAPI.videoAdUtil.updateCb({
            failCb: function () {
                appContext.getAnalyticManager().sendALD("ad_1hand_fail");
                appContext.getAnalyticManager().sendTT('videoAd_1hand', {
                    res: "f",
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "绝对先手未拥有");
            },
            finishCb: function () {
                appContext.getAnalyticManager().sendALD("ad_1hand_ok");
                appContext.getAnalyticManager().sendTT('videoAd_1hand', {
                    res: "s",
                });
                this.setFirstHand();
            },
            ceaseCb: function () {
                appContext.getAnalyticManager().sendALD("ad_1hand_cease");
                appContext.getAnalyticManager().sendTT('videoAd_1hand', {
                    res: "c",
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "看完后拥有绝对先手");
            },
            caller: self,
        });

        WechatAPI.videoAdUtil.show();
    },

    resetScore() {
        if (this == null) {
            return;
        }

        let score = Math.abs(this.info.gradeScoreAdd);
        appContext.getDialogManager().showDialog(DialogTypes.Toast, "段位保护成功！\n回复积分" + score);

        let userInfo = appContext.getUxManager().getUserInfo();
        userInfo.basic.currentScore += score;
        appContext.getUxManager().saveUserInfo(userInfo);
        if (this.expArtNumPref)
            this.expArtNumPref.string = "积分已恢复";
        if (this.expArtNum)
            this.expArtNum.string = "";
        let shakeAction1 = cc.scaleTo(0.5, 0.5).easing(cc.easeBackOut());
        let shakeAction2 = cc.scaleTo(0.5, 1).easing(cc.easeBackOut());
        this.expAddPart.runAction(cc.sequence(shakeAction1, shakeAction2));

        let gradeFrom = this.gradeAndFillInfoFrom.grade;
        let total = this.gradeAndFillInfoFrom.fillTop - this.gradeAndFillInfoFrom.fillBottom;
        this.setPBProgress(this.gradeAndFillInfoFrom.fillAmount, total);

        if (gradeFrom >= 10) {
            this.setPBIcon(gradeFrom);
        } else {
            this.setPBIcon(gradeFrom, gradeFrom + 1);
        }

        if (this.expLowLabel)
            this.expLowLabel.string = "段位保护成功，积分已恢复";
    },
});
