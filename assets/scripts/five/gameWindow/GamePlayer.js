cc.Class({
    extends: cc.Component,

    properties: {
        timerLabel: cc.Label,

        turnLabel: cc.Label,

        frame: cc.Node,

        playerinfo: require("PlayerInfo"),
    },

    start: function () {
        //this.onUserUpdate();
    },

    update: function (dt) {
        if (this.startTimer) {
            this.chessTimer -= dt;
            let ceilChessTimer = Math.ceil(this.chessTimer);
            if (ceilChessTimer < 0) {
                ceilChessTimer = 0;
                this.onPlayChessTimeOut();
            } else {
                if (this.getChessTurnTime() - ceilChessTimer > 10 && !this.flag_think1) {
                    this.flag_think1 = true;
                    appContext.getGameManager().playChat("think1");
                }

                if (this.getChessTurnTime() - ceilChessTimer > 20 && !this.flag_think2) {
                    this.flag_think2 = true;
                    appContext.getGameManager().playChat("think2");
                }

                if (this.getChessTurnTime() - ceilChessTimer > 30 && !this.flag_hurry) {
                    this.flag_hurry = true;
                    appContext.getGameManager().playChat("hurry");
                }
            }
            this.timerLabel.string = ceilChessTimer;
        }
    },

    setInfo(isSelf) {
        this.isSelf = isSelf;

        let user;
        if (isSelf) {
            user = appContext.getGameManager().game.selfPlayer;
        } else {
            user = appContext.getGameManager().game.opponentPlayer;
        }

        this.playerinfo.setup(user);
    },

    // 显示倒计时
    showTimer: function (isSelfRound) {
        this.frame.stopAllActions();
        let action = null;
        if (isSelfRound) {
            this.startTimer = true;
            this.chessTimer = this.getChessTurnTime();
            this.timerLabel.string = this.chessTimer;
            if (this.isSelf) {
                this.turnLabel.string = "-下棋中-";//我方
            } else {
                this.turnLabel.string = "-下棋中-";//敌方
            }
            action = cc.scaleTo(0.4, 1, 1).easing(cc.easeCubicActionOut());
        } else {
            this.startTimer = false;
            this.timerLabel.string = "";
            this.turnLabel.string = "-等待-";
            action = cc.scaleTo(0.4, 0.8, 0.8).easing(cc.easeCubicActionOut());
        }

        this.flag_think1 = false;
        this.flag_think2 = false;
        this.flag_hurry = false;
        this.frame.runAction(action);
    },

    reset: function () {
        this.startTimer = false;
        this.timerLabel.string = "";
        this.turnLabel.string = "";
        this.frame.scale = 0.9;
    },

    onPlayChessTimeOut: function () {
        this.startTimer = false;
        debug.log("下棋倒计时超时");
        appContext.getGameManager().playerWin(appContext.getGameManager().lastChessType, true);
        //appContext.getGameManager().playerWin(3 - appContext.getGameManager().lastChessType);
    },

    // todo根据段位重置倒计时
    getChessTurnTime: function () {
        return 40;
    },
});
