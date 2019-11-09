let LoadResPath = require("LoadResPath");
let GameUtil = require("GameUtil");
let DataKey = require("DataKey");
let DummyPicker = require("DummyPicker");

cc.Class({
    extends: require("BaseDialog"),

    properties: {
        selfIcon: cc.Sprite,

        selfNickname: cc.Label,

        opponentIcon: cc.Sprite,

        opponentNickname: cc.Label,

        selfPlayerNode: cc.Node,

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

    show: function() {
        this.bgOpacity = 210;
        this.reset();

        this.fadeInBackground();
        this.runCustomAction();
    },

    update: function(dt) {
        if (this._isAnimComplete) {
            if (!this.hasMatchedOpponent) {
                this.blinkQuestion(dt);
                this.moveLines(dt);
            }
        }
    },

    reset: function() {
        this.globalSpeed = 0;
        this.showQuestionTimer = 0;
        this.hideQuestionTimer = 0;
        this.questionNode.active = false;
        this.matchVsTag.node.active = false;
        this.opponentNickname.string = "正在寻找对手";
    },

    runCustomAction: function() {
        let action1 = cc.moveTo(0.2, 0, this.selfPlayerNode.y);
        this.selfPlayerNode.runAction(action1);

        let action2 = cc.moveTo(0.2, 0, this.opponentPlayerNode.y);
        this.opponentPlayerNode.runAction(action2);
    },

    onAnimComplete: function() {
        this.setSelfPlayerInfo();
        this.requireOpponenetInfo();

        this.startLinesAnimation();
    },

    moveLines: function(dt) {
        this.setLinesGlobalSpeed(dt);
    },

    startLinesAnimation: function() {
        this.animationTime = 0;

        for (let i = 0; i < this.lineContainers.length; i++) {
            this.lineContainers[i].startLinesAnimation(0);
        }
    },

    stopLinesAnimation: function() {
        for (let i = 0; i < this.lineContainers.length; i++) {
            this.lineContainers[i].stopLinesAnimation(0);
        }
    },

    setLinesGlobalSpeed: function(dt) {
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
    onMatchedOpponent: function(success, opponent) {
        if (success) {
            this.hasMatchedOpponent = true;
            // this.matchVsTag.node.active = true;
            // this.matchVsTag.fastShowUp();
            this.questionNode.active = false;

            this.opponentInfo = opponent;
            this.scheduleOnce(function() {
                this.setOpponentInfo();
                this.opponentPlayerAnim.shake();
            }, 0.2);

            let gameManager = appContext.getGameManager();
            gameManager.createGame(gameManager.selfPlayer, this.opponentInfo, Math.random(), {});

            this.stopLinesAnimation();

            if (!this.hasStartedPlay) {
                this.hasStartedPlay = true;
                this.scheduleOnce(function() {
                    this.startPlayGame();
                }, 1.5);
            }
        } else {
            //TODO 匹配失败
        }
    },

    setSelfPlayerInfo: function() {
        let selfPlayer = appContext.getGameManager().selfPlayer;
        this.selfNickname.string = selfPlayer.biography.nickName;
        let headUrl = selfPlayer.biography.image;
        let defaultIconPath = selfPlayer.biography.sex === 1 ? LoadResPath.ImgPath.boy_defaultHeadIcon : LoadResPath.ImgPath.girl_defaultHeadIcon
        GameUtil.setHeadIconImg(headUrl, this.selfIcon, defaultIconPath);
    },

    requireOpponenetInfo: function() {
        this.opponentInfo = null;

        let info = DummyPicker.matchOpponent();
        this.scheduleOnce(function() {
            this.onMatchedOpponent(info.success, info.dummyParam);
        }, info.time);
    },

    // 设置对手的昵称头像
    setOpponentInfo: function() {
        this.opponentNickname.string = this.opponentInfo.biography.nickName;
        let headUrl = this.opponentInfo.biography.image;
        let defaultIconPath = this.opponentInfo.biography.sex === 1 ? LoadResPath.ImgPath.boy_defaultHeadIcon : LoadResPath.ImgPath.girl_defaultHeadIcon;
        GameUtil.setHeadIconImg( /*headUrl*/ null, this.opponentIcon, defaultIconPath);
    },

    // 开始下棋
    startPlayGame: function() {
        appContext.getAppController().toPlaying();
        appContext.getGameManager().setCurrentMatchMakingInfo({
            black: {
                isSelf: true,
            },
            white: {
                isSelf: false,
                nickName: "傻",
                avatarUrl: "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83ep0TEW4icA1e7xicDvAUtra8vN2McN8Dk5LP7SYctmwv08FyfePPxLcA1jIibev1h20Riaiag6IhVGtLag/132",
                gender: 1,
                city: "合肥",
                grade: 1,
            },
            timestamp: Date.now(),
        });
        let action1 = cc.fadeTo(0.6, 0);
        let action2 = cc.callFunc(function() {
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
    blinkQuestion: function(dt) {
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

    onClickBtnCancel: function() {
        this.hide();
        appContext.getAppController().clearGameData();
    },
});