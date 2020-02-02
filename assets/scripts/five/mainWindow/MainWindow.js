let DialogTypes = require("DialogTypes");

cc.Class({
    extends: cc.Component,

    properties: {
        btnMatchMode: cc.Node,

        blockSF: cc.SpriteFrame,

        btnRank: cc.Node,

        btnSetting: cc.Node,

        playerInfoBoard: require("PlayerInfo"),
    },

    start: function () {
        this.node.on("CloseAllDialogs", this.onCloseAllDialogs, this);

        this.autoShowDialogs();

        this.playerInfoBoard.setup(appContext.getUxManager().getUserInfo());

        appContext.getSoundManager().startBackgroundMusic();

        this.createFollowBtn();
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
        let btnMatchModeAction = cc.moveTo(0.5, -9, btnMatchModeY).easing(cc.easeCubicActionOut());
        let finishCallback = cc.callFunc(function () {
            this.playBtnMatchModeEffect();
        }, this);
        let btnMatchModeSequence = cc.sequence(cc.delayTime(0.1), btnMatchModeAction, finishCallback);
        this.btnMatchMode.runAction(btnMatchModeSequence);

        // 敬请期待左移动画
        // this.btnTodo.active = true;
        // let btnTodoY = this.btnTodo.y;
        // let btnTodoAction = cc.moveTo(0.5, -9, btnTodoY).easing(cc.easeCubicActionOut());
        // this.btnTodo.runAction(btnTodoAction);

        // 排行榜动画
        // this.btnRank.active = true;
        // let btnRankX = this.btnRank.x + 700;
        // let btnRankAction = cc.moveTo(0.5, btnRankX, -313);
        // this.btnRank.runAction(cc.sequence(cc.delayTime(0.4), btnRankAction));

        // 设置动画
        // this.btnSetting.active = true;
        // let btnSettingX = this.btnSetting.x + 700;
        // let btnSettingAction = cc.moveTo(0.5, btnSettingX, -313);
        // this.btnSetting.runAction(cc.sequence(cc.delayTime(0.3), btnSettingAction));
    },

    playBtnMatchModeEffect: function () {
        let finishCallback = cc.callFunc(function () {
            this.onBuildAnimDone();
        }, this);

        this.btnMatchMode.runAction(finishCallback);
    },

    // TODO
    onBuildAnimDone: function () {
        // 如果有需要在动画完毕后的执行某些操作，可以放在这里

        this.playUserInfoAction();
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

    // 点击"随机匹配"todo
    onClickBtnMatch: function () {
        appContext.getSoundManager().playBtn();
        appContext.getDialogManager().showDialog(DialogTypes.Match);
    },

    // 点击"敬请期待"
    onClickBtnTodo: function () {
        // debug.log("敬请期待");
        appContext.getSoundManager().playBtn();
        appContext.getDialogManager().showDialog(DialogTypes.Toast, "棋局变化万千，棋手连续下棋，极易走火入魔，不知此诸境界，乃自己心识所变现之幻象，日益执著，而导致精神失常，此即所谓的“入魔”");
    },

    // 点击"排行"todo
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
        appContext.getSoundManager().playBtn();
        appContext.getDialogManager().showDialog(DialogTypes.Checkin);
    },

    onClickBtnShop: function () {
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
        if (WechatAPI.isTT) {
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
                                left: gameSize.width * ratio - 88 * ratio,
                                top: gameSize.height * 0.5 * ratio - 20 * ratio,
                                width: 82 * ratio,
                                height: 82 * ratio,
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
});
