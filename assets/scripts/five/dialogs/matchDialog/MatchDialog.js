let GameUtil = require("GameUtil");
let DummyPicker = require("DummyPicker");

cc.Class({
    extends: require("BaseDialog"),

    properties: {
        selfIcon: cc.Sprite,

        selfNickname: cc.Label,

        opponentIcon: cc.Sprite,

        opponentNickname: cc.Label,

        selfPlayerNode: cc.Node,

        cancelBtn: cc.Node,

        opponentPlayerNode: cc.Node,

        matchVsTag: require("VibrateButton"),

        opponentPlayerAnim: require("VibrateButton"),

        questionNode: cc.Node,

        showQuestionTime: 0.3,

        hideQuestionTime: 0.3,

        lineContainers: [require("LineContainer")],

        animationTime: 0,

        _selfPlayerActionX: -750,

        _opponentPlayerActionX: 750,
    },

    show: function () {
        this.bgOpacity = 210;
        this.reset();

        this.fadeInBackground();
        this.runCustomAction();
    },

    update: function (dt) {
        if (this._isAnimComplete) {
            if (!this.hasMatchedOpponent) {
                this.blinkQuestion(dt);
                this.moveLines(dt);
            }
        }
    },

    reset: function () {
        this.globalSpeed = 0;
        this.showQuestionTimer = 0;
        this.hideQuestionTimer = 0;
        this.questionNode.active = false;
        this.matchVsTag.node.active = false;
        this.opponentNickname.string = "正在寻找对手";
    },

    runCustomAction: function () {
        let action1 = cc.moveTo(0.2, 0, this.selfPlayerNode.y);
        this.selfPlayerNode.runAction(action1);

        let action2 = cc.moveTo(0.2, 0, this.opponentPlayerNode.y);
        this.opponentPlayerNode.runAction(action2);
    },

    onAnimComplete: function () {
        this.setSelfPlayerInfo();
        this.requireOpponenetInfo();

        this.startLinesAnimation();
    },

    moveLines: function (dt) {
        this.setLinesGlobalSpeed(dt);
    },

    startLinesAnimation: function () {
        this.animationTime = 0;

        for (let i = 0; i < this.lineContainers.length; i++) {
            this.lineContainers[i].startLinesAnimation(0);
        }
    },

    stopLinesAnimation: function () {
        for (let i = 0; i < this.lineContainers.length; i++) {
            this.lineContainers[i].stopLinesAnimation(0);
        }
    },

    setLinesGlobalSpeed: function (dt) {
        let globalSpeed = 0;

        if (this.animationTime < 0.6) {
            globalSpeed = this.animationTime * 3;
        } else {
            globalSpeed = 1.8;
        }

        this.animationTime += dt;

        for (let i = 0; i < this.lineContainers.length; i++) {
            this.lineContainers[i].setGlobalSpeed(globalSpeed);
        }
    },

    // 已经匹配到对手
    onMatchedOpponent: function () {
        let info = DummyPicker.matchOpponent();
        debug.log("已经匹配到对手");
        debug.log(info);
        this.cancelBtn.active = false;

        if (info.success) {
            this.hasMatchedOpponent = true;
            // this.matchVsTag.node.active = true;
            // this.matchVsTag.fastShowUp();
            this.questionNode.active = false;

            this.opponent = info.dummyPlayer;
            this.scheduleOnce(function () {
                this.setOpponentInfo();
                this.opponentPlayerAnim.shake();
            }, 0.25);

            let gameManager = appContext.getGameManager();
            let selfPlayer = gameManager.getSelfPlayer();
            debug.log(selfPlayer);
            debug.log(this.opponent);
            gameManager.createGame(selfPlayer, this.opponent, Math.random(), {});//player1, player2, randomSeed, gameConfig

            this.stopLinesAnimation();

            if (!this.hasStartedPlay) {
                this.hasStartedPlay = true;
                this.scheduleOnce(function () {
                    this.startPlayGame();
                }, 2);
            }
        } else {
            //TODO 匹配失败
        }
    },

    setSelfPlayerInfo: function () {
        let selfInfo = appContext.getUxManager().getUserInfo();
        this.selfNickname.string = selfInfo.basic.nickname;
        GameUtil.setHeadIcon(selfInfo.basic.headIconUrl, selfInfo.basic.headIconPath, this.selfIcon);
    },

    requireOpponenetInfo: function () {
        this.opponent = null;
        let time = 0.4 + Math.random() * 3.6;

        this.scheduleOnce(function () {
            this.onMatchedOpponent();
        }, time);
    },

    // 设置对手的昵称头像
    setOpponentInfo: function () {
        this.opponentNickname.string = this.opponent.basic.nickname;
        GameUtil.setHeadIcon(this.opponent.basic.headIconUrl, this.opponent.basic.headIconPath, this.opponentIcon);
    },

    // 开始下棋
    startPlayGame: function () {
        appContext.getAppController().toPlaying();
        appContext.getGameManager().setCurrentMatchMakingInfo({
            black: {
                isSelf: true,
            },
            white: {
                user: this.opponent,
            },
            timestamp: Date.now(),
        });
        let action1 = cc.fadeTo(0.6, 0);
        let action2 = cc.callFunc(function () {
            this.hide();
        }, this);
        let seq = cc.sequence(action1, action2);
        this.node.runAction(seq);

        let action3 = cc.moveTo(0.4, this._selfPlayerActionX, this.selfPlayerNode.y);
        this.selfPlayerNode.runAction(action3);
        let action4 = cc.moveTo(0.4, this._opponentPlayerActionX, this.opponentPlayerNode.y);
        this.opponentPlayerNode.runAction(action4);
    },

    // 间接显示对手头像的"?"图片
    blinkQuestion: function (dt) {
        if (this.showQuestionTimer < this.showQuestionTime) {
            this.showQuestionTimer += dt;

            if (this.showQuestionTimer >= this.showQuestionTime) {
                this.questionNode.active = false;
                this.hideQuestionTimer = 0;
            }
        } else {
            if (this.hideQuestionTimer < this.hideQuestionTime) {
                this.hideQuestionTimer += dt;

                if (this.hideQuestionTimer >= this.hideQuestionTime) {
                    this.questionNode.active = true;
                    this.showQuestionTimer = 0;
                }
            }
        }
    },

    onClickBtnCancel: function () {
        this.hide();
        appContext.getAppController().clearGameData();
    },
});