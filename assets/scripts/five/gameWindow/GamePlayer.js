let Grade = require("Grade");
let GameUtil = require("GameUtil");

cc.Class({
    extends: cc.Component,

    properties: {
        headIconImg: cc.Sprite,

        nicknameLabel: cc.Label,

        timerLabel: cc.Label,

        gradeLevelLabel: cc.Label,

        frame: cc.Node,
    },

    start: function () {
        this.onUserUpdate();
    },

    update: function (dt) {
        if (this.startTimer) {
            this.chessTimer -= dt;
            let ceilChessTimer = Math.ceil(this.chessTimer);
            if (ceilChessTimer < 0) {
                ceilChessTimer = 0;
                this.onPlayChessTimeOut();
            }
            this.timerLabel.string = ceilChessTimer;
        }
    },

    // 显示倒计时
    showTimer: function (isSelfRound) {
        this.frame.stopAllActions();
        let action = null;
        if (isSelfRound) {
            this.chessTimer = this.getChessTimerByGrade();
            this.timerLabel.string = this.chessTimer;
            this.timerLabel.node.active = true;
            this.startTimer = true;
            action = cc.scaleTo(0.3, 1, 1).easing(cc.easeCubicActionOut());
        } else {
            this.startTimer = false;
            this.timerLabel.string = "";
            this.timerLabel.node.active = false;
            action = cc.scaleTo(0.3, 0.8, 0.8).easing(cc.easeCubicActionOut());
        }

        this.frame.runAction(action);
    },

    reset: function () {
        this.startTimer = false;
        this.timerLabel.string = "";
        this.timerLabel.node.active = false;
        this.frame.scale = 0.8;
    },

    onPlayChessTimeOut: function () {
        this.startTimer = false;
        debug.log("下棋倒计时超时");
    },

    // todo根据段位重置倒计时
    getChessTimerByGrade: function () {
        let grade = null;
        return 30;
    },
});
