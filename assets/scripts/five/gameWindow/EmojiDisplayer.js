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

        this.node.stopAllActions();
        let action1 = cc.scaleTo(2, 1, 1);
        let action2 = cc.moveTo(2, this.targetX, this.targetY).easing(cc.easeActionIn());
        this.node.runAction(cc.spawn(action1, action2));
        this.timer = this.duration;
        this.playing = true;
    },

    hide: function () {
        this.playing = false;
        this.node.scale = 1;
        this.node.x = this.startX;
        this.node.y = this.startY;
        this.node.active = false;
    },
});
