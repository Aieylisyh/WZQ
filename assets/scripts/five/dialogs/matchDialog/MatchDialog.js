let DummyPicker = require("DummyPicker");
let DialogTypes = require("DialogTypes");
let PlayerInfo = require("PlayerInfo");

cc.Class({
    extends: require("BaseDialog"),

    properties: {
        selfInfo: PlayerInfo,

        oppoInfo: PlayerInfo,

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

        matchPhrase: cc.Node,

        matchHardModePhrase: cc.Node,
    },

    show: function (isHardMode) {
        this.isHardMode = isHardMode;
        this.matchPhrase.active = !isHardMode;
        this.matchHardModePhrase.active = isHardMode;

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
    },

    runCustomAction: function () {
        let action1 = cc.moveTo(0.2, 0, this.selfPlayerNode.y);
        this.selfPlayerNode.runAction(action1);

        let action2 = cc.moveTo(0.2, 0, this.opponentPlayerNode.y);
        this.opponentPlayerNode.runAction(action2);
    },

    onAnimComplete: function () {
        this.selfInfo.setup(appContext.getUxManager().getUserInfo());
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
        let info = DummyPicker.matchOpponent(this.isHardMode);
        debug.log("已经匹配到对手");
        debug.log(info);
        this.cancelBtn.active = false;

        if (info.success) {
            if (this.isHardMode) {
                appContext.getUxManager().gameInfo.lastHardModeTimestamp = Date.now();
                appContext.getUxManager().saveGameInfo();
            }
            appContext.getSoundManager().playStartRound();

            this.hasMatchedOpponent = true;
            this.matchVsTag.node.active = true;
            this.matchVsTag.fastShowUp();
            this.questionNode.active = false;

            this.opponent = info.dummyPlayer;
            this.scheduleOnce(function () {
                this.oppoInfo.setup(this.opponent);
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
            appContext.getDialogManager().showDialog(DialogTypes.Toast, "匹配失败\n请重试");
            this.scheduleOnce(function () {
                this.hide();
                appContext.getAppController().clearGameData();
            }, 2);
        }
    },

    requireOpponenetInfo: function () {
        this.opponent = null;

        this.scheduleOnce(function () {
            this.onMatchedOpponent();
        }, this.getMatchTime());
    },

    getMatchTime() {
        let time = 0.5 + Math.random() * 2;
        if (this.isHardMode) {
            time = 2 + Math.random() * 3;
        }

        let d = new Date();
        let h = d.getHours();
        if (h < 7 && h > 0) {
            //1~6 very slow
            time = time * 2 + 4;
        } else if (h < 11) {
            //6~11  slow
            time = time * 1.5 + 2;
        } else if (h < 14) {
            //11~14  middle
            time = time * 1.2 + 0.5;
        } else if (h < 18) {
            //15~18 quick
            time = time * 1 + 1.5;
        } else {
            //very quick
        }
        return time;
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
        appContext.getSoundManager().playBtn();
        this.hide();
        appContext.getAppController().clearGameData();
    },
});