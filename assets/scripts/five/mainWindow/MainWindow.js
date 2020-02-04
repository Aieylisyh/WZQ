let DialogTypes = require("DialogTypes");
let Grade = require("Grade");

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

        house1: cc.SpriteFrame,

        house2: cc.SpriteFrame,

        house3: cc.SpriteFrame,

        house4: cc.SpriteFrame,

        house5: cc.SpriteFrame,

        redDot_shop: cc.Node,
        redDot_checkin: cc.Node,
    },

    start: function () {
        this.node.on("CloseAllDialogs", this.onCloseAllDialogs, this);

        this.autoShowDialogs();

        let userInfo = appContext.getUxManager().getUserInfo();
        this.playerInfoBoard.setup(userInfo);
        this.setHouse(userInfo);
        this.setRedDots();

        this.playerInfoBoard.notifyClick();
        appContext.getSoundManager().startBackgroundMusic();

        appContext.scheduleOnce(function () {
            if (this.node && WechatAPI.isWx || WechatAPI.isTT) {
                WechatAPI.bannerAdUtil && WechatAPI.bannerAdUtil.reload();
            }
        }, 3);
    },

    update: function (dt) {
        // 信息栏动画
        if (this.swingTime != null) {
            this.playerInfoBoard.node.x = Math.floor(Math.sin(this.swingTime * 1.5) * 220) * 0.1;
            this.swingTime += dt;
        }
    },

    onCloseAllDialogs: function () {
        if (!this.btnMatchMode.active) {
            this.scheduleOnce(function () {
                this.buildAnim();
            }, 0);
        }
    },

    buildAnim: function () {
        if (this.btnMatchMode.active) {
            debug.log("buildAnim return!");
            return;
        }

        // 随机匹配左移动画
        this.btnMatchMode.active = true;
        let btnMatchModeY = this.btnMatchMode.y;
        let btnMatchModeAction = cc.moveTo(0.5, -60, btnMatchModeY).easing(cc.easeCubicActionOut());
        let finishCallback = cc.callFunc(function () {
            this.onBuildAnimDone();
        }, this);
        let btnMatchModeSequence = cc.sequence(cc.delayTime(0.1), btnMatchModeAction, finishCallback);
        this.btnMatchMode.runAction(btnMatchModeSequence);

        let canEnterHardMode = true;//TODO
        if (canEnterHardMode) {
            this.btnHardMode.active = true;
            let btnHardModeY = this.btnHardMode.y;
            let btnHardModeAction = cc.moveTo(0.5, 60, btnHardModeY).easing(cc.easeCubicActionOut());
            let btnHardModeSequence = cc.sequence(cc.delayTime(0.1), btnHardModeAction);
            this.btnHardMode.runAction(btnHardModeSequence);
        }
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
        appContext.getDialogManager().showDialog(DialogTypes.Match);
    },

    // 点击"随机匹配"
    onClickBtnHardModeMatch: function () {
        //TODO
        //看广告，说明5倍积分
        appContext.getSoundManager().playBtn();
        appContext.getDialogManager().showDialog(DialogTypes.Match, true);
    },

    // 点击"敬请期待"
    onClickBtnTodo: function () {
        // debug.log("敬请期待");
        appContext.getSoundManager().playBtn();
        appContext.getDialogManager().showDialog(DialogTypes.Toast, "棋局变化万千，棋手连续下棋，极易走火入魔，不知此诸境界，乃自己心识所变现之幻象，日益执著，而导致精神失常，此即所谓的“入魔”");
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
        if (WechatAPI.followBtn == null && typeof tt.checkFollowState == "function" && typeof tt.createFollowButton == "function") {
            tt.checkFollowState({
                success(res) {
                    console.log(res.result);//true 为已关注，false 为未关注

                    let ratio = WechatAPI.deviceManager.getPixelRatio(); //0.33
                    let gameSize = WechatAPI.deviceManager.getCanvasSize(); //w640 h 1386

                    if (!res.result) {
                        const btn = tt.createFollowButton({
                            type: "image",
                            image: "customRes/follow.png",
                            style: {
                                left: 10 * ratio,
                                //   left: gameSize.width * ratio - 80 * ratio,
                                top: gameSize.height * 0.5 * ratio - 290 * ratio,
                                width: 75 * ratio,
                                height: 75 * ratio,
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

            if (WechatAPI.systemInfo.platform != 'ios') {
                if (WechatAPI.isTTPoor) {
                    if (WechatAPI.PoorTTBtn) {
                        debug.log("展示 PoorTTBtn");
                        WechatAPI.PoorTTBtn.show();
                    }
                    return;
                }

                if (this.btnPromo) {
                    this.btnPromo.active = true;
                }

                debug.log("创建 hotObj");
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
            this.housePhrase = "您的居所 【棋圣阁】\n已达最高等级";
        } else if (grade > 6) {
            this.house.spriteFrame = this.house4;
            this.housePhrase = "您的居所 【一心坊】\n达到段位九，以升级到【棋圣阁】";
        } else if (grade > 4) {
            this.house.spriteFrame = this.house3;
            this.housePhrase = "您的居所 【聚贤庄】\n达到段位七，以升级到【一心坊】";
        } else if (grade > 2) {
            this.house.spriteFrame = this.house2;
            this.housePhrase = "您的居所 【简雅居】\n达到段位五，以升级到【聚贤庄】";
        } else {
            this.house.spriteFrame = this.house1;
            this.housePhrase = "您的居所 【陋室】\n达到段位三，以升级到【简雅居】";
        }

        this.house.runAction(cc.fadeTo(2, 255));
    },

    setRedDots() {
        debug.log("红点");
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
        debug.log("this.redDot_checkin.active " + this.redDot_checkin.active);
        debug.log("this.redDot_shop.active " + this.redDot_shop.active);
    },

    onClickHouse() {
        appContext.getDialogManager().showDialog(DialogTypes.Toast, this.housePhrase);
    },
});