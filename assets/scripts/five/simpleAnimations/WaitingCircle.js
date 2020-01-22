cc.Class({
    extends: cc.Component,

    properties: {
        speed: 360,

        _restTimer: 0,

        _counter: 0,

        showNode: cc.Node,
    },

    start: function () {
        if (this.loop) {
            this.showNode.active = true;
        }
    },

    update: function (dt) {
        if (this._restTimer > 0) {
            this._restTimer -= dt;
            if (this._restTimer < 0) {
                this.hide();
            }
        }
    },

    show: function (duration = 15) {
        this._counter++;
        this._restTimer = duration;
        if (!this.showNode.active) {
            this.showNode.active = true;
            this.node.stopAllActions();
            let rotate = cc.rotateBy(1.5, 360).easing(cc.easeInOut(1.5));
            let scale1 = cc.scaleTo(0.5, 0.6);
            let scale2 = cc.scaleTo(1.0, 1);
            this.node.runAction(cc.spawn(rotate, cc.sequence(scale1, scale2)).repeatForever());
        }
    },

    hide: function () {
        this._counter--;
        if (this._counter <= 0) {
            this.showNode.active = false;
            this.node.stopAllActions();
        }
    },
});