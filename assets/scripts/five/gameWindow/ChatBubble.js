cc.Class({
    extends: cc.Component,

    properties: {
        duration: 4,

        label: cc.Label,

        frame: cc.Node,
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

    play: function (content) {
        this.node.stopAllActions();
        this.node.active = true;

        this.label.string = content;
        this.scaleToFit();
        let action = cc.scaleTo(1, 1, 1).easing(cc.easeElasticOut());

        this.node.runAction(action);
        this.playing = true;
        this.timer = this.duration;
    },

    scaleToFit: function () {
        this.scheduleOnce(function () {
            let w = Math.floor(this.label.node.width * this.label.node.scaleX);
            this.frame.width = w + 50;
        }, 0);
    },

    hide: function () {
        this.playing = false;
        this.node.scale = 0.5;
        this.node.active = false;
    },
});
