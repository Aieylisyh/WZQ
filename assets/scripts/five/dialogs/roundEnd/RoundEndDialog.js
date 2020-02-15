let PlayerInfo = require("PlayerInfo");
let DialogTypes = require("DialogTypes");
let Grade = require("Grade");
let Item = require("Item");

cc.Class({
    extends: require("BaseDialog"),

    properties: {
        oppoPlayerInfo: PlayerInfo,

        selfPlayerInfo: PlayerInfo,

        gradeLabel: cc.Label,

        gradeScoreLabel: cc.Label,

        btnShowOff: cc.Node,

        btnFullfill: cc.Node,

        btnKeepGrade: cc.Node,

        looserTag: cc.Node,

        looserTagLabel: cc.Label,

        winnerTag: cc.Node,

        winnerTagXLeft: -150,

        winnerTagXRight: 150,

        looserTagXLeft: -150,

        looserTagXRight: 150,

        mainNode: cc.Node,

        chestsNode: cc.Node,

        chestPrefab: cc.Prefab,

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

        goldPart: cc.Node,

        goldLabel: cc.Label,

        shareRewardTxt: cc.Label,

        keepGradeRewardTxt: cc.Label,

        keepGradeRewardAdIcon: cc.Node,
    },

    show: function (info) {
        if (info == null) {
            this.hide();
            return;
        }

        //window.re = this;
        debug.log(info);
        this.hasShareReward = true;
        appContext.getSoundManager().playStartRound();
        WechatAPI.shareUtil.setShareVideoCB();
        this.fadeInBackground();
        this.info = info;
        this.step = 1;

        WechatAPI.cache.gameRecordHideShare = true;
        //WechatAPI.recordGameEnd(true);

        this.processStep();
    },

    update(dt) {
        if (this.expPart.active && this.isExpAddInfo) {
            // this.isExpAddInfo = {
            //     from: this.info.fromScore,
            //     to: this.info.toScore,
            //     time: 2,
            //     timer: 0,
            //     crtGrade:this.gradeAndFillInfoFrom.grade,
            // };
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
        //debug.log("updatePBGrade " + tempScore);

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
                this.showChests();
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
                this.showGradeExp();
                break;

            case 6:
                this.showGradeDelta();
                break;

            case 7:
                this.showNewGrade();
                break;

            case 8:
                this.showButtons();
                break;

        }
    },

    showChests: function () {
        if (this.info.chestInfo == null) {
            this.processStep();
            return;
        }

        this.chestsNode.active = true;
        this.mainNode.active = false;

        this.chestsNode.scale = 0.1;
        let action1 = cc.scaleTo(0.2, 1).easing(cc.easeBackOut());
        let action2 = cc.callFunc(function () {
            this.createChests();
        }, this);

        let seq = cc.sequence(action1, action2);
        this.chestsNode.runAction(seq);
    },

    showMainBoard: function () {
        this.chestsNode.active = false;
        this.mainNode.active = true;

        this.mainNode.scale = 0.1;
        let action = cc.scaleTo(0.2, 1).easing(cc.easeBackOut());
        this.mainNode.runAction(action);

        this.selfPlayerInfo.setup(this.info.selfPlayer);
        this.oppoPlayerInfo.setup(this.info.opponentPlayer);

        this.scheduleOnce(function () {
            this.processStep();
        }, 0.6);
    },

    showWinner: function () {
        if (this.info.isDrawGame) {
            this.looserTag.active = false;
            this.winnerTag.active = false;
            this.gradeScoreLabel.string = "平分秋色";
            this.looserTagLabel.string = "平分秋色";
        } else {
            this.looserTag.x = this.info.win ? this.looserTagXRight : this.looserTagXLeft;
            this.winnerTag.x = this.info.win ? this.winnerTagXLeft : this.winnerTagXRight;
            this.looserTag.active = true;
            this.winnerTag.active = true;

            this.gradeScoreLabel.string = this.info.win ? "小胜一场" : "小败一场";
            if (this.info.isLooserOffline) {
                this.looserTagLabel.string = "超时或离线";
            } else if (this.info.isSurrender) {
                this.looserTagLabel.string = "主动认输";
            } else {
                this.looserTagLabel.string = "输 了";
            }

            this.winnerTag.scale = 0.1;
            let action1 = cc.scaleTo(0.5, 1).easing(cc.easeBackOut());
            this.winnerTag.runAction(action1);

            this.looserTag.scale = 0.1;
            let action2 = cc.scaleTo(0.5, 1).easing(cc.easeBackOut());
            this.looserTag.runAction(action2);
        }

        this.scheduleOnce(function () {
            this.processStep();
        }, 0.5);
    },

    showGold: function () {
        this.goldPart.scale = 0;
        this.goldPart.active = true;
        this.goldLabel.string = this.info.gold;
        let action1 = cc.scaleTo(0.5, 1).easing(cc.easeBackOut());
        this.goldPart.runAction(action1);
        appContext.getSoundManager().playUseGold();

        this.scheduleOnce(function () {
            this.processStep();
        }, 0.75);
    },

    showGradeExp: function () {
        //  info.gradeScoreAdd 
        //  info.toScore
        //  info.fromScore
        appContext.getSoundManager().playChess();

        this.gradeAndFillInfoFrom = Grade.getGradeAndFillInfoByScore(this.info.fromScore);
        this.gradeAndFillInfoTo = Grade.getGradeAndFillInfoByScore(this.info.toScore);
        let gradeFrom = this.gradeAndFillInfoFrom.grade;
        let gradeTo = this.gradeAndFillInfoTo.grade;
        this.gradeInfoFrom = Grade.getGradeInfo(gradeFrom);
        this.gradeInfoTo = Grade.getGradeInfo(gradeTo);
        // debug.log(this.gradeAndFillInfoFrom);
        // debug.log(this.gradeAndFillInfoTo);
        // debug.log(this.gradeInfoFrom);
        // debug.log(this.gradeInfoTo);

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
        this.expArtNum.string = Math.abs(this.info.gradeScoreAdd);
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
        }, 1);
    },

    getExpLowLabel() {
        if (this.info.usedBonusScore) {
            return "每日首场胜利，获得120额外积分！";
        }

        let total = this.gradeAndFillInfoTo.fillTop - this.gradeAndFillInfoTo.fillBottom;
        let rest = total - this.gradeAndFillInfoTo.fillAmount;
        if (rest < 1 || !this.info.win) {
            let rnd = Math.random();
            if (rnd > 0.75) {
                return "无论输赢，都可以获得金币";
            } else if (rnd > 0.5) {
                return "输给段位较高的对手，损失的积分也较少";
            } else if (rnd > 0.25) {
                return "击败段位较高的对手，可以获得更多积分";
            } else {
                return "每日首场胜利，可以获得120额外积分";
            }
        }

        return "距提升到下一段位，还需" + rest + "积分";
    },

    showNewGrade: function () {
        if (this.gradeAndFillInfoFrom.grade != this.gradeAndFillInfoTo.grade) {
            let originalScale = this.selfPlayerInfo.gradeIcon.node.scale;
            debug.log("originalScale " + originalScale);
            let seq = cc.sequence(
                cc.scaleTo(0.3, 0),
                cc.callFunc(function () {
                    debug.log(this.gradeInfoTo.imgPath);
                    this.selfPlayerInfo.setGradeIcon(this.gradeInfoTo.imgPath);
                }, this),
                cc.scaleTo(0.5, originalScale)
            );
            this.selfPlayerInfo.gradeIcon.node.runAction(seq);
        }

        this.scheduleOnce(function () {
            this.processStep();
        }, 1);
    },

    showButtons: function () {
        this.buttons.active = true;

        this.setFullfillGradeBtns();
        this.setShareBtns();
        this.setKeepGradeBtns();

        this.buttons.y = -500;
        let action = cc.moveTo(0.5, 0, -40).easing(cc.easeCubicActionOut());
        this.buttons.runAction(action);

        this.scheduleOnce(function () {
            this.processStep();
        }, 0);
    },

    setKeepGradeBtns() {
        this.btnKeepGrade.active = false;

        if (!this.info.win) {
            let toRestore = Math.abs(this.info.gradeScoreAdd);
            if (toRestore > 0) {
                this.btnKeepGrade.active = true;
                this.keepGradeRewardTxt.node.active = true;
                this.keepGradeRewardTxt.string = "恢复已损失积分" + toRestore;


                this.keepGradeRewardAdIcon.active = appContext.getUxManager().gameInfo.keepGradeCardCount < 1;
            }
        }
    },

    setFullfillGradeBtns() {
        this.btnFullfill.active = false;
        //如果胜利，且当前段位大于1小于10，且差150积分以内可以升段，就出现这个包含广告图标的“加满段位”按钮，点击效果是看广告，获得刚好的经验上一个段位
        if (this.info.win) {
            let gradeTo = this.gradeAndFillInfoTo.grade;
            if (gradeTo > 1 && gradeTo < 10) {
                let deltaExp = this.gradeAndFillInfoTo.fillTop - this.info.toScore;
                if (deltaExp < 150) {
                    let canWatchAd = WechatAPI.videoAdUtil && WechatAPI.videoAdUtil.canPlay();
                    if (canWatchAd) {
                        this.btnFullfill.active = true;
                    }
                }
            }
        }
    },

    setShareBtns() {
        this.btnShowOff.active = false;
        if (WechatAPI.enableShare) {
            this.btnShowOff.active = true;

            if (!WechatAPI.cache.lifetimeSuperShareVideoCount) {
                WechatAPI.cache.lifetimeSuperShareVideoCount = 1;
            } else {
                WechatAPI.cache.lifetimeSuperShareVideoCount++;
            }

            if (this.info.win) {
                if (!appContext.getUxManager().isTodaySuperShareVideoShown()) {
                   

                    if (this.getHasVideoToShare() && WechatAPI.cache.lifetimeSuperShareVideoCount + Math.random() * 4 > 4) {
                        appContext.getUxManager().setTodaySuperShareVideo()

                        this.shareRewardTxt.node.active = false;
                        this.hasShareReward = false;
                        appContext.getDialogManager().showDialog(DialogTypes.ShareVideo);
                        return;
                    }
                }
            };


            if (this.hasShareReward) {
                this.shareRewardTxt.node.active = true;
                if (this.getHasVideoToShare()) {
                    this.shareRewardTxt.string = "分享录屏送20~50金币";
                } else {
                    this.shareRewardTxt.string = "分享成功送10~40金币";
                }
            } else {
                this.shareRewardTxt.node.active = false;
            }

        }
    },

    onClickBtnFullfill: function () {
        appContext.getSoundManager().playBtn();
        this.btnFullfill.active = false;
        this.showVideo_fullfillGrade();
    },

    showVideo_fullfillGrade() {
        let self = this;
        WechatAPI.videoAdUtil.updateCb({
            failCb: function () {
                appContext.getAnalyticManager().sendALD("ad_fullfill_fail");
                appContext.getAnalyticManager().sendTT('videoAd_fullfill', {
                    res: 1,
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "加满未成功");
            },
            finishCb: function () {
                appContext.getAnalyticManager().sendALD("ad_fullfill_ok");
                appContext.getAnalyticManager().sendTT('videoAd_fullfill', {
                    res: 0,
                });
                this.fullfillGrade();
            },
            ceaseCb: function () {
                appContext.getAnalyticManager().sendALD("ad_fullfill_cease");
                appContext.getAnalyticManager().sendTT('videoAd_fullfill', {
                    res: 2,
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
        let gradeInfo_new = Grade.getGradeInfo(grade_new);
        //big grade icon. animate whatever it changes or not
        let originalScale = this.selfPlayerInfo.gradeIcon.node.scale;
        let seq = cc.sequence(
            cc.scaleTo(0.3, 0),
            cc.callFunc(function () {
                debug.log(gradeInfo_new.imgPath);
                this.selfPlayerInfo.setGradeIcon(gradeInfo_new.imgPath);
            }, this),
            cc.scaleTo(0.5, originalScale)
        );
        this.selfPlayerInfo.gradeIcon.node.runAction(seq);

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

    // 点击"再来一局"按钮
    onClickBtnContinue: function () {
        appContext.getSoundManager().playBtn();
        this.hide();
        // let gm = appContext.getGameManager();
        // let p2 = DummyPicker.pickTestDummy();
        // gm.createGame(gm.selfPlayer, p2, Math.random(), {});
        // gm.startGame();
        appContext.getAppController().backToMain();
        appContext.getDialogManager().showDialog(DialogTypes.Match);
    },

    getHasVideoToShare() {
        let hasVideo = false;
        if (WechatAPI.isTT && !this.autoShareVideo && WechatAPI.getCanStopGameRecording()) {
            hasVideo = true;
            //在录屏
            if (WechatAPI.cache.autoRecording) {
                //自动录屏而不是手动录屏

            }
        } else {
            hasVideo = false;
        }

        return hasVideo;
    },

    // 点击"炫耀"按钮
    onClickBtnShowoff: function () {
        appContext.getSoundManager().playBtn();
        let reward = [{
            type: "Gold",
        }];

        if (this.getHasVideoToShare()) {
            //has Video

            if (this.hasShareReward) {
                reward[0].count = Math.floor(Math.random() * 31 + 20);
                WechatAPI.shareUtil.setShareVideoCB(reward);
            } else {
                WechatAPI.shareUtil.setShareVideoCB();
            }
            WechatAPI.cache.gameRecordHideShare = false;
            WechatAPI.recordGameEnd();
            this.shareRewardTxt.node.active = false;//这个隐藏了就好 反正用户取消了录屏，这个视频就没了 不可能再次调起
            this.hasShareReward = false;
            appContext.scheduleOnce(function () {
                WechatAPI.assignRecordListeners();
            }, 3);

        } else {
            reward[0].count = Math.floor(Math.random() * 31 + 10);

            WechatAPI.shareUtil.setShareVideoCB();
            WechatAPI.shareUtil.share({
                cb: {
                    sucCb: function () {
                        if (reward) {
                            console.log(reward);
                            console.log(this);
                            if (this.node && this.hasShareReward) {
                                this.hasShareReward = false;

                                appContext.getUxManager().rewardItems(reward);
                                let text = Item.getTextByItem(reward);
                                appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, "分享成功\n获得: " + text);
                                this.keepGradeRewardTxt.string = "已分享成功!";
                                appContext.getUxManager().saveGameInfo();
                            }
                        }
                    },
                    caller: this,
                }
            });
        }
    },

    // 点击"段位保护"按钮
    onClickBtnProtectGrade: function () {
        appContext.getSoundManager().playBtn();

        let self = this;
        let count = appContext.getUxManager().gameInfo.keepGradeCardCount;

        if (count >= 1) {
            let info = {};
            info.content = "当前有保段卡" + count + "张\n是否使用1张回复失去的积分？";
            info.btn1 = {
                clickFunction: function () {
                    appContext.getUxManager().useKeepGradeCard();
                    self.resetScore();
                    self.hideKeepGradeButton();
                },
            };
            info.btn2 = {};
            info.hideCloseBtn = true;
            appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, info);

        } else {
            let canWatchAd = WechatAPI.videoAdUtil && WechatAPI.videoAdUtil.canPlay();
            if (canWatchAd) {
                this.showVideo();
            } else {
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "暂时无法保段");
            }

            this.hideKeepGradeButton();
        }
    },

    hideKeepGradeButton() {
        this.btnKeepGrade.active = false;

        if (this.btnShowOff.active) {
            this.btnShowOff.x = 0;
        }
    },

    showVideo() {
        let self = this;
        WechatAPI.videoAdUtil.updateCb({
            failCb: function () {
                appContext.getAnalyticManager().sendALD("ad_keepgrade_fail");
                appContext.getAnalyticManager().sendTT('videoAd_keepgrade', {
                    res: 1,
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "保段未成功");
            },
            finishCb: function () {
                appContext.getAnalyticManager().sendALD("ad_keepgrade_ok");
                appContext.getAnalyticManager().sendTT('videoAd_keepgrade', {
                    res: 0,
                });
                this.resetScore();
            },
            ceaseCb: function () {
                appContext.getAnalyticManager().sendALD("ad_keepgrade_cease");
                appContext.getAnalyticManager().sendTT('videoAd_keepgrade', {
                    res: 2,
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "看完后保段");
            },
            caller: self,
        });

        WechatAPI.videoAdUtil.show();
    },

    resetScore() {
        let score = Math.abs(this.info.gradeScoreAdd);
        appContext.getDialogManager().showDialog(DialogTypes.Toast, "段位保护成功！\n回复积分" + score);

        let userInfo = appContext.getUxManager().getUserInfo();
        userInfo.basic.currentScore += score;
        appContext.getUxManager().saveUserInfo(userInfo);

        this.expArtNumPref.string = "积分已恢复";
        this.expArtNum.string = "";
        let shakeAction1 = cc.scaleTo(0.5, 0.5).easing(cc.easeBackOut());
        let shakeAction2 = cc.scaleTo(0.5, 1).easing(cc.easeBackOut());
        this.expAddPart.runAction(cc.sequence(shakeAction1, shakeAction2));


        //big grade icon. animate whatever it changes or not
        let originalScale = this.selfPlayerInfo.gradeIcon.node.scale;
        let seq = cc.sequence(
            cc.scaleTo(0.3, 0),
            cc.callFunc(function () {
                debug.log(this.gradeInfoFrom.imgPath);
                this.selfPlayerInfo.setGradeIcon(this.gradeInfoFrom.imgPath);
            }, this),
            cc.scaleTo(0.5, originalScale)
        );
        this.selfPlayerInfo.gradeIcon.node.runAction(seq);

        let gradeFrom = this.gradeAndFillInfoFrom.grade;
        let total = this.gradeAndFillInfoFrom.fillTop - this.gradeAndFillInfoFrom.fillBottom;
        this.setPBProgress(this.gradeAndFillInfoFrom.fillAmount, total);

        if (gradeFrom >= 10) {
            this.setPBIcon(gradeFrom);
        } else {
            this.setPBIcon(gradeFrom, gradeFrom + 1);
        }

        this.expLowLabel.string = "段位保护成功，积分已恢复";
    },

    onClickChest: function (chest) {
        if (chest == null) {
            return;
        }

        let id = chest.id;
        this.chests = [];
        this.chests.push(this.chestsVisual[id]);
        this.chestsVisual.splice(id, 1);
        this.chests.push(this.chestsVisual.pop());
        this.chests.push(this.chestsVisual.pop());
        this.chestsVisual = null;

        //TODO获得对应奖励
        this.chests[0].onOpen(true, this.info.chestInfo.chest0);

        this.scheduleOnce(function () {
            this.chests[1].onOpen(false, this.info.chestInfo.chest1);
            this.chests[2].onOpen(false, this.info.chestInfo.chest2);
        }, 1);

        this.scheduleOnce(function () {
            this.chests[0].node.destroy();
            this.chests[1].node.destroy();
            this.chests[2].node.destroy();
            this.chests = null;

            this.step = 2;
            this.processStep();
        }, 3);
    },

    createChests: function () {
        //TODO
        /*  info.chestInfo = {
              chest0: {
                  text: "大奖",
                  resUrl: "images/rankImg/rank1",
              },
              chest1: null,
              chest2: {
                  text: "参与奖",
                  resUrl: "images/rankImg/rank2",
              },
          };*/


        this.chestsVisual = [];

        for (let i = 0; i < 3; i++) {
            this.createChest(i);
        }
    },

    createChest: function (i) {
        this.scheduleOnce(function () {
            let chestNode = cc.instantiate(this.chestPrefab);
            let chest = chestNode.getComponent("Chest");

            chest.init(this, i);
            this.chestsVisual.push(chest);


            this.chestsNode.addChild(chestNode);
            chestNode.x = (i - 1) * 190;
            if (i === 1) {
                chestNode.y = -200;
            } else {
                chestNode.y = -260;
            }
        }, i * 0.4);
    },
});
