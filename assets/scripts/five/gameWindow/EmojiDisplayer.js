cc.Class({
    extends: cc.Component,

    properties: {
        duration: 4,

        sp: cc.Sprite,

        targetX: 100,

        targetY: 100,

        startX: 0,

        startY: 0,
    },

    update: function (dt) {
        if (this.playing) {
            if (this.timer < 0) {
                this.hide();
            } else {
                this.timer -= dt;
            }
        }
    },

    play: function (sf) {
        this.sp.spriteFrame = sf;
        this.node.active = true;

        this.reset();
        let action1 = cc.scaleTo(1.5, 1.25, 1.25);
        let action2 = cc.moveTo(1.5, this.targetX, this.targetY);
        this.node.runAction(cc.spawn(action1, action2));
        this.timer = this.duration;
        this.playing = true;
    },

    hide: function () {
        this.reset();
        this.playing = false;
        this.node.active = false;
    },

    reset() {
        this.node.stopAllActions();
        this.node.scale = 1;
        this.node.x = this.startX;
        this.node.y = this.startY;
    },

});
