let DummyPicker = require("DummyPicker");

cc.Class({
    extends: require("BaseDialog"),

    properties: {

        questionNode: cc.Node,

        showQuestionTime: 0.3,

        hideQuestionTime: 0.3,

        lineContainers: [require("LineContainer")],

        animationTime: 0,
    },

    show: function () {
        this.bgOpacity = 210;
        this.reset();
        this.fadeInBackground();
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
    },

    onAnimComplete: function () {
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

    OnClickEnter: function () {
        let info = DummyPicker.matchOpponent(false);
        appContext.getSoundManager().playStartRound();
        this.opponent = info.dummyPlayer;
        let gameManager = appContext.getGameManager();
        let selfPlayer = gameManager.getSelfPlayer();
        gameManager.createGame(selfPlayer, this.opponent, Math.random(), {});//player1, player2, randomSeed, gameConfig

        this.stopLinesAnimation();
        this.hide();
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