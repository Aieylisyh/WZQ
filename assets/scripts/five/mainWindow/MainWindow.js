let DialogTypes = require("DialogTypes");
let Grade = require("Grade");
let DataUtil = require('DataUtil');
let Item = require('Item');
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

        house: cc.Sprite,

        housePuddingComp: require("Pudding"),

        house1: cc.SpriteFrame,

        house2: cc.SpriteFrame,

        house3: cc.SpriteFrame,

        house4: cc.SpriteFrame,

        house5: cc.SpriteFrame,

        redDot_shop: cc.Node,

        redDot_checkin: cc.Node,

        redDot_house: cc.Node,

        btnMatchModeTimer: cc.Label,

        btnNormalModeTimer: cc.Label,

        bottomBtns: cc.Node,

        btnDaily: cc.Node,
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
        //debug.log("mw自主初始化 checkLoginFinish");
        if (appContext.getUxManager().loginFinished) {
            //debug.log("ok");
            this.onLoginFinish();
        }
    },

    onLoginFinish() {
        if (this.setupLoginFinish) {
            let userInfo = appContext.getUxManager().getUserInfo();
            this.playerInfoBoard.setup(userInfo, true);
            this.setHouse(userInfo);
            return;
        }

        this.setupLoginFinish = true;
        this.buildWindow();
    },

    buildWindow() {
        this.bottomBtns.active = true;

        this.buildAnim();
        appContext.getUxManager().tryTriggerFatigue();
        let userInfo = appContext.getUxManager().getUserInfo();
        this.playerInfoBoard.setup(userInfo, true);
        this.playerInfoBoard.notifyClick();
        this.setHouse(userInfo);
        this.setRedDots();
        this.tickTime = 1;
        if (this.node && WechatAPI.isWx || WechatAPI.isTT || WechatAPI.isMZ || WechatAPI.isUC || WechatAPI.isYY) {
            WechatAPI.bannerAdUtil && WechatAPI.bannerAdUtil.reload();
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

        //暂时不加
        // let timestampNM = appContext.getUxManager().gameInfo.fatigueTimestamp;

        // if (timestampNM) {
        //     let delta2 = Date.now() - timestampNM;
        //     if (delta2 >= 60000) {
        //         this.btnNormalModeTimer.string = "";
        //     } else {
        //         this.btnNormalModeTimer.string = DataUtil.getCountDownHMSStringByMS(60000 - delta2);
        //     }
        // }
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

        if (!debug.extraSettings.global) {
            //this.btnDaily.active = WechatAPI.videoAdUtil && WechatAPI.videoAdUtil.canPlay();
            this.btnDaily.active = false;
        } else {
            this.btnDaily.active = false;
        }
        //this.btnDaily.active =  appContext.getUxManager().isValidDailyRewardClaimedDay();
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
        //暂时去掉普通难度的冷却时间机制
        // let timestampNM = appContext.getUxManager().gameInfo.fatigueTimestamp;

        // if (timestampNM) {
        //     let delta2 = Date.now() - timestampNM;
        //     if (delta2 < 60000) {
        //         let self = this;

        //         let info = {
        //             content: "连续下棋极易走火入魔\n请稍息片刻再战\n\n也可看一个视频，立即匹配并获得20金币",
        //         };
        //         info.btn1 = {
        //             clickFunction: function () {
        //                 self.showVideo();
        //             },
        //         };
        //         info.btn2 = {
        //         };
        //         info.hideCloseBtn = true;
        //         appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, info);
        //         return;
        //     }
        // }

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
                    adIcon: true,
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

                // let info = {
                //     content: "看一个视频，立即进行【巅峰对决】的匹配？",
                // };
                // info.btn1 = {
                //     clickFunction: function () {
                //         self.showVideoHardMode();
                //     },
                // };
                let info = {
                    content: "用80金币加速，立即进行【巅峰对决】的匹配？",
                };
                info.btn1 = {
                    clickFunction: function () {
                        self.tryBuyHardModeAccess();
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

    tryBuyHardModeAccess() {
        if (appContext.getUxManager().useGold(80)) {
            appContext.getSoundManager().playUseGold();
            this.startHardModeMatch();
        } else {
            let canLure = false;
            if (appContext.getUxManager().canUseRandomGold()) {
                let canWatchAd = WechatAPI.videoAdUtil && WechatAPI.videoAdUtil.canPlay();
                if (canWatchAd) {
                    canLure = true;
                }
            }

            if (canLure) {
                let info = {
                    adIcon: true,
                    content: "金币不足\n看个广告即可获得大量金币",
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
            } else {
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "金币不足");
            }
        }
    },

    startwatchAdReward() {
        this.watchAdReward(function () {
            appContext.getSoundManager().playUseGold();
            let count = Math.floor(Math.random() * 41 + 80);
            this.giveReward([{ type: "Gold", count: count }], false);
            appContext.getUxManager().useRandomGold();
        }, this);
    },

    watchAdReward(funcSuc, caller) {
        let self = this;
        WechatAPI.videoAdUtil.updateCb({
            failCb: function () {
                appContext.getAnalyticManager().sendALD("ad_shop_fail");
                appContext.getAnalyticManager().sendTT('videoAd_shop', {
                    res: 1,
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "抽取失败，请稍候重试");
            },
            finishCb: function () {
                appContext.getAnalyticManager().sendALD("ad_shop_ok");
                appContext.getAnalyticManager().sendTT('videoAd_shop', {
                    res: 0,
                });
                funcSuc.call(caller);
            },
            ceaseCb: function () {
                appContext.getAnalyticManager().sendALD("ad_shop_cease");
                appContext.getAnalyticManager().sendTT('videoAd_shop', {
                    res: 2,
                });
                appContext.getDialogManager().showDialog(DialogTypes.Toast, "看完后可以抽取");
            },
            caller: self,
        });

        WechatAPI.videoAdUtil.show();
    },

    giveReward(reward, isBuyOrLottery = true) {
        appContext.getUxManager().rewardItems(reward);
        let text = Item.getTextByItem(reward);
        let text1 = isBuyOrLottery ? "购买" : "获取";
        appContext.getDialogManager().showDialog(DialogTypes.ConfirmBox, text1 + "成功\n获得: " + text);
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
            content: "在【巅峰对决】模式\n可以匹配到高段位的对手\n获胜得到积分较多\n失败损失积分较少\n\n每次匹配后\n要休息较长的时间",
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
        console.log("关注按钮");
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

        if (!appContext.getUxManager().gameInfo.hasClickedHouse || Math.random() > 0.9) {
            this.redDot_house.active = true;
        }
    },

    onClickHouse() {
        this.redDot_house.active = false;
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