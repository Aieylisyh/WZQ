let ChessCheckerCrossWing = require("ChessCheckerCrossWing");

cc.Class({
    extends: cc.Component,

    properties: {
        leftWing: ChessCheckerCrossWing,

        rightWing: ChessCheckerCrossWing,

        upWing: ChessCheckerCrossWing,

        downWing: ChessCheckerCrossWing,

        updateTime: 0.1,
    },

    onEnable: function () {
        this.updateTimer = this.updateTime;
        this.upWing.reset();
        this.downWing.reset();
        this.leftWing.reset();
        this.rightWing.reset();
    },

    update(dt) {
        this.updateTimer -= dt;
        if (this.updateTimer < 0) {
            this.updateTimer += this.updateTime;
            this.upWing.step();
            this.downWing.step();
            this.leftWing.step();
            this.rightWing.step();
        }
    },
});