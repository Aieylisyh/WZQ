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

    SetBlack(b) {
        let col = b ? new cc.Color(0, 0, 0) :  new cc.Color(255, 255, 255);
        this.upWing.nodes.forEach(element => {
            element.color = col;
        });
        this.downWing.nodes.forEach(element => {
            element.color = col;
        });
        this.leftWing.nodes.forEach(element => {
            element.color = col;
        });
        this.rightWing.nodes.forEach(element => {
            element.color = col;
        });
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