let DialogTypes = require("DialogTypes");
let Grade = require("Grade");
let DataUtil = require('DataUtil');
let cdDianFeng = 5400000;

cc.Class({
    extends: cc.Component,

    properties: {
        btnMatchMode: cc.Node,

        btnHardMode: cc.Node,

        blockSF: cc.SpriteFrame,

        btnRank: cc.Node,

        btnSetting: cc.Node,

        playerInfoBoard: require("PlayerInfo"),

        promoPrefab: cc.Prefab,

        btnPromo: cc.Node,

        house: cc.Sprite,

        housePuddingComp: require("Pudding"),

        house1: cc.SpriteFrame,

        house2: cc.SpriteFrame,

        house3: cc.SpriteFrame,

        house4: cc.SpriteFrame,

        house5: cc.SpriteFrame,

        redDot_shop: cc.Node,

        redDot_checkin: cc.Node,

        btnMatchModeTimer: cc.Label,

        btnNormalModeTimer: cc.Label,

        iconLogo: cc.Node,

        bottomBtns: cc.Node,
    },

    start: function () {
        this.node.on("CloseAllDialogs", this.onCloseAllDialogs, this);
        this.autoShowDialogs();
        appContext.getSoundManager().startBackgroundMusic();

        this.setupLoginFinish = false;
        //debug.log("mw自主初始化 来自mw");
        this.checkLoginFinish();
    },

    checkLoginFinish() {
        //如果pip完成，会调用OnLoginFinish 才能显示广告和小红点
        //debug.log("mw自主初始化 checkLoginFinish");
        if (appContext.getUxManager().loginFinished) {
            //debug.log("ok");
            this.onLoginFinish();
        }
    },

    onLoginFinish() {
        if (this.setupLoginFinish) {
            return;
        }

        this.setupLoginFinish = true;

        if (WechatAPI.cache.iconShowed) {
            this.buildWindow();
        } else {
            WechatAPI.cache.iconShowed = true;

            this.iconLogo.runAction(cc.sequence(
                cc.fadeTo(0.5, 255),
                cc.delayTime(0.5),
                cc.fadeTo(1, 0),
                cc.callFunc(function () {
                    this.buildWindow();
                }, this),
            ));
        }
    },

    buildWindow() {
        this.bottomBtns.active = true;
        this.iconLogo.active = false
        this.buildAnim();
        appContext.getUxManager().tryTriggerFatigue();
        let userInfo = appContext.getUxManager().getUserInfo();
        this.playerInfoBoard.setup(userInfo);
        this.playerInfoBoard.notifyClick();
        this.setHouse(userInfo);
        this.setRedDots();
        this.tickTime = 1;
        if (this.node && WechatAPI.isWx || WechatAPI.isTT) {
            WechatAPI.bannerAdUtil && WechatAPI.bannerAdUtil.show();
        }
    },

    update: function (dt) {
        // 信息栏动画
        if (this.swingTime != null) {
            this.playerInfoBoard.node.x = Math.floor(Math.sin(this.swingTime * 1.5) * 220) * 0.1;
            this.swingTime += dt;
        }

        if (this.tickTimer == null) {
            return;
        }

        this.tickTimer -= dt;
        if (this.tickTimer > 0) {
            return;
        }

        this.tickTimer += 1;

        let timestampHM = appContext.getUxManager().gameInfo.lastHardModeTimestamp;

        if (timestampHM) {
            let delta = Date.now() - timestampHM;
            if (delta >= cdDianFeng) {
                this.btnMatchModeTimer.string = "";
            } else {
                this.btnMatchModeTimer.string = DataUtil.getCountDownHMSStringByMS(cdDianFeng - delta);
            }
        }

        let timestampNM = appContext.getUxManager().gameInfo.fatigueTimestamp;

        if (timestampNM) {
            let delta2 = Date.now() - timestampNM;
            if (delta2 >= 60000) {
                this.btnNormalModeTimer.string = "";
            } else {
                this.btnNormalModeTimer.string = DataUtil.getCountDownHMSStringByMS(60000 - delta2);
            }
        }
    },

    onCloseAllDialogs: function () {
        // if (!this.btnMatchMode.active) {
        //     this.scheduleOnce(function () {

        //     }, 0);
        // }
    },

    buildAnim: function () {
        if (this.btnMatchMode.active) {
            debug.log("buildAnim return!");
            return; true
        }

        let btnMatchModeX = -50;

        // let canEnterHardMode = appContext.getUxManager().playedTimes > 1;
        // if (!canEnterHardMode) {
        //     let userInfo = appContext.getUxManager().getUserInfo();
        //     let grade = Grade.getGradeAndFillInfoByScore(userInfo.basic.currentScore).grade;
        //     if (grade >= 2) {
        //         canEnterHardMode = true;
        //     }
        // }

        if (true) {
            // if (canEnterHardMode) {
            this.btnHardMode.active = true;
            let btnHardModeY = this.btnHardMode.y;
            let btnHardModeAction = cc.moveTo(0.5, 70, btnHardModeY).easing(cc.easeCubicActionOut());
            let btnHardModeSequence = cc.sequence(cc.delayTime(0.1), btnHardModeAction);
            this.btnHardMode.runAction(btnHardModeSequence);

            this.btnMatchModeTimer.string = "";
            this.tickTimer = 0;
        } else {
            btnMatchModeX = 0;
            this.btnHardMode.active = false;
            this.btnHardMode.scale = 0.9;
            this.btnMatchMode.y = this.btnMatchMode.y - 10;
        }

        // 随机匹配左移动画
        this.btnMatchMode.active = true;
        let btnMatchModeY = this.btnMatchMode.y;
        let btnMatchModeAction = cc.moveTo(0.5, btnMatchModeX, btnMatchModeY).easing(cc.easeCubicActionOut());
        let finishCallback = cc.callFunc(function () {
            this.onBuildAnimDone();
        }, this);
        let btnMatchModeSequence = cc.sequence(cc.delayTime(0.1), btnMatchModeAction, finishCallback);
        this.btnMatchMode.runAction(btnMatchModeSequence);
    },

    onBuildAnimDone: function () {
        // 如果有需要在动画完毕后的执行某些操作，可以放在这里
        this.playUserInfoAction();
        this.showPromo();
    },

    // 播放用户信息栏动画
    playUserInfoAction: function () {
        if (this.playerInfoBoard.node.active) {
            return;
        }

        this.playerInfoBoard.node.active = true;
        let positionX = this.playerInfoBoard.node.x;
        let action1 = cc.moveTo(1.5, positionX, 483).easing(cc.easeElasticOut());
        let finishCallback = cc.callFunc(function () {
            this.swingTime = 0;
        }, this);
        let sequence = cc.sequence(action1, finishCallback);
        this.playerInfoBoard.node.runAction(sequence);
    },

    autoShowDialogs: function () {
        appContext.getDialogManager().fireQueuedDialogs();
    },

    // 点击"随机匹配"
    onClickBtnMatch: function () {
        appContext.getSoundManager().playBtn();
        let timestampNM = appContext.getUxManager().gameInfo.fatigueTimestamp;

        if (timestampNM) {
            let delta2 = Date.now() - timestampNM;
            if (delta2 < 60000) {
                let self = this;

                let info = {
                    content: "连续下棋极易走火入魔\n请稍息片刻再战\n\n也可看一个视频，立即匹配并获得20金币",
                };
                info.btn1 = {
                    clickFunction: function () {
                        self.showVideo();
                    },
                };
                info.btn2 = {
                };
                info.hideCloseBtn = true;
                appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, info);
                return;
            }
        }

        appContext.getDialogManager().showDialog(DialogTypes.Match);
    },

    showVideo() {
        let self = this;
        WechatAPI.videoAdUtil.updateCb({
            failCb: function () {
                appContext.getAnalyticManager().sendALD("ad_normalmode_fail");
                appContext.getAnalyticManager().sendTT('videoAd_normalmode', {
                    res: 1,
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "请稍后重试");
            },
            finishCb: function () {
                appContext.getAnalyticManager().sendALD("ad_normalmode_ok");
                appContext.getAnalyticManager().sendTT('videoAd_normalmode', {
                    res: 0,
                });

                appContext.getSoundManager().playUseGold();

                let reward = [{ type: "Gold", count: 20 }];
                appContext.getUxManager().rewardItems(reward);

                appContext.getDialogManager().showDialog(DialogTypes.Match);
                appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, "获得20金币并开始匹配！");
            },
            ceaseCb: function () {
                appContext.getAnalyticManager().sendALD("ad_normalmode_cease");
                appContext.getAnalyticManager().sendTT('videoAd_normalmode', {
                    res: 2,
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "看完后可以立即匹配并获得20金币");
            },
            caller: self,
        });

        WechatAPI.videoAdUtil.show();
    },

    // 点击"随机匹配"
    onClickBtnHardModeMatch: function () {
        //TODO 看广告 ，可以看广告立即匹配
        appContext.getSoundManager().playBtn();
        let canWatchAd = WechatAPI.videoAdUtil && WechatAPI.videoAdUtil.canPlay();
        if (canWatchAd && !debug.extraSettings.global) {
            let hasUnlocked = appContext.getUxManager().gameInfo.hasUnlockedHardModeMatch;
            if (!hasUnlocked) {
                let self = this;

                let info = {
                    content: "看一个视频即可永久解锁【巅峰对决】模式",
                };
                info.btn1 = {
                    clickFunction: function () {
                        self.showVideoUnlockHardMode();
                    },
                };

                appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, info);
                return;
            }
        }

        let timestamp = appContext.getUxManager().gameInfo.lastHardModeTimestamp;

        if (timestamp) {
            let delta = Date.now() - timestamp;
            if (delta < cdDianFeng) {
                let self = this;

                let info = {
                    content: "看一个视频，立即进行【巅峰对决】的匹配？",
                };
                info.btn1 = {
                    clickFunction: function () {
                        self.showVideoHardMode();
                    },
                };
                info.btn2 = {
                };
                info.hideCloseBtn = true;
                appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, info);
                return;
            }
        }

        this.startHardModeMatch();
    },

    startHardModeMatch() {
        appContext.getDialogManager().showDialog(DialogTypes.Match, true);
    },

    showVideoUnlockHardMode() {
        let self = this;
        WechatAPI.videoAdUtil.updateCb({
            failCb: function () {
                appContext.getAnalyticManager().sendALD("ad_unlockHardmode_fail");
                appContext.getAnalyticManager().sendTT('videoAd_unlockHardmode', {
                    res: 1,
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "请稍后重试");
            },
            finishCb: function () {
                appContext.getAnalyticManager().sendALD("ad_unlockHardmode_ok");
                appContext.getAnalyticManager().sendTT('videoAd_unlockHardmode', {
                    res: 0,
                });
                this.unlockHardModeMatch();
            },
            ceaseCb: function () {
                appContext.getAnalyticManager().sendALD("ad_unlockHardmode_cease");
                appContext.getAnalyticManager().sendTT('videoAd_unlockHardmode', {
                    res: 2,
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "看完后可以立即解锁");
            },
            caller: self,
        });

        WechatAPI.videoAdUtil.show();
    },

    unlockHardModeMatch() {
        appContext.getUxManager().gameInfo.hasUnlockedHardModeMatch = true;
        appContext.getUxManager().saveGameInfo();
        let self = this;

        let info = {
            content: "您已永久解锁【巅峰对决】，是否立尝试匹配？",
        };
        info.btn1 = {
            clickFunction: function () {
                self.startHardModeMatch();
            },
        };
        info.btn2 = {
        };
        info.hideCloseBtn = true;
        appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, info);
    },

    showVideoHardMode() {
        let self = this;
        WechatAPI.videoAdUtil.updateCb({
            failCb: function () {
                appContext.getAnalyticManager().sendALD("ad_hardmode_fail");
                appContext.getAnalyticManager().sendTT('videoAd_hardmode', {
                    res: 1,
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "请稍后重试");
            },
            finishCb: function () {
                appContext.getAnalyticManager().sendALD("ad_hardmode_ok");
                appContext.getAnalyticManager().sendTT('videoAd_hardmode', {
                    res: 0,
                });
                this.startHardModeMatch();
            },
            ceaseCb: function () {
                appContext.getAnalyticManager().sendALD("ad_hardmode_cease");
                appContext.getAnalyticManager().sendTT('videoAd_hardmode', {
                    res: 2,
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "看完后可以立即匹配");
            },
            caller: self,
        });

        WechatAPI.videoAdUtil.show();
    },

    onClickBtnHardModeMatchQuestion: function () {
        //TODO
        //看广告，说明5倍积分
        appContext.getSoundManager().playBtn();
        let info = {
            content: "在【巅峰对决】模式\n您可以不受自身段位的影响\n优先匹配到段位最高的对手\n获胜得到的积分较多\n失败损失的积分较少\n\n每匹配一次，需要休息较长的时间",
        };
        info.hideCloseBtn = true;
        appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, info);

    },

    // 点击"排行"
    onClickBtnRank: function () {
        appContext.getSoundManager().playBtn();
        appContext.getDialogManager().showDialog(DialogTypes.Rank);
    },

    // 点击"设置"
    onClickBtnSetting: function () {
        appContext.getSoundManager().playBtn();
        appContext.getDialogManager().showDialog(DialogTypes.GameSetting);
    },

    onClickBtnCheckin: function () {
        this.redDot_checkin.active = false;
        appContext.getSoundManager().playBtn();
        appContext.getDialogManager().showDialog(DialogTypes.Checkin);
    },

    onClickBtnShop: function () {
        this.redDot_shop.active = false;
        appContext.getSoundManager().playBtn();
        appContext.getDialogManager().showDialog(DialogTypes.Shop);
    },

    onClickReset() {
        if (debug.enableLog) {
            appContext.getUxManager().resetGameInfo();
        }
    },

    onClickProfil() {
        appContext.getSoundManager().playBtn();
        appContext.getDialogManager().showDialog(DialogTypes.PlayerInfo);
    },

    onPlayerInfoDialogHide() {
        this.playerInfoBoard.setup(appContext.getUxManager().getUserInfo());
    },

    createFollowBtn() {
        if (!WechatAPI.isTT) {
            return;
        }

        //console.log(WechatAPI.followBtn);
        // console.log("关注按钮");
        // console.log(typeof tt.checkFollowState);
        // console.log(typeof tt.createFollowButton);
        if (WechatAPI.followBtn == null && typeof tt.checkFollowState == "function" && typeof tt.createFollowButton == "function") {
            tt.checkFollowState({
                success(res) {
                    console.log(res.result);//true 为已关注，false 为未关注

                    let ratio = WechatAPI.deviceManager.getPixelRatio(); //0.33
                    let gameSize = WechatAPI.deviceManager.getCanvasSize(); //w640 h 1386

                    if (res != null && !res.result) {
                        const btn = tt.createFollowButton({
                            type: "image",
                            image: "customRes/follow.png",
                            style: {
                                left: 10 * ratio,
                                //   left: gameSize.width * ratio - 80 * ratio,
                                top: gameSize.height * 0.5 * ratio - 295 * ratio,
                                width: 70 * ratio,
                                height: 70 * ratio,
                                lineHeight: 40,
                                backgroundColor: "#00000000",
                                borderWidth: 0,
                                textColor: "#ffffff",
                                textAlign: "center",
                                fontSize: 16,
                                borderRadius: 0
                            },
                            data: {

                            }
                        });

                        btn.onTap(res => {
                            if (res.errCode === 0) {
                                btn.destroy();
                            } else {
                                console.log(res);
                            }
                        });

                        WechatAPI.followBtn = btn;
                    }
                }
            })
        }
    },

    showPromo() {
        if (WechatAPI.isTT) {
            this.createFollowBtn();

            //let promoInfo = debug.getPromoList();
            if (WechatAPI.hasTTRawMoreGame) {
                if (WechatAPI.PoorTTBtn) {
                    WechatAPI.PoorTTBtn.show();
                }
            }

            if (WechatAPI.hasTTNewMoreGame && WechatAPI.systemInfo.platform != 'ios') {//ios不支持互跳
                //this.btnPromo.active = false;

                let hotObj = cc.instantiate(this.promoPrefab);
                hotObj.parent = this.node;
                hotObj.x = 265;
                hotObj.y = 240;
                this.hotPromo = hotObj.getComponent("PromoItem");
                this.hotPromo.setHotStyleTT();
            }
        }
    },

    setHouse(userInfo) {
        let grade = Grade.getGradeAndFillInfoByScore(userInfo.basic.currentScore).grade;
        this.house.opacity = 0;
        if (grade > 8) {
            this.house.spriteFrame = this.house5;
            this.housePhrase = "您的居所 【棋圣阁】\n对局获得金币+40%\n\n已达最高等级";
        } else if (grade > 6) {
            this.house.spriteFrame = this.house4;
            this.housePhrase = "您的居所 【一心坊】\n对局获得金币+30%\n\n达到【超神九段】\n可升级到【棋圣阁】";
        } else if (grade > 4) {
            this.house.spriteFrame = this.house3;
            this.housePhrase = "您的居所 【聚贤楼】\+对局获得金币20%\n\n达到【如臻七段】\n可升级到【一心坊】";
        } else if (grade > 2) {
            this.house.spriteFrame = this.house2;
            this.housePhrase = "您的居所 【简雅居】\n对局获得金币+10%\n\n达到【大成五段】\n可升级到【聚贤楼】";
        } else {
            this.house.spriteFrame = this.house1;
            this.housePhrase = "您的居所 【陋室】\n对局获得金币+0%\n\n达到【小成三段】\n可升级到【简雅居】";
        }

        this.house.node.runAction(cc.fadeTo(2, 255));
        if (appContext.getUxManager().gameInfo.hasClickedHouse) {

        } else {
            this.housePuddingComp.enabled = true;
        }
    },

    setRedDots() {
        let res = appContext.getUxManager().todayCheckedin();
        if (res) {
            let canDoubleCheckin = appContext.getUxManager().gameInfo.checkinTodayTimes == 1;
            if (canDoubleCheckin) {
                //看广告可领第二次

                this.redDot_checkin.active = true;
            } else {
                //已签到
                this.redDot_checkin.active = false;
            }

        } else {
            //今天可领签到奖励
            this.redDot_checkin.active = true;
        }

        if (!appContext.getUxManager().canUseRandomCard() && !appContext.getUxManager().canUseRandomGold()) {
            this.redDot_shop.active = false;
        } else {
            this.redDot_shop.active = true;
        }
    },

    onClickHouse() {
        if (!appContext.getUxManager().gameInfo.hasClickedHouse) {
            this.house.node.scaleX = 0.5;
            this.house.node.scaleX = 0.5;
            this.housePuddingComp.enabled = false;
            appContext.getUxManager().gameInfo.hasClickedHouse = true;
            appContext.getUxManager().saveGameInfo();
        }

        appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, this.housePhrase);
    },
});